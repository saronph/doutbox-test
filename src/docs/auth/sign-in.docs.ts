import { ApiProperty } from '@nestjs/swagger';
import { SignInDocDTO } from '@docs/auth/dtos';

class AuthenticatedUserDoc {
  @ApiProperty({
    example: '3f1c2b6e-9a4d-4e7b-8c2f-5a1d3e9b7f0c',
    description: 'Identificador único do usuário (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Usuário Demo',
    description: 'Nome completo do usuário autenticado',
  })
  name: string;

  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'E-mail do usuário autenticado',
  })
  email: string;

  @ApiProperty({
    example: '3f1c2b6e-9a4d-4e7b-8c2f-5a1d3e9b7f0c',
    description: 'Chave Invoice do usuário (UUID)',
  })
  pixKey: string;
}

export class SignInRequestDoc extends SignInDocDTO {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'senhaSegura123',
    description: 'Senha do usuário',
  })
  password: string;
}

export class SignInResponseDoc {
  @ApiProperty({
    type: AuthenticatedUserDoc,
    description: 'Informações do usuário autenticado',
  })
  user: AuthenticatedUserDoc;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT gerado após a autenticação',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT usado para renovar o acesso (refresh token)',
  })
  refresh_token: string;
}
