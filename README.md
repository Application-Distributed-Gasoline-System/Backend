# FuelOps · Backend

Backend de gestión de flotas y combustible desarrollado en equipo para Aplicaciones Distribuidas, Universidad Técnica de Ambato.

[Aplicación publicada](https://fuelops.dayle.dev) · [Demo de solo lectura](https://fuelops.dayle.dev/demo) · [Frontend](https://github.com/Application-Distributed-Gasoline-System/Frontend)

## Servicios

| Servicio    | Responsabilidad                                           | Persistencia    |
| ----------- | --------------------------------------------------------- | --------------- |
| API Gateway | API REST, validación de sesiones y permisos               | Sin base propia |
| auth-ms     | Usuarios, roles, JWT, renovación y recuperación de acceso | PostgreSQL      |
| drivers-ms  | Conductores y sincronización de usuarios                  | PostgreSQL      |
| vehicles-ms | Vehículos y disponibilidad; réplica de lectura opcional   | PostgreSQL      |
| routes-ms   | Asignaciones, recorridos y estados                        | PostgreSQL      |
| fuel-ms     | Registros, estimaciones y reportes de combustible         | MongoDB         |

La API Gateway consulta los servicios mediante gRPC y contratos de `proto/`. NATS coordina eventos entre módulos. Cada servicio mantiene su propia base y sus referencias de datos de otros módulos.

El repositorio incluye configuraciones de Prometheus/Grafana y un despliegue histórico de Kubernetes. La instalación de portafolio usa Docker Compose y un túnel exclusivo de Cloudflare.

## Despliegue completo con bases nuevas

Requisitos: Docker con Compose v2 o posterior, Python 3 y los repositorios Backend y Frontend en carpetas hermanas.

```sh
mkdir GasolineSystem
cd GasolineSystem
git clone https://github.com/Application-Distributed-Gasoline-System/Backend.git Backend
git clone https://github.com/Application-Distributed-Gasoline-System/Frontend.git Frontend
cd Backend/deploy
sh deploy.sh --seed
```

El primer arranque genera secretos independientes en `deploy/.env`, crea PostgreSQL y MongoDB, aplica migraciones y carga datos ficticios. El frontend se expone en `127.0.0.1:3080`; las bases y gRPC permanecen en la red Docker.

Consulta [deploy/README.md](deploy/README.md) para dominio, Cloudflare Tunnel, copias de seguridad, correo y actualización de contenedores.

Los datos de demostración son 12 vehículos, 8 conductores, 96 rutas y 720 registros de combustible. La cuenta pública demo puede consultar los módulos, pero el gateway rechaza sus escrituras. El administrador privado conserva las operaciones de gestión.

## Desarrollo

Cada servicio es un proyecto NestJS independiente y utiliza su propio `package-lock.json`. Se recomienda Node.js 22.

```sh
cd api-gateway
npm ci
npm run start:dev
```

En servicios con Prisma, ejecuta `npx prisma generate` después de instalar. Configura las variables documentadas por las plantillas del servicio y por `.env.example` de la raíz; para Docker de desarrollo, usa `docker-compose.yml`. Usa bases y credenciales propias.

Las imágenes de producción se construyen con `deploy/Dockerfile`. Conservan los archivos `.proto` y el cliente generado de Prisma, y ejecutan migraciones al iniciar. El Compose nuevo no necesita un registro privado de imágenes.

## Verificación

```sh
cd api-gateway
npm test -- --runInBand
npm run build
```

Repite los comandos en `auth-ms` y `fuel-ms`. Las pruebas cubren usuarios desactivados, roles actuales, rotación y reutilización de tokens, restricciones de la cuenta demo y fechas inclusivas de los reportes.

La renovación del acceso no exige un access token vigente. Los tokens de renovación tienen una vida limitada y se consumen de forma atómica. Los reportes incluyen el día final completo y consultan las referencias de vehículos en lote.

## Secretos y operación

Las contraseñas, las claves JWT y los tokens de Cloudflare se configuran por entorno y no se versionan. El correo requiere una cuenta SMTP propia. La cuenta demo usa datos sintéticos y no admite recuperación de contraseña.

La infraestructura nueva mantiene sus contenedores, red y volúmenes bajo el proyecto Compose `fuelops`. No se requiere modificar servicios de otros proyectos del servidor.
