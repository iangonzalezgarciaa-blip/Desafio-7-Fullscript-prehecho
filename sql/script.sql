CREATE DATABASE futscript;
\connect futscript
CREATE TABLE IF NOT EXISTS equipos (id SERIAL PRIMARY KEY, name VARCHAR(250) NOT NULL);
CREATE TABLE IF NOT EXISTS posiciones (id SERIAL PRIMARY KEY, name VARCHAR(250) NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS jugadores (
  id SERIAL PRIMARY KEY,
  id_equipo INT REFERENCES equipos(id),
  name VARCHAR(250),
  position INT REFERENCES posiciones(id)
);
INSERT INTO posiciones (name) VALUES ('delantero'), ('centrocampista'), ('defensa'), ('portero') ON CONFLICT (name) DO NOTHING;
