import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Timeframe } from '../../lines/dto/get-top-lines.dto';

export class ListDatasetsDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(Timeframe)
  timeframe?: Timeframe;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  order?: 'uploadedAt_desc' | 'uploadedAt_asc' = 'uploadedAt_desc';
}

export class ListDatasetsResponseDto {
  items: Array<{
    id: string;
    symbol: string;
    timeframe: Timeframe;
    rows: number;
    uploadedAt: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
}
