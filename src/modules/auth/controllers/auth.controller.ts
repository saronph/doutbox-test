import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../decorators/public.decorator';
import { SignInDTO } from '../dtos';
import { SignInRequestDoc } from '@docs/auth';
import { IAuthResponse } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @Public()
  @ApiBody({ type: SignInRequestDoc })
  @ApiResponse({ status: 200 })
  async signIn(@Body() dto: SignInDTO): Promise<IAuthResponse> {
    return this.authService.signIn(dto);
  }
}
