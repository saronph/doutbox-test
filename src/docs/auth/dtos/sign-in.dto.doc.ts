import { ApiProperty } from '@nestjs/swagger';

export class SignInDocDTO {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@email.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6,
  })
  password: string;
}
