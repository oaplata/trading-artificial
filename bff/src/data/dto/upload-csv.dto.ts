import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Timeframe } from '../../lines/dto/get-top-lines.dto';

export class UploadCsvDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(Timeframe)
  timeframe?: Timeframe;
}

export class UploadCsvResponseDto {
  datasetId: string;
  symbol: string;
  timeframe: Timeframe;
  rows: number;
  sourceFile: string;
}
