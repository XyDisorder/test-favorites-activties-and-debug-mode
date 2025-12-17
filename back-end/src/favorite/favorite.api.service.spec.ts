import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteApiService } from './favorite.api.service';
import { FavoriteService } from './favorite.service';
import { UserService } from 'src/user/user.service';
import { ActivityService } from 'src/activity/activity.service';
import { getModelToken } from '@nestjs/mongoose';
import { Favorite } from './favorite.schema';
import { HttpException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('FavoriteApiService', () => {
  let service: FavoriteApiService;
  let userService: jest.Mocked<UserService>;
  let activityService: jest.Mocked<ActivityService>;
  let favoriteModel: jest.Mocked<Model<Favorite>>;

  beforeEach(async () => {
    // Create mocks
    const mockUserService = {
      getById: jest.fn(),
    };

    const mockActivityService = {
      findOne: jest.fn(),
    };

    const mockFavoriteModel = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteApiService,
        FavoriteService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel,
        },
      ],
    }).compile();

    service = module.get<FavoriteApiService>(FavoriteApiService);
    userService = module.get(UserService);
    activityService = module.get(ActivityService);
    favoriteModel = module.get(getModelToken(Favorite.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a favorite successfully', async () => {
    // Mock user and activity exist
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    const mockActivity = { id: 'activity-id', name: 'Test Activity' };
    const mockFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    userService.getById.mockResolvedValue(mockUser as any);
    activityService.findOne.mockResolvedValue(mockActivity as any);
    favoriteModel.create.mockResolvedValue(mockFavorite as any);

    const result = await service.createFavorite('user-id', {
      activityId: 'activity-id',
      order: 0,
    });

    expect(result).toBeDefined();
    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(activityService.findOne).toHaveBeenCalledWith('activity-id');
    expect(favoriteModel.create).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    });
  });

  it('should throw error when user does not exist', async () => {
    // Mock user not found
    userService.getById.mockResolvedValue(null as any);
    activityService.findOne.mockResolvedValue({ id: 'activity-id' } as any);

    await expect(
      service.createFavorite('non-existent-user', {
        activityId: 'activity-id',
        order: 0,
      }),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('non-existent-user');
    expect(activityService.findOne).not.toHaveBeenCalled();
    expect(favoriteModel.create).not.toHaveBeenCalled();
  });

  it('should throw error when activity does not exist', async () => {
    // Mock user exists but activity not found
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    userService.getById.mockResolvedValue(mockUser as any);
    activityService.findOne.mockResolvedValue(null as any);

    await expect(
      service.createFavorite('user-id', {
        activityId: 'non-existent-activity',
        order: 0,
      }),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(activityService.findOne).toHaveBeenCalledWith(
      'non-existent-activity',
    );
    expect(favoriteModel.create).not.toHaveBeenCalled();
  });

  it('should throw error when input is invalid', async () => {
    await expect(
      service.createFavorite('', {
        activityId: '',
        order: 0,
      }),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).not.toHaveBeenCalled();
    expect(activityService.findOne).not.toHaveBeenCalled();
    expect(favoriteModel.create).not.toHaveBeenCalled();
  });
});
