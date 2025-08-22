import {
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadCsvResponseDto } from './dto/upload-csv.dto';
import { ListDatasetsDto, ListDatasetsResponseDto } from './dto/list-datasets.dto';
import { GetCandlesDto, GetCandlesResponseDto } from './dto/get-candles.dto';
import { Timeframe } from '../lines/dto/get-top-lines.dto';
import * as fastCsv from 'fast-csv';
import { Readable } from 'stream';

interface CsvRow {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

interface CsvMeta {
  symbol?: string;
  timeframe?: Timeframe;
}

@Injectable()
export class DataService {
  constructor(private prisma: PrismaService) {}

  async uploadCsv(
    file: Express.Multer.File,
    symbol?: string,
    timeframe?: Timeframe,
  ): Promise<UploadCsvResponseDto> {
    // Validar tamaño del archivo (configurable por env)
    const maxRows = parseInt(process.env.MAX_CSV_ROWS || '1000000');

    // Extraer metadata del CSV
    const csvMeta = await this.extractMetaFromCsv(file);

    // Prioridad: query params > CSV headers > filename
    const finalSymbol =
      symbol ||
      csvMeta.symbol ||
      this.extractSymbolFromFilename(file.originalname);
    const finalTimeframe =
      timeframe ||
      csvMeta.timeframe ||
      this.extractTimeframeFromFilename(file.originalname);

    if (!finalSymbol || !finalTimeframe) {
      throw new UnprocessableEntityException(
        'Symbol y timeframe son requeridos',
      );
    }

    // Parsear CSV y validar
    const candles = await this.parseCsv(file, maxRows);

    if (candles.length === 0) {
      throw new BadRequestException('CSV vacío o sin datos válidos');
    }

    // Transacción para reemplazo atómico
    return await this.prisma.$transaction(async (tx) => {
      // Buscar y eliminar dataset existente (cascade)
      const existingDataset = await tx.dataset.findUnique({
        where: {
          symbol_timeframe: { symbol: finalSymbol, timeframe: finalTimeframe },
        },
      });

      if (existingDataset) {
        await tx.dataset.delete({
          where: { id: existingDataset.id },
        });
      }

      // Crear nuevo dataset
      const newDataset = await tx.dataset.create({
        data: {
          symbol: finalSymbol,
          timeframe: finalTimeframe,
          sourceFile: file.originalname,
          rows: candles.length,
        },
      });

      // Insertar velas en lotes
      const batchSize = 10000;
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize).map((candle, index) => ({
          datasetId: newDataset.id,
          time: candle.time,
          tIdx: i + index,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        await tx.candle.createMany({ data: batch });
      }

      return {
        datasetId: newDataset.id,
        symbol: finalSymbol,
        timeframe: finalTimeframe,
        rows: candles.length,
        sourceFile: file.originalname,
      };
    });
  }

  private async extractMetaFromCsv(
    file: Express.Multer.File,
  ): Promise<CsvMeta> {
    return new Promise((resolve, reject) => {
      const meta: CsvMeta = {};
      const stream = Readable.from(file.buffer);

      let lineCount = 0;
      const maxHeaderLines = 10;

      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');

        for (const line of lines) {
          if (lineCount >= maxHeaderLines) break;

          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('#')) {
            const [key, value] = trimmedLine
              .substring(1)
              .split(':')
              .map((s) => s.trim());
            if (key === 'symbol') meta.symbol = value;
            if (key === 'timeframe') meta.timeframe = value as Timeframe;
          }

          lineCount++;
        }

        resolve(meta);
      });

      stream.on('error', reject);
    });
  }

  private extractSymbolFromFilename(filename: string): string | null {
    const match = filename.match(/^([A-Za-z0-9._-]+)__(D1|H4|H1|M15|M5)\.csv$/);
    return match ? match[1] : null;
  }

  private extractTimeframeFromFilename(filename: string): Timeframe | null {
    const match = filename.match(/^([A-Za-z0-9._-]+)__(D1|H4|H1|M15|M5)\.csv$/);
    return match ? (match[2] as Timeframe) : null;
  }

  private async parseCsv(
    file: Express.Multer.File,
    maxRows: number,
  ): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const candles: CsvRow[] = [];
      const stream = Readable.from(file.buffer);

      const parser = fastCsv
        .parse({ headers: true })
        .on('data', (row: any) => {
          if (candles.length >= maxRows) {
            reject(
              new PayloadTooLargeException(
                `Archivo excede el límite de ${maxRows} filas`,
              ),
            );
            return;
          }

          // Validar columnas requeridas
          if (!row.time || !row.open || !row.high || !row.low || !row.close) {
            reject(
              new BadRequestException(
                'Columnas requeridas: time, open, high, low, close',
              ),
            );
            return;
          }

          // Convertir time (segundos UNIX) a Date
          const timeInSeconds = parseInt(row.time);
          if (isNaN(timeInSeconds)) {
            reject(
              new BadRequestException(
                'Columna time debe contener segundos UNIX válidos',
              ),
            );
            return;
          }

          const time = new Date(timeInSeconds * 1000);

          // Validar y convertir precios
          const open = parseFloat(row.open);
          const high = parseFloat(row.high);
          const low = parseFloat(row.low);
          const close = parseFloat(row.close);

          if ([open, high, low, close].some((price) => isNaN(price))) {
            reject(
              new BadRequestException('Precios deben ser números válidos'),
            );
            return;
          }

          candles.push({
            time: time.toISOString(),
            open: open.toString(),
            high: high.toString(),
            low: low.toString(),
            close: close.toString(),
          });
        })
        .on('end', () => {
          // Ordenar por time ascendente
          candles.sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
          );

          // Eliminar duplicados (quedarse con el último)
          const uniqueCandles = this.removeDuplicateTimes(candles);

          resolve(uniqueCandles);
        })
        .on('error', reject);

      stream.pipe(parser);
    });
  }

  private removeDuplicateTimes(candles: CsvRow[]): CsvRow[] {
    const seen = new Map<string, CsvRow>();

    for (const candle of candles) {
      seen.set(candle.time, candle);
    }

    return Array.from(seen.values()).sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );
  }

  async listDatasets(query: ListDatasetsDto): Promise<ListDatasetsResponseDto> {
    const { page = 1, pageSize = 20, symbol, timeframe, order = 'uploadedAt_desc' } = query;
    const skip = (page - 1) * pageSize;

    // Construir where clause
    const where: any = {};
    if (symbol) where.symbol = { contains: symbol, mode: 'insensitive' };
    if (timeframe) where.timeframe = timeframe;

    // Construir orderBy
    const orderBy: any = {};
    if (order === 'uploadedAt_desc') orderBy.uploadedAt = 'desc';
    else if (order === 'uploadedAt_asc') orderBy.uploadedAt = 'asc';

    // Obtener datasets
    const [datasets, total] = await Promise.all([
      this.prisma.dataset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          symbol: true,
          timeframe: true,
          rows: true,
          uploadedAt: true,
        },
      }),
      this.prisma.dataset.count({ where }),
    ]);

    return {
              items: datasets.map(dataset => ({
          ...dataset,
          timeframe: dataset.timeframe as Timeframe,
          uploadedAt: dataset.uploadedAt.toISOString(),
        })),
      page,
      pageSize,
      total,
    };
  }

  async getCandlesByDataset(datasetId: string, query: GetCandlesDto): Promise<GetCandlesResponseDto> {
    const { fromTime, toTime, limit = 100000 } = query;

    // Obtener dataset
    const dataset = await this.prisma.dataset.findUnique({
      where: { id: datasetId },
      select: {
        id: true,
        symbol: true,
        timeframe: true,
        rows: true,
        uploadedAt: true,
      },
    });

    if (!dataset) {
      throw new Error('Dataset no encontrado');
    }

    // Construir where clause para velas
    const where: any = { datasetId };
    if (fromTime) where.time = { gte: new Date(fromTime) };
    if (toTime) where.time = { lte: new Date(toTime) };

    // Obtener velas
    const candles = await this.prisma.candle.findMany({
      where,
      orderBy: { time: 'asc' },
      take: limit,
      select: {
        time: true,
        open: true,
        high: true,
        low: true,
        close: true,
        tIdx: true,
      },
    });

    return {
      dataset: {
        ...dataset,
        uploadedAt: dataset.uploadedAt.toISOString(),
      },
      candles: candles.map(candle => ({
        ...candle,
        time: candle.time.getTime(), // Convertir a epoch ms
        open: parseFloat(candle.open.toString()),
        high: parseFloat(candle.high.toString()),
        low: parseFloat(candle.low.toString()),
        close: parseFloat(candle.close.toString()),
      })),
    };
  }
}
