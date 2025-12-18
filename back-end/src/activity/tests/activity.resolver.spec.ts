import { Test, TestingModule } from '@nestjs/testing';
import { ActivityResolver } from '../activity.resolver';
import { ActivityService } from '../activity.service';
import { UserService } from 'src/user/user.service';
import { FavoriteService } from 'src/favorite/favorite.service';
import { Activity } from '../activity.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';

describe('ActivityResolver', () => {
  let resolver: ActivityResolver;
  let activityService: jest.Mocked<ActivityService>;
  let userService: jest.Mocked<UserService>;
  let favoriteService: jest.Mocked<FavoriteService>;

  beforeEach(async () => {
    const mockActivityService = {
      findAll: jest.fn(),
      findLatest: jest.fn(),
      findByUser: jest.fn(),
      findByCity: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findCities: jest.fn(),
    };

    const mockUserService = {
      getById: jest.fn(),
    };

    const mockFavoriteService = {
      existsByUserIdAndActivityId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityResolver,
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: FavoriteService,
          useValue: mockFavoriteService,
        },
      ],
    }).compile();

    resolver = module.get<ActivityResolver>(ActivityResolver);
    activityService = module.get(ActivityService);
    userService = module.get(UserService);
    favoriteService = module.get(FavoriteService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('isFavorite ResolveField', () => {
    it('should return true when activity is favorite', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext: ContextWithJWTPayload = {
        jwtPayload: {
          id: 'user-id',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      favoriteService.existsByUserIdAndActivityId.mockResolvedValue(true);

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBe(true);
      expect(favoriteService.existsByUserIdAndActivityId).toHaveBeenCalledWith(
        'user-id',
        'activity-id',
      );
    });

    it('should return false when activity is not favorite', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext: ContextWithJWTPayload = {
        jwtPayload: {
          id: 'user-id',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      favoriteService.existsByUserIdAndActivityId.mockResolvedValue(false);

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBe(false);
      expect(favoriteService.existsByUserIdAndActivityId).toHaveBeenCalledWith(
        'user-id',
        'activity-id',
      );
    });

    it('should return null when user is not authenticated', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext = {
        jwtPayload: null,
      } as any;

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBeNull();
      expect(
        favoriteService.existsByUserIdAndActivityId,
      ).not.toHaveBeenCalled();
    });

    it('should return null when jwtPayload is undefined', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext = {} as any;

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBeNull();
      expect(
        favoriteService.existsByUserIdAndActivityId,
      ).not.toHaveBeenCalled();
    });

    it('should return null when jwtPayload.id is undefined', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext = {
        jwtPayload: { id: undefined },
      } as any;

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBeNull();
      expect(
        favoriteService.existsByUserIdAndActivityId,
      ).not.toHaveBeenCalled();
    });

    it('should return null when check fails', async () => {
      const mockActivity = {
        _id: { toString: () => 'activity-id' },
        name: 'Test Activity',
      } as Activity;

      const mockContext: ContextWithJWTPayload = {
        jwtPayload: {
          id: 'user-id',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      favoriteService.existsByUserIdAndActivityId.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await resolver.isFavorite(mockActivity, mockContext);

      expect(result).toBeNull();
      expect(favoriteService.existsByUserIdAndActivityId).toHaveBeenCalledWith(
        'user-id',
        'activity-id',
      );
    });
  });
});

