import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Document } from 'mongoose';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

export type FavoriteDocument = HydratedDocument<Favorite>;

@ObjectType()
@Schema({ timestamps: true })
export class Favorite extends Document {
  @Field(() => ID)
  id!: string;

  // userId is not exposed in GraphQL API (comes from JWT context)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  @Field(() => ID)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
  })
  activityId!: string;

  @Field(() => Int)
  @Prop({ required: true, default: 0 })
  order!: number;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// to avoid duplicates userId+activityId
FavoriteSchema.index({ userId: 1, activityId: 1 }, { unique: true });
// to optimize the retrieval of favorites sorted by order
FavoriteSchema.index({ userId: 1, order: 1 });
