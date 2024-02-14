import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { IncomingHttpHeaders } from 'http'

import { AuthService } from './auth.service'
import { GetUser, RawHeaders } from './decorators'

import { CreateUserDto, LoginUserDto } from './dto'
import { User } from './entities/user.entity'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create( createUserDto );
  }

  @Post('sign-in')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: any,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      mesage: 'Hello world private.',
      user,
      userEmail,
      rawHeaders,
      headers,
    }
  }
}
