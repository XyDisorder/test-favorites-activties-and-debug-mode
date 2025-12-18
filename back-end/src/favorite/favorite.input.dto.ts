import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateFavoriteInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsMongoId()
  activityId!: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;
}

@InputType()
export class UpdateFavoriteOrderInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsMongoId()
  favoriteId!: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  newOrder!: number;
}

@InputType()
export class FavoriteOrderItem {
  @Field(() => String)
  @IsNotEmpty()
  @IsMongoId()
  favoriteId!: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  order!: number;
}

@InputType()
export class ReorderFavoritesInput {
  @Field(() => [FavoriteOrderItem])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteOrderItem)
  favorites!: FavoriteOrderItem[];
}
