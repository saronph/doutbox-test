import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { User } from '@modules/users/entities';
import { CryptService } from '@modules/auth/services/crypt.service';
import { AppModule } from '../../../../app.module';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const signInDto = {
    email: 'admin@example.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleRef.get(DataSource);

    await dataSource.synchronize(true);

    const crypt = moduleRef.get(CryptService);
    const hashedPassword = await crypt.hash(signInDto.password);

    await dataSource.getRepository(User).save({
      name: 'Admin',
      email: signInDto.email,
      password: hashedPassword,
      pixKey: 'pix-key',
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('POST /auth/sign-in should authenticate and return tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(signInDto)
      .expect(201);

    expect(response.body.user).toMatchObject({
      name: 'Admin',
      email: signInDto.email,
      pixKey: 'pix-key',
    });
    expect(response.body).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('POST /auth/sign-in should fail with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'admin@example.com',
        password: 'senhaErrada',
      })
      .expect(401);
  });

  it('POST /auth/sign-in should validate the DTO (invalid email)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email: 'email_invalido',
        password: '123456',
      })
      .expect(400);

    expect(res.body.message).toContain('email must be an email');
  });
});
