CREATE DATABASE futscript;
\connect futscript
CREATE TABLE IF NOT EXISTS equipos (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE TABLE IF NOT EXISTS posiciones (id SERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS jugadores (
  id SERIAL PRIMARY KEY,
  id_equipos INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL REFERENCES posiciones(id),
  name VARCHAR(100) NOT NULL
);
INSERT INTO posiciones (name) VALUES ('arquero'),('defensa'),('centrocampista'),('delantero') ON CONFLICT (name) DO NOTHING;
