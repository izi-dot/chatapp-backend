import mysql, { type Pool, type ResultSetHeader } from 'mysql2/promise';
import { config } from './config';
import type { UserRow, UserWithPassword } from './domains/user.domain';
 
export class DatabaseController {
  db: Pool;
 
  constructor() {
    this.db = mysql.createPool({
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
    });
  }
 
  async testConnection(): Promise<void> {
    const connection = await this.db.getConnection();
    await connection.ping();
    connection.release();
    console.log('Connected to MySQL');
  }
 
  private toUser(row: UserRow): UserWithPassword {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      lastOnline: row.last_online,
      createdAt: row.created_at,
    };
  }
 
  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows[0] ? this.toUser(rows[0]) : null;
  }
 
  async createUser(name: string, email: string, passwordHash: string): Promise<number> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );
    return result.insertId;
  }
}
 
export const database = new DatabaseController();