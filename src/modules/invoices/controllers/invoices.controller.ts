import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { CreateInvoiceDTO } from '../dtos';
import { CreateInvoiceDocDTO } from '@docs/invoices';
import { InvoicesService } from '../services';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiBody({ type: CreateInvoiceDocDTO })
  @ApiResponse({ status: 201 })
  async create(@Body() data: CreateInvoiceDTO) {
    const invoice = await this.invoicesService.create(data);

    return {
      qrCode: invoice.qrCode,
      status: invoice.status,
    };
  }
}
