import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PayloadDto } from './auth/types/jwtPayload.dto';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGqlGuard } from './auth/throttler-gql.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (1 minute)
        limit: 10, // Maximum number of requests per time window
      },
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule],
      inject: [JwtService, ConfigService],
      useFactory: async (
        jwtService: JwtService,
        configService: ConfigService,
      ) => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');
        return {
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          playground: process.env.NODE_ENV !== 'production',
          buildSchemaOptions: { numberScalarMode: 'integer' },
          context: async ({ req, res }: { req: Request; res: Response }) => {
            const token =
              req.headers.jwt ?? (req.cookies && req.cookies['jwt']);

            let jwtPayload: PayloadDto | null = null;
            if (token) {
              try {
                jwtPayload = (await jwtService.verifyAsync(token, {
                  secret,
                })) as PayloadDto;
              } catch (error) {
                // Invalid token - set to null, let guards handle authentication
                jwtPayload = null;
              }
            }

            return {
              jwtPayload,
              req,
              res,
            };
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    MeModule,
    ActivityModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGqlGuard,
    },
  ],
})
export class BaseAppModule {}

@Module({
  imports: [
    BaseAppModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return { uri: configService.getOrThrow<string>('MONGO_URI') };
      },
    }),
  ],
})
export class AppModule {}
