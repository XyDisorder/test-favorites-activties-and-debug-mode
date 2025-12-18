import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { Favorite } from './favorite.schema';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import {
  CreateFavoriteInput,
  UpdateFavoriteOrderInput,
  ReorderFavoritesInput,
} from './favorite.input.dto';
import { FavoriteApiService } from './favorite.api.service';

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteApiService: FavoriteApiService) {}

  @ResolveField(() => ID)
  id(@Parent() favorite: Favorite): string {
    return favorite._id.toString();
  }

  @Query(() => [Favorite])
  @UseGuards(AuthGuard)
  async getAllFavoritesByUserId(
    @Context() context: ContextWithJWTPayload,
  ): Promise<Favorite[]> {
    return this.favoriteApiService.getAllFavoritesByUserId(
      context.jwtPayload.id,
    );
  }

  @Mutation(() => Favorite)
  @UseGuards(AuthGuard)
  async createFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('createFavoriteInput') createFavoriteInput: CreateFavoriteInput,
  ): Promise<Favorite> {
    return this.favoriteApiService.createFavorite(context.jwtPayload.id, {
      ...createFavoriteInput,
    });
  }

  @Mutation(() => Favorite)
  @UseGuards(AuthGuard)
  async updateFavoriteOrder(
    @Context() context: ContextWithJWTPayload,
    @Args('updateFavoriteOrderInput')
    updateFavoriteOrderInput: UpdateFavoriteOrderInput,
  ): Promise<Favorite> {
    return this.favoriteApiService.updateFavoriteOrder(
      context.jwtPayload.id,
      updateFavoriteOrderInput,
    );
  }

  @Mutation(() => [Favorite])
  @UseGuards(AuthGuard)
  async reorderFavorites(
    @Context() context: ContextWithJWTPayload,
    @Args('reorderFavoritesInput')
    reorderFavoritesInput: ReorderFavoritesInput,
  ): Promise<Favorite[]> {
    return this.favoriteApiService.reorderFavorites(
      context.jwtPayload.id,
      reorderFavoritesInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId', { type: () => ID }) activityId: string,
  ): Promise<boolean> {
    return this.favoriteApiService.deleteFavorite(
      context.jwtPayload.id,
      activityId,
    );
  }
}
