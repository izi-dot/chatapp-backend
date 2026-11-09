import type { RowDataPacket } from 'mysql2/promise';
 
export interface User {
  id: number;
  name: string;
  email: string;
  lastOnline: Date | null;
  createdAt: Date;
}
 
export interface UserWithPassword extends User {
  password: string; // hash hesla, nikdy ho nevracaj klientovi
}
 
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
 
export interface LoginRequest {
  email: string;
  password: string;
}
 
// Tvar riadku tak, ako ho vracia databaza (snake_case)
export interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  last_online: Date | null;
  created_at: Date;
}