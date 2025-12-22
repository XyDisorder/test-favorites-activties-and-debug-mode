import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

interface GraphQLContext {
  req: Request;
  res: Response;
}

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
}

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => SignInDto)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute for login
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: GraphQLContext,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
    // Only set domain in production (cookies work better without domain on localhost)
    if (process.env.FRONTEND_DOMAIN) {
      cookieOptions.domain = process.env.FRONTEND_DOMAIN;
    }
    ctx.res.cookie('jwt', data.access_token, cookieOptions);

    return data;
  }

  @Mutation(() => User)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute for registration
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: GraphQLContext): Promise<boolean> {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
    if (process.env.FRONTEND_DOMAIN) {
      cookieOptions.domain = process.env.FRONTEND_DOMAIN;
    }
    ctx.res.clearCookie('jwt', cookieOptions);
    return true;
  }
}
