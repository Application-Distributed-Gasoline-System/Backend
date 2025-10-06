import "dotenv/config";

import * as joi from 'joi'

interface EnvVars{
    PORT: number
    DRIVERS_MICROSERVICE_PORT: number
    DRIVERS_MICROSERVICE_HOST: string
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DRIVERS_MICROSERVICE_PORT: joi.number().required(),
    DRIVERS_MICROSERVICE_HOST: joi.string().required(),
    
})
.unknown(true)

const { error, value } = envsSchema.validate( process.env );

if (error) {
    throw new Error(`Config validation error: ${ error.message }`);
}

const envVars: EnvVars = value

export const envs = {
    port: envVars.PORT,
    driversMicroservicePort: envVars.DRIVERS_MICROSERVICE_PORT,
    driversMicroserviceHost: envVars.DRIVERS_MICROSERVICE_HOST,
    
}