import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { User } from 'src/user/user.schema';
import { CreateFavoriteInput } from './favorite.input.dto';
import { Favorite } from './favorite.schema';
import { FavoriteMapper } from './mapper/favorite.mapper';
import { ActivityService } from 'src/activity/activity.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FavoriteApiService {
  private readonly logger = new Logger(FavoriteApiService.name);

  constructor(
    private readonly favoriteService: FavoriteService,
    private readonly activityService: ActivityService,
    private readonly userService: UserService,
  ) {}

  /**
   * Gets all favorites for a user
   * @param userId - The ID of the user (from JWT context)
   * @returns all favorites for the user
   * @throws HttpException if user not found, or if favorites cannot be retrieved
   */
  async getAllFavoritesByUserId(userId: User['id']): Promise<Favorite[]> {
    if (!userId) {
      throw new HttpException(
        'UserId is required to get favorites',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.getById(userId);
    if (!user) {
      throw new HttpException(
        'User not found. Cannot get favorites.',
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      return this.favoriteService.getAllByUserId(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to get favorites.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Creates a new favorite for a user
   * @param userId - The ID of the user (from JWT context)
   * @param createFavoriteDto - The favorite data (activityId and order)
   * @returns The created favorite
   * @throws HttpException if user or activity not found, or if favorite already exists
   */
  async createFavorite(
    userId: User['id'],
    createFavoriteDto: CreateFavoriteInput,
  ): Promise<Favorite> {
    try {
      if (!userId || !createFavoriteDto) {
        throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userService.getById(userId);
      if (!user) {
        throw new HttpException(
          'User not found. Cannot create favorite.',
          HttpStatus.NOT_FOUND,
        );
      }

      const activity = await this.activityService.findOne(
        createFavoriteDto.activityId,
      );
      if (!activity) {
        throw new HttpException(
          'Activity not found. Cannot create favorite.',
          HttpStatus.NOT_FOUND,
        );
      }

      const favorite = FavoriteMapper.mapCreateFavoriteDtoToFavoriteSchema(
        userId,
        createFavoriteDto,
      );

      return await this.favoriteService.createFavorite(favorite);
    } catch (error) {
      // FavoriteService already throws HttpException (ConflictException, InternalServerErrorException)
      // UserService and ActivityService throw NotFoundException (HttpException)
      // So we just need to log unexpected errors and re-throw HttpExceptions
      if (error instanceof HttpException) {
        throw error;
      }
      // Only log and wrap truly unexpected errors (network issues, etc.)
      this.logger.error('Unexpected error creating favorite', error);
      throw new HttpException(
        'Failed to create favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
