import 'dotenv/config';
import pg from 'pg';
import { createApp } from './app.js';
const secretKey = process.env.JWT_SECRET;
if (!secretKey || secretKey.length < 32) {
  console.error('Debo configurar JWT_SECRET con 32 caracteres o más en .env');
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = createApp({ pool, secretKey });
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`FutScript disponible en http://localhost:${port}`));
