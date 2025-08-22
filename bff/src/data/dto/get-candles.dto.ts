import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCandlesDto {
  @IsOptional()
  @IsString()
  fromTime?: string;

  @IsOptional()
  @IsString()
  toTime?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 100000;
}

export class GetCandlesResponseDto {
  dataset: {
    id: string;
    symbol: string;
    timeframe: string;
    rows: number;
    uploadedAt: string;
  };
  candles: Array<{
    time: number; // epoch ms para Lightweight-Charts
    open: number;
    high: number;
    low: number;
    close: number;
    tIdx: number;
  }>;
}
