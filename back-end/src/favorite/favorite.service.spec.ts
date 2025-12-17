import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { getModelToken } from '@nestjs/mongoose';
import { Favorite } from './favorite.schema';
import { Model } from 'mongoose';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let favoriteModel: jest.Mocked<Model<Favorite>>;

  beforeEach(async () => {
    const mockFavoriteModel = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel,
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    favoriteModel = module.get(getModelToken(Favorite.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a favorite', async () => {
    const mockFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    favoriteModel.create.mockResolvedValue(mockFavorite as any);

    const result = await service.createFavorite({
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    });

    expect(result).toBeDefined();
    expect(result.userId).toBe('user-id');
    expect(result.activityId).toBe('activity-id');
    expect(result.order).toBe(0);
    expect(favoriteModel.create).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    });
  });

  it('should throw error when create fails', async () => {
    favoriteModel.create.mockRejectedValue(new Error('Database error'));

    await expect(
      service.createFavorite({
        userId: 'user-id',
        activityId: 'activity-id',
        order: 0,
      }),
    ).rejects.toThrow('Failed to create favorite');

    expect(favoriteModel.create).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    });
  });
});
