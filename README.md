# Desafío 7 — FutScript

## Mi proyecto

En este desafío desarrollé una API REST para administrar equipos y jugadores de escuelas de fútbol. Implementé Express, PostgreSQL, autenticación JWT y pruebas con Jest y Supertest.

## Instalación y ejecución

1. Instalo dependencias: `npm install`.
2. Creo la base de datos con `psql -U postgres -f sql/script.sql`.
3. Copio `.env.example` a `.env`, configuro `DATABASE_URL` y una clave privada `JWT_SECRET` de al menos 32 caracteres.
4. Inicio el servidor con `npm start` o `npm run dev`.
5. Ejecuto las pruebas mediante `npm test`.

El servidor usa el puerto 3000 de forma predeterminada. No publico el archivo `.env`.

## Rutas que desarrollé

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| POST | `/login` | No | Inicio sesión como administrador y obtengo un JWT. |
| GET | `/equipos` | No | Consulto todos los equipos. |
| POST | `/equipos` | JWT | Registro equipos. |
| GET | `/equipos/:teamID/jugadores` | No | Consulto los jugadores mediante INNER JOIN. |
| POST | `/equipos/:teamID/jugadores` | JWT | Registro jugadores. |

Las credenciales que exige el enunciado para el administrador de prueba son:

```json
{ "username": "admin", "password": "1234" }
```

En las rutas protegidas envío `Authorization: Bearer TOKEN`.

### Ejemplo de equipo

```http
POST http://localhost:3000/equipos
Authorization: Bearer TOKEN
Content-Type: application/json

{ "name": "Real Madrid" }
```

### Ejemplo de jugador

```http
POST http://localhost:3000/equipos/1/jugadores
Authorization: Bearer TOKEN
Content-Type: application/json

{ "name": "Jugador Uno", "posicion": "delantero" }
```

Acepto la posición como nombre o identificador. Uso consultas SQL parametrizadas.

## Pruebas

También ejecuto pruebas con PostgreSQL real para comprobar el registro y listado de equipos, inserción de jugadores y consulta INNER JOIN con autorización JWT.

Escribí ocho pruebas con Jest y Supertest para comprobar las rutas de equipos y jugadores, el inicio de sesión, la protección mediante JWT y las consultas SQL con la relación `jugadores.id_equipo`.

```bash
npm install
npm test
```

Puedo verificar el resultado de la versión actual en [GitHub Actions](https://github.com/iangonzalezgarciaa-blip/Desafio-7-Fullscript-prehecho/actions).

## Base de datos

Adapté `sql/script.sql` al esquema original de FutScript: tablas `equipos`, `posiciones` y `jugadores` relacionadas mediante `jugadores.id_equipo` y `jugadores.position`. Conservo las cuatro posiciones iniciales incluidas en el material oficial.

Las pruebas con una base PostgreSQL en funcionamiento son una comprobación distinta de los tests con base de datos simulada.
