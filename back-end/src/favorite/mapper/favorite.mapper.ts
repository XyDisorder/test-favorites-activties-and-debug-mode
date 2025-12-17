import { User } from 'src/user/user.schema';
import { CreateFavoriteInput } from '../favorite.input.dto';
import { Favorite } from '../favorite.schema';

export class FavoriteMapper {
  public static mapCreateFavoriteDtoToFavoriteSchema(
    userId: User['id'],
    createFavoriteDto: Required<CreateFavoriteInput>,
  ): Required<Pick<Favorite, 'userId' | 'activityId' | 'order'>> {
    return {
      userId: userId,
      activityId: createFavoriteDto.activityId,
      order: createFavoriteDto.order,
    };
  }
}
