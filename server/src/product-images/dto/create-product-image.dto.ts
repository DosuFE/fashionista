import { IsBoolean, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @Min(0)
  sortOrder?: number;
}
// import {
//   IsBoolean,
//   IsInt,
//   IsOptional,
//   IsString,
//   IsUrl,
//   Min,
// } from 'class-validator';

