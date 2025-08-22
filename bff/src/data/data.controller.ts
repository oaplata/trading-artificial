import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { UploadCsvDto, UploadCsvResponseDto } from './dto/upload-csv.dto';

@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);

  constructor(private readonly dataService: DataService) {}

  @Get('test')
  test() {
    this.logger.log('Test endpoint called');
    return { message: 'Test endpoint working' };
  }

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadCsvDto,
  ): Promise<UploadCsvResponseDto> {
    this.logger.log(
      `Upload request received: ${file?.originalname}, mimetype: ${file?.mimetype}, size: ${file?.size}`,
    );

    if (!file) {
      throw new BadRequestException('Archivo CSV es requerido');
    }

    // Validar extensión del archivo
    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Archivo debe ser CSV');
    }

    // Validar tamaño del archivo (100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Archivo excede el límite de 100MB');
    }

    return this.dataService.uploadCsv(file, query.symbol, query.timeframe);
  }
}
