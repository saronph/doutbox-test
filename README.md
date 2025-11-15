<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST para gerenciamento de invoices PIX integrada com a API Nuvende.

## Tecnologias

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Docker
- Jest

## Instalação

### Com Docker (Recomendado)

1. Clone o repositório:

```bash
git clone <repository-url>
cd doutbox-test
```

2. Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

3. Inicie os containers:

```bash
docker-compose up -d
```

A API estará disponível em `http://localhost:3000`

### Sem Docker

1. Instale as dependências:

```bash
pnpm install
```

2. Configure as variáveis de ambiente no arquivo `.env`

3. Certifique-se de que o PostgreSQL está rodando

4. Execute a aplicação:

```bash
# development
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

## Docker Commands

```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar containers
docker-compose down

# Rebuild da API
docker-compose up -d --build api

# Acessar shell da API
docker-compose exec api sh
```

## Run tests

```bash
# unit tests
pnpm run test:unit

# test coverage
pnpm run test:cov
```

## Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis necessárias.

Principais variáveis:

- `DB_*`: Configurações do banco de dados
- `JWT_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`: Secrets para JWT
- `NUVENDE_*`: Credenciais da API Nuvende

## Testando a API

1. Acesse a documentação Swagger em `http://localhost:3000/docs`

2. Faça o sign-in:
   - Clique em `POST /auth/sign-in`
   - Clique em "Try it out"
   - Insira as credenciais de um usuário
   - Execute a requisição
   - Copie o `access_token` do retorno

3. Autorize as requisições:
   - Clique no botão "Authorize" no topo da página
   - Cole o `access_token` no campo
   - Clique em "Authorize"

4. Agora você pode testar as rotas protegidas:
   - `POST /invoices` - Criar cobrança PIX
   - Body tem cpf e cnpj, envie apenas um dos dois

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
