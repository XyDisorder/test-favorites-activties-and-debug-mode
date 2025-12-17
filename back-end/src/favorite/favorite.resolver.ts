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
import { CreateFavoriteInput } from './favorite.input.dto';
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
}
