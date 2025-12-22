import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Activity } from './activity.schema';

@ObjectType()
export class PaginatedActivities {
  @Field(() => [Activity])
  items!: Activity[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  totalPages!: number;
}
