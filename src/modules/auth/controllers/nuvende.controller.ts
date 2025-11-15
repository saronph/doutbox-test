import { Controller, Get, Logger } from '@nestjs/common';

import { NuvendeAuthService } from '@crosscutting/infra/http/services';
import { Public } from '../decorators/public.decorator';

@Controller('nuvende')
export class NuvendeController {
  private readonly logger = new Logger(NuvendeController.name);

  constructor(private readonly nuvendeAuthService: NuvendeAuthService) {}

  @Public()
  @Get('test-auth')
  async testAuthentication() {
    try {
      this.logger.log('Testando autenticação com API Nuvende...');

      const accessToken = await this.nuvendeAuthService.getAccessToken();

      return {
        success: true,
        message: 'Autenticação com API Nuvende realizada com sucesso',
        tokenLength: accessToken.length,
        tokenPreview: `${accessToken.substring(0, 20)}...`,
      };
    } catch (error) {
      this.logger.error('Erro ao testar autenticação', error);

      return {
        success: false,
        message: 'Falha na autenticação com API Nuvende',
        error: error.message,
      };
    }
  }

  @Public()
  @Get('clear-cache')
  clearTokenCache() {
    this.nuvendeAuthService.clearCache();

    return {
      success: true,
      message: 'Cache de token limpo com sucesso',
    };
  }
}
