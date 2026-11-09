import dotenv from 'dotenv';
dotenv.config();
 
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
 
interface Config {
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
}
 
export const config: Config = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: required('DB_USER'),
  dbPassword: required('DB_PASSWORD'),
  dbName: required('DB_NAME'),
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};