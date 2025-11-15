import { Module } from '@nestjs/common';

import { HttpModule } from '@crosscutting/infra/http/http.module';

import { InvoicesController } from './controllers';
import { InvoicesService } from './services';

@Module({
  imports: [HttpModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
