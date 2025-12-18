import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (
  options: MongooseModuleOptions = {},
): DynamicModule =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      // Use a custom directory in the project instead of system temp
      const dbPath = path.join(process.cwd(), '.mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'test',
        },
        binary: {
          downloadDir: dbPath,
        },
      });
      const uri = mongod.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), rootMongooseTestModule()],
  exports: [ConfigModule, MongooseModule],
})
export class TestModule {}
