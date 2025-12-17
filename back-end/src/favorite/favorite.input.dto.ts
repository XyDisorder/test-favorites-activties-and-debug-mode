import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsMongoId } from 'class-validator';

@InputType()
export class CreateFavoriteInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsMongoId()
  activityId!: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  order!: number;
}
