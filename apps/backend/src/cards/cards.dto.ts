import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  name: string;

  @IsString()
  imageUrl: string; // Presigned S3 URL after upload

  @IsNumber()
  cost: number;

  @IsNumber()
  attack: number;

  @IsNumber()
  defense: number;

  @IsArray()
  @IsOptional()
  abilities?: string[];

  @IsString()
  @IsOptional()
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}
