import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteApiService } from '../favorite.api.service';
import { FavoriteService } from '../favorite.service';
import { UserService } from 'src/user/user.service';
import { ActivityService } from 'src/activity/activity.service';
import { getModelToken } from '@nestjs/mongoose';
import { Favorite } from '../favorite.schema';
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

    const mockFind = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const mockFavoriteModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(mockFind),
      findOneAndDelete: jest.fn(),
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

  it('should get all favorites by user id successfully', async () => {
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    const mockFavorites = [
      {
        _id: { toString: () => 'favorite-id-1' },
        userId: 'user-id',
        activityId: 'activity-id-1',
        order: 0,
      },
      {
        _id: { toString: () => 'favorite-id-2' },
        userId: 'user-id',
        activityId: 'activity-id-2',
        order: 1,
      },
    ];

    userService.getById.mockResolvedValue(mockUser as any);
    const mockExec = jest.fn().mockResolvedValue(mockFavorites);
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.find.mockReturnValue({
      sort: mockSort,
    } as any);

    const result = await service.getAllFavoritesByUserId('user-id');

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].activityId).toBe('activity-id-1');
    expect(result[1].activityId).toBe('activity-id-2');
    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(favoriteModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('should throw error when userId is empty', async () => {
    await expect(service.getAllFavoritesByUserId('')).rejects.toThrow(
      HttpException,
    );

    expect(userService.getById).not.toHaveBeenCalled();
    expect(favoriteModel.find).not.toHaveBeenCalled();
  });

  it('should throw error when user does not exist', async () => {
    userService.getById.mockResolvedValue(null as any);

    await expect(
      service.getAllFavoritesByUserId('non-existent-user'),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('non-existent-user');
    expect(favoriteModel.find).not.toHaveBeenCalled();
  });

  it('should throw error when get favorites fails', async () => {
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    userService.getById.mockResolvedValue(mockUser as any);
    const mockExec = jest.fn().mockRejectedValue(new Error('Database error'));
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.find.mockReturnValue({
      sort: mockSort,
    } as any);

    await expect(service.getAllFavoritesByUserId('user-id')).rejects.toThrow(
      HttpException,
    );

    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(favoriteModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
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

  it('should delete a favorite successfully', async () => {
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    const mockDeletedFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    userService.getById.mockResolvedValue(mockUser as any);
    favoriteModel.findOneAndDelete.mockResolvedValue(
      mockDeletedFavorite as any,
    );

    const result = await service.deleteFavorite('user-id', 'activity-id');

    expect(result).toBe(true);
    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });

  it('should throw error when userId is empty for delete', async () => {
    await expect(service.deleteFavorite('', 'activity-id')).rejects.toThrow(
      HttpException,
    );

    expect(userService.getById).not.toHaveBeenCalled();
    expect(favoriteModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should throw error when activityId is empty for delete', async () => {
    await expect(service.deleteFavorite('user-id', '')).rejects.toThrow(
      HttpException,
    );

    expect(userService.getById).not.toHaveBeenCalled();
    expect(favoriteModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should throw error when user does not exist for delete', async () => {
    userService.getById.mockResolvedValue(null as any);

    await expect(
      service.deleteFavorite('non-existent-user', 'activity-id'),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('non-existent-user');
    expect(favoriteModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('should throw error when favorite does not exist', async () => {
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    userService.getById.mockResolvedValue(mockUser as any);
    favoriteModel.findOneAndDelete.mockResolvedValue(null);

    await expect(
      service.deleteFavorite('user-id', 'non-existent-activity'),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'non-existent-activity',
    });
  });

  it('should throw error when delete fails', async () => {
    const mockUser = { id: 'user-id', email: 'test@test.com' };
    userService.getById.mockResolvedValue(mockUser as any);
    favoriteModel.findOneAndDelete.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.deleteFavorite('user-id', 'activity-id'),
    ).rejects.toThrow(HttpException);

    expect(userService.getById).toHaveBeenCalledWith('user-id');
    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });
});
