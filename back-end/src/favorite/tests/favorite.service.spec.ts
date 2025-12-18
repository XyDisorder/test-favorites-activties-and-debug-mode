import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from '../favorite.service';
import { getModelToken } from '@nestjs/mongoose';
import { Favorite } from '../favorite.schema';
import { Model } from 'mongoose';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let favoriteModel: jest.Mocked<Model<Favorite>>;

  beforeEach(async () => {
    const mockFind = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const mockFavoriteModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(mockFind),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      bulkWrite: jest.fn(),
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

  it('should get all favorites by user id', async () => {
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

    const mockExec = jest.fn().mockResolvedValue(mockFavorites);
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.find.mockReturnValue({
      sort: mockSort,
    } as any);

    const result = await service.getAllByUserId('user-id');

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result[0].activityId).toBe('activity-id-1');
    expect(result[1].activityId).toBe('activity-id-2');
    expect(favoriteModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(mockSort).toHaveBeenCalledWith({ order: 1 });
    expect(mockExec).toHaveBeenCalled();
  });

  it('should return empty array when user has no favorites', async () => {
    const mockExec = jest.fn().mockResolvedValue([]);
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.find.mockReturnValue({
      sort: mockSort,
    } as any);

    const result = await service.getAllByUserId('user-id');

    expect(result).toBeDefined();
    expect(result).toHaveLength(0);
    expect(favoriteModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  it('should throw error when get favorites fails', async () => {
    const mockExec = jest.fn().mockRejectedValue(new Error('Database error'));
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.find.mockReturnValue({
      sort: mockSort,
    } as any);

    await expect(service.getAllByUserId('user-id')).rejects.toThrow(
      'Failed to get favorites',
    );

    expect(favoriteModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
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

  it('should check if favorite exists by userId and activityId', async () => {
    const mockFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    favoriteModel.findOne.mockResolvedValue(mockFavorite as any);

    const result = await service.existsByUserIdAndActivityId(
      'user-id',
      'activity-id',
    );

    expect(result).toBe(true);
    expect(favoriteModel.findOne).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });

  it('should return false when favorite does not exist', async () => {
    favoriteModel.findOne.mockResolvedValue(null);

    const result = await service.existsByUserIdAndActivityId(
      'user-id',
      'non-existent-activity',
    );

    expect(result).toBe(false);
    expect(favoriteModel.findOne).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'non-existent-activity',
    });
  });

  it('should throw error when check favorite fails', async () => {
    favoriteModel.findOne.mockRejectedValue(new Error('Database error'));

    await expect(
      service.existsByUserIdAndActivityId('user-id', 'activity-id'),
    ).rejects.toThrow('Failed to check favorite');

    expect(favoriteModel.findOne).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });

  it('should delete a favorite by userId and activityId', async () => {
    const mockDeletedFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    favoriteModel.findOneAndDelete.mockResolvedValue(
      mockDeletedFavorite as any,
    );

    const result = await service.deleteByIds('user-id', 'activity-id');

    expect(result).toBe(true);
    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });

  it('should return false when favorite does not exist', async () => {
    favoriteModel.findOneAndDelete.mockResolvedValue(null);

    const result = await service.deleteByIds(
      'user-id',
      'non-existent-activity',
    );

    expect(result).toBe(false);
    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'non-existent-activity',
    });
  });

  it('should throw error when delete fails', async () => {
    favoriteModel.findOneAndDelete.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(service.deleteByIds('user-id', 'activity-id')).rejects.toThrow(
      'Failed to delete favorite',
    );

    expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
      userId: 'user-id',
      activityId: 'activity-id',
    });
  });

  it('should update favorite order', async () => {
    const mockUpdatedFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 5,
    };

    favoriteModel.findOneAndUpdate.mockResolvedValue(
      mockUpdatedFavorite as any,
    );

    const result = await service.updateOrder('user-id', 'favorite-id', 5);

    expect(result).toBeDefined();
    expect(result.order).toBe(5);
    expect(favoriteModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'favorite-id', userId: 'user-id' },
      { order: 5 },
      { new: true },
    );
  });

  it('should throw error when favorite not found for update', async () => {
    favoriteModel.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      service.updateOrder('user-id', 'non-existent-favorite', 5),
    ).rejects.toThrow('Favorite not found');

    expect(favoriteModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it('should throw error when update order fails', async () => {
    favoriteModel.findOneAndUpdate.mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      service.updateOrder('user-id', 'favorite-id', 5),
    ).rejects.toThrow('Failed to update favorite order');

    expect(favoriteModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it('should reorder multiple favorites', async () => {
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

    favoriteModel.bulkWrite.mockResolvedValue({
      modifiedCount: 2,
    } as any);

    const mockFind = {
      exec: jest.fn().mockResolvedValue(mockFavorites),
    };
    favoriteModel.find.mockReturnValue(mockFind as any);

    const result = await service.reorderFavorites('user-id', [
      { favoriteId: 'favorite-id-1', order: 1 },
      { favoriteId: 'favorite-id-2', order: 0 },
    ]);

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(favoriteModel.bulkWrite).toHaveBeenCalled();
    expect(favoriteModel.find).toHaveBeenCalledWith({
      _id: { $in: ['favorite-id-1', 'favorite-id-2'] },
      userId: 'user-id',
    });
  });

  it('should throw error when reorder fails', async () => {
    favoriteModel.bulkWrite.mockRejectedValue(new Error('Database error'));

    await expect(
      service.reorderFavorites('user-id', [
        { favoriteId: 'favorite-id-1', order: 1 },
      ]),
    ).rejects.toThrow('Failed to reorder favorites');

    expect(favoriteModel.bulkWrite).toHaveBeenCalled();
  });

  it('should get next order when user has no favorites', async () => {
    const mockExec = jest.fn().mockResolvedValue(null);
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.findOne.mockReturnValue({
      sort: mockSort,
    } as any);

    const result = await service.getNextOrder('user-id');

    expect(result).toBe(0);
    expect(favoriteModel.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(mockSort).toHaveBeenCalledWith({ order: -1 });
    expect(mockExec).toHaveBeenCalled();
  });

  it('should get next order when user has favorites', async () => {
    const mockLastFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 5,
    };

    const mockExec = jest.fn().mockResolvedValue(mockLastFavorite);
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.findOne.mockReturnValue({
      sort: mockSort,
    } as any);

    const result = await service.getNextOrder('user-id');

    expect(result).toBe(6);
    expect(favoriteModel.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(mockSort).toHaveBeenCalledWith({ order: -1 });
    expect(mockExec).toHaveBeenCalled();
  });

  it('should throw error when get next order fails', async () => {
    const mockExec = jest.fn().mockRejectedValue(new Error('Database error'));
    const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
    favoriteModel.findOne.mockReturnValue({
      sort: mockSort,
    } as any);

    await expect(service.getNextOrder('user-id')).rejects.toThrow(
      'Failed to get next order',
    );

    expect(favoriteModel.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(mockSort).toHaveBeenCalledWith({ order: -1 });
    expect(mockExec).toHaveBeenCalled();
  });

  it('should find favorite by id and userId', async () => {
    const mockFavorite = {
      _id: { toString: () => 'favorite-id' },
      userId: 'user-id',
      activityId: 'activity-id',
      order: 0,
    };

    favoriteModel.findOne.mockResolvedValue(mockFavorite as any);

    const result = await service.findByIdAndUserId('user-id', 'favorite-id');

    expect(result).toBeDefined();
    expect(result?.activityId).toBe('activity-id');
    expect(favoriteModel.findOne).toHaveBeenCalledWith({
      _id: 'favorite-id',
      userId: 'user-id',
    });
  });

  it('should return null when favorite not found by id and userId', async () => {
    favoriteModel.findOne.mockResolvedValue(null);

    const result = await service.findByIdAndUserId(
      'user-id',
      'non-existent-favorite',
    );

    expect(result).toBeNull();
    expect(favoriteModel.findOne).toHaveBeenCalledWith({
      _id: 'non-existent-favorite',
      userId: 'user-id',
    });
  });

  it('should throw error when find by id and userId fails', async () => {
    favoriteModel.findOne.mockRejectedValue(new Error('Database error'));

    await expect(
      service.findByIdAndUserId('user-id', 'favorite-id'),
    ).rejects.toThrow('Failed to find favorite');

    expect(favoriteModel.findOne).toHaveBeenCalled();
  });
});
