# Backend - Gasoline System

Este repositorio contiene **todos los microservicios y la API Gateway** del proyecto Gasoline System.  
Se maneja como un **monorepo**, por lo que todos los servicios se encuentran dentro de esta misma carpeta raíz.

---

## Introducción

El backend de Gasoline System está diseñado para ser **modular y escalable**, utilizando **microservicios** que se comunican a través de la API Gateway.  
Actualmente se implementan microservicios como **drivers-ms** (conductores) y la **API Gateway**, con la posibilidad de agregar más servicios en el futuro.

El sistema está pensado para trabajar con **bases de datos distribuidas**, permitiendo que los datos estén disponibles en diferentes ubicaciones y que los servicios puedan escalar de manera independiente.  
Actualmente utilizamos **PostgreSQL en la nube (Techno)** y se planea incorporar **MongoDB**, según las necesidades de cada microservicio.  

Además, usamos **Prisma** como ORM para simplificar la interacción con las bases de datos, generando un cliente tipado y seguro para cada microservicio que lo requiera.

---

## Stack tecnológico

- **Backend Framework:** [NestJS](https://nestjs.com/)  
- **Bases de datos distribuidas:**  
  - PostgreSQL (nube, mediante Techno)  
  - MongoDB (futuro, para microservicios que lo requieran)  
- **ORM:** [Prisma](https://www.prisma.io/)  
- **Gestión de dependencias:** npm  
- **Versionamiento:** Git / GitHub  
- **Entorno de desarrollo:** VSCode  
- **Monorepo:** todos los microservicios y la API Gateway en un solo repositorio
- **Docker**: cada microservicio y la API Gateway tienen su propio Dockerfile y .dockerignore.  


## Estructura del proyecto

Backend/<br>
├── api-gateway/      # API Gateway (NestJS) + Dockerfile + .dockerignore<br>
├── drivers-ms/       # Microservicio de conductores (NestJS) + Dockerfile + .dockerignore<br>
├── auth-ms/          # Microservicio de autenticación (NestJS) + Dockerfile + .dockerignore<br>
├── another-ms/       # Otros microservicios futuros + Dockerfile + .dockerignore<br>
├── .dockerignore     # Archivos que no queremos copiar en los contenedores<br>
├── .gitignore        # Reglas de Git para todos los microservicios<br>
├── docker-compose.yml# Infraestructura con docker<br>
└── README.md         # Documentación general<br>

---

## Requisitos

- Node.js >= 18, tener instalado globalmente nestJS
- npm
- Docker

---

## Cómo levantar los microservicios

1. Clonar el repositorio:

```bash
git clone https://github.com/Application-Distributed-Gasoline-System/Backend.git
cd Backend

```

2. Instalar dependencias

- Ir por cada microservicio y la api-gateway e instalar

```bash
cd api-gateway 
npm install 
cd ../drivers-ms
npm install
```

- Solo en los microservicios que usan Prisma (no en la API Gateway):

```bash
cd ../auth-ms
npx prisma generate

cd ../drivers-ms
npx prisma generate
...
```

3. Levantar todos los servicios con docker

- Desde la carpeta /backend ejecutar el siguiente comando

```bash
docker compose up --build -d 
```


---

## Configuracion de Prismas para microservicio Drivers (Esto NO DEBEN HACER porque se tienen enlazada a mi base de datos en technoSQL, solo es información )


1. Configurar la conexión a la base de datos en el archivo .env de cada microservicio:

```bash

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

```

2. Crear el cliente en prisma

```bash

npx prisma generate

```

3. Crear o actualizar el esquema en la base de datos:

```bash
npx prisma migrate dev --name init
```

4. Verificar el estado de la base de datos:

- Entrar a techno y ver que ya cambió, para verificar que les funcione pueden hacer un get o post a la base de datos



## Buenas prácticas

Solo un repo raíz (/Backend), no hay .git en los microservicios ni api-gateway.

Mantener un .gitignore general en la raíz.

Si se agregan nuevos microservicios, añadirlos a este README con instrucciones de instalación si varía en algo.

También eliminar el git que genera por defecto nest al generar un nuevo microservicio


## Contactos

Pueden mandarme mensaje por whats si necesitan ayuda :3
