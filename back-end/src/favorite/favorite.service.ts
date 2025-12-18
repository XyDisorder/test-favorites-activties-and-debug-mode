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
   * Gets the next order value for a user (max order + 1, or 0 if no favorites)
   * @param userId - The ID of the user
   * @returns The next order value
   * @throws InternalServerErrorException if query fails
   */
  async getNextOrder(userId: User['id']): Promise<number> {
    try {
      const lastFavorite = await this.favoriteModel
        .findOne({ userId })
        .sort({ order: -1 })
        .exec();

      if (!lastFavorite) {
        return 0;
      }

      return lastFavorite.order + 1;
    } catch (error) {
      this.logger.error('Failed to get next order', error);
      throw new InternalServerErrorException('Failed to get next order');
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
   * Updates the order of a favorite
   * @param userId - The ID of the user
   * @param favoriteId - The ID of the favorite
   * @param newOrder - The new order value
   * @returns The updated favorite
   * @throws InternalServerErrorException if update fails or favorite not found
   */
  async updateOrder(
    userId: User['id'],
    favoriteId: string,
    newOrder: number,
  ): Promise<Favorite> {
    try {
      const favorite = await this.favoriteModel.findOneAndUpdate(
        { _id: favoriteId, userId },
        { order: newOrder },
        { new: true },
      );

      if (!favorite) {
        throw new InternalServerErrorException('Favorite not found');
      }

      return favorite;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Failed to update favorite order', error);
      throw new InternalServerErrorException('Failed to update favorite order');
    }
  }

  /**
   * Reorders multiple favorites in batch
   * @param userId - The ID of the user
   * @param favorites - Array of { favoriteId, order } to update
   * @returns Array of updated favorites
   * @throws InternalServerErrorException if update fails
   */
  async reorderFavorites(
    userId: User['id'],
    favorites: Array<{ favoriteId: string; order: number }>,
  ): Promise<Favorite[]> {
    try {
      const bulkOps = favorites.map(({ favoriteId, order }) => ({
        updateOne: {
          filter: { _id: favoriteId, userId },
          update: { $set: { order } },
        },
      }));

      const result = await this.favoriteModel.bulkWrite(bulkOps);

      if (result.modifiedCount !== favorites.length) {
        this.logger.warn(
          `Expected to update ${favorites.length} favorites, but only ${result.modifiedCount} were updated`,
        );
      }

      // Fetch updated favorites
      const favoriteIds = favorites.map((f) => f.favoriteId);
      return await this.favoriteModel
        .find({ _id: { $in: favoriteIds }, userId })
        .exec();
    } catch (error) {
      this.logger.error('Failed to reorder favorites', error);
      throw new InternalServerErrorException('Failed to reorder favorites');
    }
  }

  /**
   * Finds a favorite by ID and userId
   * @param userId - The ID of the user
   * @param favoriteId - The ID of the favorite
   * @returns The favorite if found, null otherwise
   * @throws InternalServerErrorException if query fails
   */
  async findByIdAndUserId(
    userId: User['id'],
    favoriteId: string,
  ): Promise<Favorite | null> {
    try {
      return await this.favoriteModel.findOne({ _id: favoriteId, userId });
    } catch (error) {
      this.logger.error('Failed to find favorite', error);
      throw new InternalServerErrorException('Failed to find favorite');
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
