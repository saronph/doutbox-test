import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class InvoiceCalendarDoc {
  @ApiPropertyOptional({
    example: 3600,
    description: 'Tempo de expiração da cobrança em segundos',
    minimum: 1,
    maximum: 86400,
  })
  expiracao?: number;
}

class InvoiceValueDoc {
  @ApiProperty({
    example: '150.50',
    description: 'Valor original da cobrança com duas casas decimais',
  })
  original: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Define se o valor pode ser alterado pelo pagador (0 ou 1)',
    enum: [0, 1],
  })
  modalidadeAlteracao?: number;
}

class InvoiceDebtorDoc {
  @ApiProperty({
    example: 'Maria Santos',
    description: 'Nome completo do pagador',
    maxLength: 200,
  })
  nome: string;

  @ApiPropertyOptional({
    example: '40352056053',
    description: 'CPF do pagador (11 dígitos)',
  })
  cpf?: string;

  @ApiPropertyOptional({
    example: '72594091000141',
    description: 'CNPJ do pagador (14 dígitos)',
  })
  cnpj?: string;
}

class InvoiceAdditionalInfoDoc {
  @ApiProperty({
    example: 'pedidoId',
    description: 'Nome do campo adicional',
  })
  nome: string;

  @ApiProperty({
    example: '123456',
    description: 'Valor do campo adicional',
  })
  valor: string;
}

export class CreateInvoiceDocDTO {
  @ApiProperty({
    description: 'Nome do recebedor associado à chave PIX',
    example: 'Loja Exemplo LTDA',
  })
  nomeRecebedor: string;

  @ApiProperty({
    description: 'Identificador único da cobrança',
    example: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
  })
  txid: string;

  @ApiPropertyOptional({
    description: 'Mensagem exibida ao pagador',
    example: 'Pagamento do pedido 123',
    maxLength: 140,
  })
  solicitacaoPagador?: string;

  @ApiPropertyOptional({
    type: InvoiceCalendarDoc,
    description: 'Configurações de expiração da cobrança',
  })
  calendario?: InvoiceCalendarDoc;

  @ApiProperty({
    type: InvoiceValueDoc,
    description: 'Informações sobre o valor da cobrança',
  })
  valor: InvoiceValueDoc;

  @ApiProperty({
    type: InvoiceDebtorDoc,
    description: 'Informações do pagador (CPF ou CNPJ)',
  })
  devedor: InvoiceDebtorDoc;

  @ApiPropertyOptional({
    type: [InvoiceAdditionalInfoDoc],
    description: 'Campos adicionais opcionais',
    maxItems: 50,
  })
  infoAdicionais?: InvoiceAdditionalInfoDoc[];
}
