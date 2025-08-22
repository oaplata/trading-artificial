import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum FeedbackLabel {
  GOOD = 'GOOD',
  BAD = 'BAD',
}

export class CreateFeedbackDto {
  @IsString()
  candidateId: string;

  @IsEnum(FeedbackLabel)
  label: FeedbackLabel;

  @IsOptional()
  @IsNumber()
  adjustedM?: number; // Pendiente ajustada manualmente

  @IsOptional()
  @IsNumber()
  adjustedB?: number; // Intercepto ajustado manualmente

  @IsOptional()
  @IsString()
  userId?: string; // ID del usuario que proporciona feedback
}
