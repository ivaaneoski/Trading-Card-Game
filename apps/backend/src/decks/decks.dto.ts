import { IsString, IsArray, IsOptional } from 'class-validator';

export class DeckCardDto {
  cardId: string;
  quantity: number;
}

export class CreateDeckDto {
  @IsString()
  name: string;

  @IsArray()
  cards: DeckCardDto[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDeckDto extends CreateDeckDto {}
