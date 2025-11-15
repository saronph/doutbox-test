import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { NuvendeInvoiceService } from '@crosscutting/infra/http/services';
import { INuvendeInvoiceResponse } from '@crosscutting/infra/http/interfaces';

import { CreateInvoiceDTO } from '../dtos';

@Injectable()
export class InvoicesService {
  constructor(private readonly nuvendeInvoiceService: NuvendeInvoiceService) {}

  async create(data: CreateInvoiceDTO): Promise<INuvendeInvoiceResponse> {
    const txid = data.txid ?? randomUUID().replace(/-/g, '').substring(0, 35);

    const payload = {
      txid,
      nomeRecebedor: data.nomeRecebedor,
      solicitacaoPagador: data.solicitacaoPagador,
      calendario: data.calendario,
      valor: {
        original: data.valor.original,
        modalidadeAlteracao: data.valor.modalidadeAlteracao,
      },
      devedor: {
        nome: data.devedor.nome,
        cpf: data.devedor.cpf,
        cnpj: data.devedor.cnpj,
      },
      infoAdicionais: data.infoAdicionais?.map((info) => ({
        nome: info.nome,
        valor: info.valor,
      })),
    };

    const response = await this.nuvendeInvoiceService.createInvoice(payload);

    return response;
  }
}
