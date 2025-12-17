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

  private isMongoDuplicateError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
