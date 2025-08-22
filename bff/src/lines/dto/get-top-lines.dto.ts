import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum Timeframe {
  D1 = 'D1',
  H4 = 'H4',
  H1 = 'H1',
  M15 = 'M15',
  M5 = 'M5',
}

export class GetTopLinesDto {
  @IsString()
  symbol: string;

  @IsEnum(Timeframe)
  timeframe: Timeframe;

  @IsOptional()
  @IsNumber()
  k?: number; // Factor de escala opcional para filtrado
}
