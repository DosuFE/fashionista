import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum CancellationReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewCancellationDto {
  @IsEnum(CancellationReviewDecision)
  decision: CancellationReviewDecision;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
