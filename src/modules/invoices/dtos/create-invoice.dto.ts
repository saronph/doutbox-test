import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class InvoiceCalendarDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(86400)
  expiracao?: number;
}

class InvoiceValueDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'original deve ser uma string numérica com até duas casas decimais',
  })
  original: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  modalidadeAlteracao?: number;
}

class InvoiceDebtorDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @ValidateIf((debtor: InvoiceDebtorDTO) => !debtor.cnpj)
  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'cpf deve conter exatamente 11 dígitos numéricos',
  })
  cpf?: string;

  @ValidateIf((debtor: InvoiceDebtorDTO) => !debtor.cpf)
  @IsOptional()
  @Matches(/^\d{14}$/, {
    message: 'cnpj deve conter exatamente 14 dígitos numéricos',
  })
  cnpj?: string;
}

class InvoiceAdditionalInfoDTO {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  valor: string;
}

export class CreateInvoiceDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nomeRecebedor: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]{1,35}$/, {
    message: 'txid deve conter até 35 caracteres alfanuméricos',
  })
  txid: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  solicitacaoPagador?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceCalendarDTO)
  calendario?: InvoiceCalendarDTO;

  @ValidateNested()
  @Type(() => InvoiceValueDTO)
  valor: InvoiceValueDTO;

  @ValidateNested()
  @Type(() => InvoiceDebtorDTO)
  devedor: InvoiceDebtorDTO;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(50)
  @Type(() => InvoiceAdditionalInfoDTO)
  infoAdicionais?: InvoiceAdditionalInfoDTO[];
}
