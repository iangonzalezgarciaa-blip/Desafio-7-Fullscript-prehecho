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

Agregué los cuatro casos requeridos en el PDF: listado de equipos HTTP 200, login correcto con objeto JWT, login incorrecto HTTP 400 y creación de jugador con JWT HTTP 201. Incorporé además pruebas para la protección de equipos y para el listado de jugadores.

Para los tests simulo la respuesta de la base de datos. La ejecución real con PostgreSQL debe comprobarse configurando una base local.

## Consideraciones

El PDF indica que existe un material de apoyo por separado con el servidor inicial y el archivo `script.sql`. Como ese material no estaba adjunto, armé una implementación autónoma siguiendo las rutas y el esquema relacional que muestra el enunciado. Mi script SQL está incluido en este repositorio.

## Pruebas

Mis pruebas con Jest y Supertest cubren el listado de equipos, inicio de sesión correcto e incorrecto, creación autorizada de jugadores, rechazo de equipos sin token y consulta de jugadores.

Ejecuto las pruebas con:

```bash
npm install
npm test
```

**Resultado de GitHub Actions:** ejecución exitosa. [Ver la ejecución de mis pruebas](https://github.com/iangonzalezgarciaa-blip/Desafio-7-Fullscript-prehecho/actions/runs/40827562981).

Las pruebas automatizadas no constituyen por sí solas una validación de integración con PostgreSQL o con material de apoyo externo.
