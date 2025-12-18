import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { User } from 'src/user/user.schema';
import {
  CreateFavoriteInput,
  UpdateFavoriteOrderInput,
  ReorderFavoritesInput,
} from './favorite.input.dto';
import { Favorite } from './favorite.schema';
import { FavoriteMapper } from './mapper/favorite.mapper';
import { ActivityService } from 'src/activity/activity.service';
import { UserService } from 'src/user/user.service';
import { Activity } from 'src/activity/activity.schema';

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

      // If order is not provided, calculate it automatically (place at the end)
      let order = createFavoriteDto.order;
      if (order === undefined || order === null) {
        order = await this.favoriteService.getNextOrder(userId);
      }

      const favorite = FavoriteMapper.mapCreateFavoriteDtoToFavoriteSchema(
        userId,
        { ...createFavoriteDto, order },
      );

      return await this.favoriteService.createFavorite(favorite);
    } catch (error) {
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

  /**
   * Updates the order of a favorite
   * @param userId - The ID of the user (from JWT context)
   * @param updateFavoriteOrderDto - The favorite data (favoriteId and newOrder)
   * @returns The updated favorite
   * @throws HttpException if user or favorite not found
   */
  async updateFavoriteOrder(
    userId: User['id'],
    updateFavoriteOrderDto: UpdateFavoriteOrderInput,
  ): Promise<Favorite> {
    if (!userId || !updateFavoriteOrderDto) {
      throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.getById(userId);
    if (!user) {
      throw new HttpException(
        'User not found. Cannot update favorite order.',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // Verify that the favorite belongs to the user
      const favorite = await this.favoriteService.findByIdAndUserId(
        userId,
        updateFavoriteOrderDto.favoriteId,
      );

      if (!favorite) {
        throw new HttpException('Favorite not found.', HttpStatus.NOT_FOUND);
      }

      return await this.favoriteService.updateOrder(
        userId,
        updateFavoriteOrderDto.favoriteId,
        updateFavoriteOrderDto.newOrder,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error updating favorite order', error);
      throw new HttpException(
        'Failed to update favorite order.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reorders multiple favorites in batch
   * @param userId - The ID of the user (from JWT context)
   * @param reorderFavoritesDto - Array of favorites with their new orders
   * @returns Array of updated favorites
   * @throws HttpException if user not found or validation fails
   */
  async reorderFavorites(
    userId: User['id'],
    reorderFavoritesDto: ReorderFavoritesInput,
  ): Promise<Favorite[]> {
    if (!userId || !reorderFavoritesDto || !reorderFavoritesDto.favorites) {
      throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
    }

    if (reorderFavoritesDto.favorites.length === 0) {
      throw new HttpException(
        'At least one favorite is required for reordering.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.getById(userId);
    if (!user) {
      throw new HttpException(
        'User not found. Cannot reorder favorites.',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // Verify that all favorites belong to the user
      const favoriteIds = reorderFavoritesDto.favorites.map(
        (f) => f.favoriteId,
      );
      const userFavorites = await this.favoriteService.getAllByUserId(userId);
      const userFavoriteIds = userFavorites.map((f) => f._id.toString());

      const invalidFavorites = favoriteIds.filter(
        (id) => !userFavoriteIds.includes(id),
      );

      if (invalidFavorites.length > 0) {
        throw new HttpException(
          'Some favorites do not belong to the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.favoriteService.reorderFavorites(
        userId,
        reorderFavoritesDto.favorites,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error reordering favorites', error);
      throw new HttpException(
        'Failed to reorder favorites.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deletes a favorite for a user
   * @param userId - The ID of the user (from JWT context)
   * @param deleteFavoriteInput - The favorite data (activityId)
   * @returns True if the favorite was deleted, false otherwise
   * @throws HttpException if user or activity not found, or if favorite does not exist
   */
  async deleteFavorite(
    userId: User['id'],
    activityId: Activity['id'],
  ): Promise<boolean> {
    if (!userId || !activityId) {
      throw new HttpException('Invalid input', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.getById(userId);
    if (!user) {
      throw new HttpException(
        'User not found. Cannot delete favorite.',
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      const deleted = await this.favoriteService.deleteByIds(
        userId,
        activityId,
      );
      if (!deleted) {
        throw new HttpException('Favorite not found.', HttpStatus.NOT_FOUND);
      }
      return deleted;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting favorite', error);
      throw new HttpException(
        'Failed to delete favorite.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
