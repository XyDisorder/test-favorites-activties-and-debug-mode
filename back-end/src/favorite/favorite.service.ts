import { InjectModel } from '@nestjs/mongoose';
import { Favorite } from './favorite.schema';
import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<Favorite>,
  ) {}

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
