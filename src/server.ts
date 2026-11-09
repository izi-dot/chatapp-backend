import express from 'express';
import { config } from './config';
import { database } from './database.controller';
import { authRouter } from './routes/auth.routes';
 
const app = express();
app.use(express.json());
 
app.use('/auth', authRouter);
 
// Testovaci endpoint: overi, ze server aj databaza bezia
app.get('/health', async (_req, res) => {
  try {
    const [rows] = await database.db.query('SELECT COUNT(*) AS users FROM users');
    res.json({ status: 'ok', rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error' });
  }
});
 
async function start(): Promise<void> {
  await database.testConnection();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}
 
start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});