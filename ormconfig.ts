import 'dotenv/config';
import { DataSource } from 'typeorm';

const parseBoolean = (value?: string, fallback = false): boolean => {
  if (!value) return fallback;
  return ['true', '1', 'enabled', 'yes'].includes(value.toLowerCase());
};

const defaultSynchronize = parseBoolean(
  process.env.DB_SYNCHRONIZE,
  process.env.NODE_ENV !== 'production',
);

const isTestEnv = process.env.NODE_ENV === 'test';
const entitiesPaths = isTestEnv
  ? ['src/**/*.entity.ts']
  : ['dist/**/*.entity.js'];
const migrationsPaths = isTestEnv
  ? ['src/**/migrations/*.ts']
  : ['dist/**/migrations/*.js'];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'postgres',
  entities: entitiesPaths,
  logging: parseBoolean(process.env.DB_LOGGING),
  synchronize: defaultSynchronize,
  migrationsRun: parseBoolean(process.env.DB_RUN_MIGRATIONS),
  migrations: migrationsPaths,
});

export default AppDataSource;
