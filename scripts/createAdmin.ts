import 'reflect-metadata';
import 'dotenv/config';

import { cryptConstants } from '@modules/auth/constants/crypt';
import { User } from '@modules/users/entities';
import * as bcryptjs from 'bcryptjs';
import type { DataSource } from 'typeorm';
import AppDataSource from 'ormconfig';

const ADMIN_EMAIL = 'admin@doutbox.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'Administrador Doutbox';
const ADMIN_PIX = '3f1c2b6e-9a4d-4e7b-8c2f-5a1d3e9b7f0c';

export async function seedAdmin(dataSource?: DataSource): Promise<void> {
  const dataSourceInstance = dataSource ?? AppDataSource;
  let shouldDestroy = false;

  if (!dataSourceInstance.isInitialized) {
    await dataSourceInstance.initialize();
    shouldDestroy = true;
  }

  const usersRepository = dataSourceInstance.getRepository(User);

  const existingAdmin = await usersRepository.findOne({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    if (shouldDestroy) {
      await dataSourceInstance.destroy();
    }

    return;
  }

  const passwordHash = await bcryptjs.hash(ADMIN_PASSWORD, cryptConstants.SALT);

  const adminUser = usersRepository.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: passwordHash,
    pixKey: ADMIN_PIX,
  });

  await usersRepository.save(adminUser);

  console.log('[seed] Admin user created successfully.');

  if (shouldDestroy) {
    await dataSourceInstance.destroy();
  }
}

if (require.main === module) {
  seedAdmin().catch((error) => {
    console.error('[seed] Failed to create admin user:', error);
    process.exitCode = 1;
  });
}
