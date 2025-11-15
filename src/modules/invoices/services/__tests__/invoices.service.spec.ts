import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';

import { NuvendeInvoiceService } from '@crosscutting/infra/http/services';
import {
  INuvendeInvoiceResponse,
} from '@crosscutting/infra/http/interfaces';

import { InvoicesService } from '../invoices.service';
import { CreateInvoiceDTO } from '../../dtos';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'generated-txid-with-dashes-uuid-value'),
}));

describe('InvoicesService', () => {
  let service: InvoicesService;
  let nuvende: jest.Mocked<NuvendeInvoiceService>;

  const dto: CreateInvoiceDTO = {
    nomeRecebedor: 'Loja Exemplo',
    txid: 'CUSTOMTXID001',
    solicitacaoPagador: 'Pagar em 2 dias',
    calendario: { expiracao: 3600 },
    valor: { original: '9.99', modalidadeAlteracao: 1 },
    devedor: { nome: 'Cliente', cpf: '12345678901' },
    infoAdicionais: [
      { nome: 'pedido', valor: '123' },
      { nome: 'referencia', valor: 'ABC' },
    ],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: NuvendeInvoiceService,
          useValue: {
            createInvoice: jest.fn(),
            getInvoice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(InvoicesService);
    nuvende = moduleRef.get(NuvendeInvoiceService);
  });

    it('should call Nuvende service using provided txid', async () => {
      const mockedResponse = { txid: dto.txid } as INuvendeInvoiceResponse;
      nuvende.createInvoice.mockResolvedValue(mockedResponse);

      const result = await service.create(dto);

      expect(result).toBe(mockedResponse);
      expect(nuvende.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          txid: dto.txid,
        }),
      );
    });

    it('should generate txid if not provided', async () => {
      const mockedResponse = { txid: 'generated-id' } as INuvendeInvoiceResponse;
      nuvende.createInvoice.mockResolvedValue(mockedResponse);

      const dtoWithoutTxid = { ...dto, txid: undefined };
      const trimmedUuid = 'generated-txid-with-dashes-uuid-value'
        .replace(/-/g, '')
        .substring(0, 35);

      const result = await service.create(dtoWithoutTxid);

      expect(result).toBe(mockedResponse);
      expect(nuvende.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({ txid: trimmedUuid }),
      );
      expect(randomUUID).toHaveBeenCalled();
    });

    it('should forward errors from Nuvende API', async () => {
      nuvende.createInvoice.mockRejectedValue(new Error('API error'));

      await expect(service.create(dto)).rejects.toThrow('API error');
    });
  
});
