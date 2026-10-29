import 'dotenv/config';
import { jest, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import pg from 'pg';
import { createApp } from '../src/app.js';

const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const app=createApp({pool,secretKey:process.env.JWT_SECRET});
let teamId, positionId;
beforeAll(async()=>{
  await pool.query('CREATE TABLE IF NOT EXISTS equipos (id SERIAL PRIMARY KEY, name VARCHAR(250) NOT NULL)');
  await pool.query('CREATE TABLE IF NOT EXISTS posiciones (id SERIAL PRIMARY KEY, name VARCHAR(250) NOT NULL UNIQUE)');
  await pool.query('CREATE TABLE IF NOT EXISTS jugadores (id SERIAL PRIMARY KEY, id_equipo INTEGER REFERENCES equipos(id), name VARCHAR(250), position INTEGER REFERENCES posiciones(id))');
  const p=await pool.query("INSERT INTO posiciones (name) VALUES ('delantero') ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id");
  positionId=p.rows[0].id;
});
afterAll(async()=>{
  if(teamId)await pool.query('DELETE FROM jugadores WHERE id_equipo=$1',[teamId]);
  if(teamId)await pool.query('DELETE FROM equipos WHERE id=$1',[teamId]);
  await pool.end();
});
test('inserto equipo con JWT y consulto GET /equipos',async()=>{
  const auth=await request(app).post('/login').send({username:'admin',password:'1234'});
  expect(auth.status).toBe(200);
  const r=await request(app).post('/equipos').set('Authorization','Bearer '+auth.body.token).send({name:'Equipo prueba'});
  expect(r.status).toBe(201);teamId=r.body.id;
  const list=await request(app).get('/equipos');
  expect(list.status).toBe(200);
  expect(list.body).toEqual(expect.arrayContaining([expect.objectContaining({id:teamId,name:'Equipo prueba'})]));
});
test('inserto jugador y consulto INNER JOIN real',async()=>{
  const auth=await request(app).post('/login').send({username:'admin',password:'1234'});
  const ins=await request(app).post('/equipos/'+teamId+'/jugadores').set('Authorization','Bearer '+auth.body.token).send({name:'Jugador prueba',position:positionId});
  expect(ins.status).toBe(201);
  const res=await request(app).get('/equipos/'+teamId+'/jugadores');
  expect(res.status).toBe(200);
  expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({name:'Jugador prueba',posicion:'delantero'})]));
});
test('rechazo cambios sin JWT',async()=>{
  const res=await request(app).post('/equipos').send({name:'Sin permiso'});
  expect(res.status).toBe(401);
});
