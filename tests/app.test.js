import { jest, test, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

const pool = { query: jest.fn(async (sql) => {
  if (sql.startsWith('SELECT id, name FROM equipos')) return { rows: [{ id: 1, name: 'Real Madrid' }] };
  if (sql.includes('INNER JOIN')) return { rows: [{ name: 'Jugador Uno', posicion: 'delantero' }] };
  if (sql.startsWith('INSERT INTO equipos')) return { rows: [{ id: 2, name: 'Barcelona' }] };
  return { rows: [{ id: 1, name: 'Jugador Uno', position: 4, id_equipos: 1 }] };
}) };
const app = createApp({ pool, secretKey: 'clave-super-segura-para-pruebas-1234567890' });

test('GET /equipos devuelve un Array y status 200', async () => {
  const res = await request(app).get('/equipos');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
test('POST /login correcto devuelve un Object con JWT', async () => {
  const res = await request(app).post('/login').send({ username: 'admin', password: '1234' });
  expect(res.status).toBe(200);
  expect(typeof res.body).toBe('object');
  expect(typeof res.body.token).toBe('string');
});
test('POST /login incorrecto devuelve status 400', async () => {
  const res = await request(app).post('/login').send({ username: 'admin', password: 'incorrecta' });
  expect(res.status).toBe(400);
});
test('POST /equipos/:teamID/jugadores con token válido devuelve 201', async () => {
  const login = await request(app).post('/login').send({ username: 'admin', password: '1234' });
  const res = await request(app).post('/equipos/1/jugadores')
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({ name: 'Jugador Uno', posicion: 'delantero' });
  expect(res.status).toBe(201);
});
test('POST /equipos sin token devuelve 401', async () => {
  const res = await request(app).post('/equipos').send({ name: 'Barcelona' });
  expect(res.status).toBe(401);
});
test('GET /equipos/:teamID/jugadores devuelve posición mediante INNER JOIN', async () => {
  const res = await request(app).get('/equipos/1/jugadores');
  expect(res.status).toBe(200);
  expect(res.body[0]).toEqual({ name: 'Jugador Uno', posicion: 'delantero' });
});