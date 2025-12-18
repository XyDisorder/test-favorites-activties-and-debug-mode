import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from './favorite.schema';
import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from 'src/user/user.schema';
import { Activity } from 'src/activity/activity.schema';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<Favorite>,
  ) {}

  /**
   * Finds all favorites for a user
   * @param userId - The ID of the user (from JWT context)
   * @returns all favorites for the user
   * @throws InternalServerErrorException if favorites cannot be retrieved
   */
  async getAllByUserId(userId: User['id']): Promise<Favorite[]> {
    try {
      return await this.favoriteModel
        .find({ userId })
        .sort({ order: 1 })
        .exec();
    } catch (error) {
      this.logger.error('Failed to get favorites', error);
      throw new InternalServerErrorException('Failed to get favorites');
    }
  }

  /**
   * Creates a new favorite in the database
   * @param favorite - The favorite data to create
   * @returns The created favorite
   * @throws ConflictException if favorite already exists
   * @throws InternalServerErrorException if creation fails
   */
  async createFavorite(
    favorite: Required<Pick<Favorite, 'userId' | 'activityId' | 'order'>>,
  ): Promise<Favorite> {
    try {
      return await this.favoriteModel.create(favorite);
    } catch (error) {
      this.logger.error('Failed to create favorite', error);
      if (this.isMongoDuplicateError(error)) {
        throw new ConflictException('Favorite already exists');
      }
      throw new InternalServerErrorException('Failed to create favorite');
    }
  }

  /**
   * Checks if a favorite exists for a user and activity
   * @param userId - The ID of the user
   * @param activityId - The ID of the activity
   * @returns True if the favorite exists, false otherwise
   * @throws InternalServerErrorException if check fails
   */
  async existsByUserIdAndActivityId(
    userId: User['id'],
    activityId: Activity['id'],
  ): Promise<boolean> {
    try {
      const favorite = await this.favoriteModel.findOne({
        userId,
        activityId,
      });
      return favorite !== null;
    } catch (error) {
      this.logger.error('Failed to check favorite', error);
      throw new InternalServerErrorException('Failed to check favorite');
    }
  }

  /**
   * Deletes a favorite by userId and activityId
   * @param userId - The ID of the user
   * @param activityId - The ID of the activity
   * @returns True if the favorite was deleted, false otherwise
   * @throws InternalServerErrorException if deletion fails
   */
  async deleteByIds(
    userId: User['id'],
    activityId: Activity['id'],
  ): Promise<boolean> {
    try {
      const result = await this.favoriteModel.findOneAndDelete({
        userId,
        activityId,
      });
      return result !== null;
    } catch (error) {
      this.logger.error('Failed to delete favorite', error);
      throw new InternalServerErrorException('Failed to delete favorite');
    }
  }

  private isMongoDuplicateError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
