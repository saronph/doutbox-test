import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class InvoiceValueDoc {
  @ApiProperty({
    example: '150.50',
    description: 'Valor original informado na cobrança',
  })
  original: string;

  @ApiPropertyOptional({
    description: 'Demais campos retornados pelo provedor',
    type: Object,
  })
  additionalData?: Record<string, unknown>;
}

export class CreateInvoiceResponseDoc {
  @ApiProperty({
    example: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    description: 'Identificador único da cobrança gerado/registrado',
  })
  txid: string;

  @ApiProperty({
    type: InvoiceValueDoc,
    description: 'Informações do valor da cobrança retornadas pela Nuvende',
  })
  valor: InvoiceValueDoc;

  @ApiPropertyOptional({
    example:
      '00020101021226980014br.gov.bcb.pix2561pix-h.example.com/invoice/12345678901234567890123450214Cobrança de pedido5204000053039865406100.005802BR5925Loja Exemplo Ltda6014Brasilia-DF61080540900062070503***6304486B',
    description: 'Código copiável do QR Code gerado',
  })
  qrCode?: string;

  @ApiPropertyOptional({
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    description: 'Imagem do QR Code codificada em base64, quando disponível',
  })
  qrCodeImage?: string;

  @ApiPropertyOptional({
    example: 3600,
    description: 'Tempo de expiração (em segundos) retornado para a cobrança',
  })
  expiracao?: number;

  @ApiPropertyOptional({
    description: 'Demais campos retornados pela API da Nuvende',
    type: Object,
  })
  raw?: Record<string, unknown>;
}
