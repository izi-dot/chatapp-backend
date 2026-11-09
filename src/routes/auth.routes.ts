import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { database } from '../database.controller';
import type { LoginRequest, RegisterRequest } from '../domains/user.domain';
 
export const authRouter = Router();
 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
authRouter.post('/register', async (req, res) => {
  const body = req.body as Partial<RegisterRequest>;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
 
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email and password are required' });
    return;
  }
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must have at least 8 characters' });
    return;
  }
 
  try {
    if (await database.findUserByEmail(email)) {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }
 
    const passwordHash = await bcrypt.hash(password, 10);
    const id = await database.createUser(name, email, passwordHash);
 
    res.status(201).json({ id, name, email });
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Email is already registered' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
authRouter.post('/login', async (req, res) => {
  const body = req.body as Partial<LoginRequest>;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
 
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
 
  try {
    const user = await database.findUserByEmail(email);
    // Rovnaka chyba pre zly email aj zle heslo, aby sa nedalo zistit, ktore emaily existuju
    const passwordOk = user ? await bcrypt.compare(password, user.password) : false;
 
    if (!user || !passwordOk) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
 
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
    });
 
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});