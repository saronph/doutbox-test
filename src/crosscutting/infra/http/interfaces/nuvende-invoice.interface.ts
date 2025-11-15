export interface INuvendeInvoicePayload {
  txid: string;
  nomeRecebedor: string;
  solicitacaoPagador?: string;
  calendario?: {
    expiracao?: number;
  };
  valor: {
    original: string;
    modalidadeAlteracao?: number;
  };
  devedor: {
    nome: string;
    cpf?: string;
    cnpj?: string;
  };
  infoAdicionais?: Array<{
    nome: string;
    valor: string;
  }>;
}

export interface INuvendeInvoiceResponse {
  txid: string;
  revisao: number;
  status: string;
  calendario: {
    criacao: string;
    expiracao: number;
  };
  devedor: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
  valor: {
    original: string;
    modalidadeAlteracao?: number;
  };
  qrCode: string;
  chave: string;
  solicitacaoPagador?: string;
  raw: {
    txid: string;
    revisao: number;
    status: string;
    calendario: {
      criacao: string;
      expiracao: number;
    };
    devedor: {
      cpf?: string;
      cnpj?: string;
      nome: string;
    };
    valor: {
      original: string;
      modalidadeAlteracao?: number;
    };
    qrCode: string;
    chave: string;
    solicitacaoPagador?: string;
  };
}
