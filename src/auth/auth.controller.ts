import { Controller, Post, Get, Body, UseGuards, Headers, SetMetadata } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { IncomingHttpHeaders } from 'http'

import { AuthService } from './auth.service'
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators'

import { CreateUserDto, LoginUserDto } from './dto'
import { User } from './entities/user.entity'
import { UserRoleGuard } from './guards/user-role.guard'
import { ValidRoles } from './interfaces'

@ApiTags('Auth')
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

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkStatus( user )
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

  @Get('private-2')
  @RoleProtected( ValidRoles.admin, ValidRoles.superUser )
  // @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards( AuthGuard(), UserRoleGuard )
  testingPrivateRoute2(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      mesage: 'Hello world private 2.',
      user,
    }
  }

  @Get('private-3')
  @Auth( ValidRoles.admin, ValidRoles.superUser )
  testingPrivateRoute3(
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      mesage: 'Hello world private 2.',
      user,
    }
  }
}
