import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Activity extends Document {
  @Field(() => ID)
  id!: string;

  @Field()
  @Prop({ required: true })
  name!: string;

  @Field()
  @Prop({ required: true })
  city!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field()
  @Prop({ required: true })
  price!: number;

  @Field(() => User)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner!: User;

  @Field(() => Date, { nullable: true })
  createdAt!: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Add indexes for performance
ActivitySchema.index({ owner: 1 }); // Index for findByUser queries
ActivitySchema.index({ city: 1 }); // Index for findByCity queries
ActivitySchema.index({ createdAt: -1 }); // Index for sorting by createdAt
ActivitySchema.index({ city: 1, createdAt: -1 }); // Compound index for city queries with sorting
