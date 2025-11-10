import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DRIVERS_MICROSERVICE_HOST: string;
  DRIVERS_MICROSERVICE_PORT: number;

  AUTH_MICROSERVICE_HOST: string;
  AUTH_MICROSERVICE_PORT: number;

  VEHICLES_MICROSERVICE_HOST: string;
  VEHICLES_MICROSERVICE_PORT: number;

  ROUTES_MICROSERVICE_HOST: string;
  ROUTES_MICROSERVICE_PORT: number;
  
  FUEL_MICROSERVICE_HOST: string;
  FUEL_MICROSERVICE_PORT: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DRIVERS_MICROSERVICE_PORT: joi.number().required(),
    DRIVERS_MICROSERVICE_HOST: joi.string().required(),

    AUTH_MICROSERVICE_HOST: joi.string().required(),
    AUTH_MICROSERVICE_PORT: joi.number().required(),

    VEHICLES_MICROSERVICE_HOST: joi.string().required(),
    VEHICLES_MICROSERVICE_PORT: joi.number().required(),
    
    ROUTES_MICROSERVICE_HOST: joi.string().required(),
    ROUTES_MICROSERVICE_PORT: joi.number().required(),
    
    FUEL_MICROSERVICE_HOST: joi.string().required(),
    FUEL_MICROSERVICE_PORT: joi.number().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  driversMicroserviceHost: envVars.DRIVERS_MICROSERVICE_HOST,
  driversMicroservicePort: envVars.DRIVERS_MICROSERVICE_PORT,

  authMicroserviceHost: envVars.AUTH_MICROSERVICE_HOST,
  authMicroservicePort: envVars.AUTH_MICROSERVICE_PORT,

  vehiclesMicroserviceHost: envVars.VEHICLES_MICROSERVICE_HOST,
  vehiclesMicroservicePort: envVars.VEHICLES_MICROSERVICE_PORT,
  
  routesMicroserviceHost: envVars.ROUTES_MICROSERVICE_HOST,
  routesMicroservicePort: envVars.ROUTES_MICROSERVICE_PORT,
  
  fuelMicroserviceHost: envVars.FUEL_MICROSERVICE_HOST,
  fuelMicroservicePort: envVars.FUEL_MICROSERVICE_PORT,
};
