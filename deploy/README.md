# FuelOps en Oracle

Sitio público: https://fuelops.dayle.dev · Demo directa: https://fuelops.dayle.dev/demo

El despliegue está en `/home/ubuntu/fuelops`. Contiene carpetas hermanas `Backend/` y `Frontend/`. Todos los servicios, volúmenes y la red del proyecto usan el prefijo `fuelops`. Las bases y gRPC no publican puertos del host. El frontend está disponible solo en `127.0.0.1:3080` y en el túnel dedicado `fuelops-oracle`.

## Operación habitual

Desde el servidor:

```sh
cd /home/ubuntu/fuelops/Backend/deploy
docker compose --env-file .env -f compose.oracle.yml ps
docker compose --env-file .env -f compose.oracle.yml logs --tail 100 api-gateway frontend
curl -fsS http://127.0.0.1:3080/api/health
```

El archivo `.env` tiene permisos privados y contiene las claves generadas. El usuario inicial de administración está en `ADMIN_EMAIL` y su contraseña en `ADMIN_PASSWORD`. Consulta esos valores únicamente en tu sesión privada del servidor; no los añadas al repositorio ni al material del portafolio.

El visitante no necesita estas credenciales. `/demo` utiliza una cuenta pública con escrituras bloqueadas por el gateway.

## Actualizar código

La instalación espera los repositorios `Backend` y `Frontend` en carpetas hermanas. Actualiza ambos checkouts con sus cambios publicados y revisa el diff antes de desplegar. Compilar desde Git no modifica los secretos de `deploy/.env` ni los datos persistentes.

Para una instalación nueva:

```sh
mkdir GasolineSystem
cd GasolineSystem
git clone https://github.com/Application-Distributed-Gasoline-System/Backend.git Backend
git clone https://github.com/Application-Distributed-Gasoline-System/Frontend.git Frontend
cd Backend/deploy
sh deploy.sh --seed
```

El frontend de FuelOps debe estar disponible en el checkout de `Frontend`. Si se usa una rama todavía pendiente de fusión, selecciónala antes de ejecutar el despliegue.

Transfiere los archivos actualizados sin `.env`, `.git`, `node_modules` ni datos de los volúmenes. Compila y recrea solo los servicios afectados:

```sh
cd /home/ubuntu/fuelops/Backend/deploy
docker compose --env-file .env -f compose.oracle.yml build frontend
docker compose --env-file .env -f compose.oracle.yml up -d --no-deps frontend
```

Para una instalación completa o actualización de todo FuelOps:

```sh
sh deploy.sh
```

La primera carga de datos de ejemplo usa `sh deploy.sh --seed`. El seed es idempotente y no elimina registros existentes. No necesita repetirse en cada actualización.

## Bases, migraciones y fechas de la demo

PostgreSQL 17 contiene `authdb`, `driversdb`, `vehiclesdb` y `routesdb`. MongoDB 7 utiliza `fueldb` en el replica set `rs0`. Sus volúmenes son independientes de las bases de otros proyectos.

Los servicios SQL ejecutan `prisma migrate deploy` al iniciar. El servicio de combustible sincroniza índices con `prisma db push`, sin aceptar pérdida de datos. El cliente Prisma se genera durante la compilación y se conserva en la imagen de producción.

`DEMO_DATA_DATE` fija la referencia inicial de los filtros para la cuenta demo, de forma que el ejemplo siga siendo visible con el paso del tiempo. Las cuentas privadas utilizan la fecha actual. Cambiar esa referencia requiere reconstruir el frontend; no cambia automáticamente las fechas de los registros.

## Correo

Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SENDER_EMAIL` con una cuenta propia si quieres activar los correos de bienvenida y recuperación. El despliegue de portafolio no reutiliza las credenciales de Brevo del proyecto antiguo. Sin SMTP válido, el acceso con contraseña funciona, pero no se entregan los correos de recuperación.

## Túnel y publicación

El túnel exclusivo de FuelOps dirige `fuelops.dayle.dev` a `http://frontend:3000`. Su token se conserva en `.env`. Para iniciarlo o actualizarlo:

```sh
docker compose --env-file .env -f compose.oracle.yml --profile public up -d cloudflared
docker compose --env-file .env -f compose.oracle.yml logs --tail 30 cloudflared
```

No se modifica Nginx Proxy Manager ni el túnel de otros proyectos. Evita comandos globales como `docker system prune`, y no uses `down -v` si quieres conservar las bases de FuelOps.

## Copias de seguridad

Conserva fuera del servidor una copia privada de `.env` y de los datos que quieras mantener. Ejemplos, desde esta carpeta:

```sh
mkdir -p backups
chmod 700 backups
docker compose --env-file .env -f compose.oracle.yml exec -T postgres pg_dumpall -U fuelops > backups/postgres.sql
chmod 600 backups/postgres.sql
docker compose --env-file .env -f compose.oracle.yml exec -T mongo sh -c 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --db fueldb --archive --gzip' > backups/mongo.archive.gz
chmod 600 backups/mongo.archive.gz
```

Los backups y el `.env` no deben incluirse en la carpeta del portafolio.
