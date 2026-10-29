import express from 'express';
import jwt from 'jsonwebtoken';

// Dejo la conexión inyectable para probar las rutas sin modificar la base de datos.
export function createApp({ pool, secretKey }) {
  if (!pool || typeof pool.query !== 'function') throw new Error('Se requiere PostgreSQL');
  if (!secretKey) throw new Error('Se requiere JWT_SECRET');
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`));
    next();
  });
  function validarToken(req, res, next) {
    const authorization = req.get('Authorization');
    const token = /^Bearer\s+([^\s]+)$/i.exec(authorization || '')?.[1] ||
      (authorization && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(authorization) ? authorization : null);
    if (!token) return res.status(401).json({ error: 'Token requerido en Authorization' });
    try {
      const payload = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
      if (payload.username !== 'admin') return res.status(403).json({ error: 'Acceso no autorizado' });
      req.admin = payload;
      next();
    } catch {
      res.status(401).json({ error: 'Token inválido o vencido' });
    }
  }
  app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username !== 'admin' || password !== '1234') {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ username: 'admin' }, secretKey, { expiresIn: '1h', algorithm: 'HS256' });
    res.status(200).json({ token });
  });
  app.get('/equipos', async (req, res, next) => {
    try {
      const { rows } = await pool.query('SELECT id, name FROM equipos ORDER BY id');
      res.status(200).json(rows);
    } catch (error) { next(error); }
  });
  app.get('/equipos/:teamID/jugadores', async (req, res, next) => {
    if (!/^[1-9]\d*$/.test(req.params.teamID)) return res.status(400).json({ error: 'ID de equipo inválido' });
    try {
      const { rows } = await pool.query(
        `SELECT j.name, p.name AS posicion FROM jugadores AS j
         INNER JOIN posiciones AS p ON j.position = p.id
         INNER JOIN equipos AS e ON j.id_equipo = e.id
         WHERE e.id = $1 ORDER BY j.id`, [req.params.teamID]
      );
      res.status(200).json(rows);
    } catch (error) { next(error); }
  });
  app.post('/equipos', validarToken, async (req, res, next) => {
    const { name } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return res.status(400).json({ error: 'Nombre de equipo inválido' });
    }
    try {
      const { rows } = await pool.query('INSERT INTO equipos (name) VALUES ($1) RETURNING id, name', [name.trim()]);
      res.status(201).json(rows[0]);
    } catch (error) { next(error); }
  });
  app.post('/equipos/:teamID/jugadores', validarToken, async (req, res, next) => {
    if (!/^[1-9]\d*$/.test(req.params.teamID)) return res.status(400).json({ error: 'ID de equipo inválido' });
    const { name, position, posicion } = req.body || {};
    const posicionRecibida = position ?? posicion;
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || posicionRecibida === undefined || posicionRecibida === null) {
      return res.status(400).json({ error: 'Nombre y posición obligatorios' });
    }
    try {
      const sql = `INSERT INTO jugadores (id_equipo, position, name)
        VALUES ($1, (SELECT id FROM posiciones WHERE id = $2 OR LOWER(name) = LOWER($3) LIMIT 1), $4)
        RETURNING id, id_equipo, position, name`;
      const id = Number.isSafeInteger(Number(posicionRecibida)) && Number(posicionRecibida) > 0 ? Number(posicionRecibida) : -1;
      const { rows } = await pool.query(sql, [Number(req.params.teamID), id, String(posicionRecibida), name.trim()]);
      res.status(201).json(rows[0]);
    } catch (error) {
      if (error.code === '23503' || error.code === '23502') return res.status(400).json({ error: 'Equipo o posición inexistente' });
      next(error);
    }
  });
  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
    console.error('Error del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
  return app;
}
