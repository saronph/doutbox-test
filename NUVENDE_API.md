# Integração com API Nuvende

Este documento descreve como usar a autenticação com a API externa da Nuvende.

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# API Externa Nuvende
NUVENDE_API_BASE_URL=https://api-h.nuvende.com.br/api/v2
NUVENDE_CLIENT_ID=seu_client_id_aqui
NUVENDE_CLIENT_SECRET=seu_client_secret_aqui
```

### 2. Como Obter as Credenciais

As credenciais `client_id` e `client_secret` devem ser fornecidas pela Nuvende.

## Como Usar

### Injeção do Serviço

O `NuvendeAuthService` está disponível globalmente através do `HttpModule`. Para usá-lo, basta injetá-lo em qualquer service ou controller:

```typescript
import { Injectable } from '@nestjs/common';
import { NuvendeAuthService } from '@crosscutting/infra/http/services';

@Injectable()
export class MeuService {
  constructor(private readonly nuvendeAuthService: NuvendeAuthService) {}

  async minhaFuncao() {
    // Obter token de acesso (gerenciado automaticamente com cache)
    const accessToken = await this.nuvendeAuthService.getAccessToken();

    // Usar o token em requisições para a API Nuvende
    // ...
  }
}
```

### Métodos Disponíveis

#### `getAccessToken(): Promise<string>`

Obtém um token de acesso válido. O serviço gerencia automaticamente o cache do token e renova quando necessário.

- Retorna token em cache se ainda válido (considera 5 minutos de margem)
- Faz nova autenticação automaticamente se token expirado
- Lança exceção em caso de erro

```typescript
const token = await this.nuvendeAuthService.getAccessToken();
```

#### `authenticate(): Promise<string>`

Força uma nova autenticação com a API Nuvende, ignorando o cache.

```typescript
const token = await this.nuvendeAuthService.authenticate();
```

#### `clearCache(): void`

Limpa o token em cache. Útil para forçar nova autenticação na próxima chamada.

```typescript
this.nuvendeAuthService.clearCache();
```

## Detalhes Técnicos

### Formato da Autenticação

A autenticação segue o padrão OAuth 2.0 com Basic Authentication:

1. **Credenciais**: São codificadas em Base64 no formato `client_id:client_secret`
2. **Endpoint**: `POST https://api-h.nuvende.com.br/api/v2/auth/login`
3. **Headers**:
   - `Content-Type: application/x-www-form-urlencoded`
   - `Authorization: Basic {credenciais_base64}`

### Cache de Token

O serviço implementa cache automático do token:

- Token é armazenado em memória após autenticação
- Renovação automática 5 minutos antes da expiração
- Fallback para 1 hora se `expires_in` não for fornecido pela API

### Tratamento de Erros

O serviço lança `BadRequestException` em casos de:

- Credenciais inválidas
- Erro na comunicação com a API
- Resposta inesperada da API

Os erros são logados automaticamente para debugging.

## Exemplo Completo

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { NuvendeAuthService } from '@crosscutting/infra/http/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExemploService {
  private readonly logger = new Logger(ExemploService.name);

  constructor(
    private readonly nuvendeAuthService: NuvendeAuthService,
    private readonly httpService: HttpService,
  ) {}

  async buscarDadosNuvende() {
    try {
      // 1. Obter token de acesso
      const accessToken = await this.nuvendeAuthService.getAccessToken();

      // 2. Fazer requisição para API Nuvende
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api-h.nuvende.com.br/api/v2/seu-endpoint',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar dados da Nuvende', error);
      throw error;
    }
  }
}
```

## Módulos Relacionados

- **HttpModule** (`src/crosscutting/infra/http/http.module.ts`): Módulo principal que exporta o NuvendeAuthService
- **NuvendeAuthService** (`src/crosscutting/infra/http/services/nuvende-auth.service.ts`): Serviço de autenticação
- **Config** (`src/crosscutting/config/nuvende-api.config.ts`): Configurações da API Nuvende

## Notas Importantes

1. **Segurança**: Nunca commite as credenciais no repositório. Use variáveis de ambiente.
2. **Cache**: O token é armazenado apenas em memória. Em ambientes com múltiplas instâncias, cada instância terá seu próprio cache.
3. **Rate Limiting**: Considere implementar rate limiting se necessário para evitar muitas requisições de autenticação.
4. **Monitoramento**: Os logs ajudam a monitorar autenticações e possíveis problemas.
