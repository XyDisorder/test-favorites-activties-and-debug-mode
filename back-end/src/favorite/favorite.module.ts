import { Module } from '@nestjs/common';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteResolver } from './favorite.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ActivityModule } from 'src/activity/activity.module';
import { FavoriteApiService } from './favorite.api.service';
import { FavoriteService } from './favorite.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    AuthModule,
    UserModule,
    ActivityModule,
  ],
  exports: [FavoriteApiService],
  providers: [FavoriteApiService, FavoriteResolver, FavoriteService],
})
export class FavoriteModule {}
