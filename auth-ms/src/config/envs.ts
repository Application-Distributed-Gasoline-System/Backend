import "dotenv/config";

import * as joi from 'joi'

interface EnvVars{
    PORT: number
    HOST: string
    JWT_SECRET: string
    JWT_EXPIRES_IN: number
    REFRESH_TOKEN_EXPIRES_DAYS: number
    RESET_TOKEN_EXPIRES_HOURS: number

    SMTP_USER: string
    SMTP_PASS: string
    SENDER_EMAIL: string

    NODE_ENV:string

    //Para nats
    // NATS_SERVERS: string[]
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    HOST: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.number().required(),
    REFRESH_TOKEN_EXPIRES_DAYS: joi.number().required(),
    RESET_TOKEN_EXPIRES_HOURS: joi.number().required(),

    SMTP_USER: joi.string().required(),
    SMTP_PASS: joi.string().required(),
    SENDER_EMAIL: joi.string().required(),

    NODE_ENV:joi.string().required(),

    //Para servicio nats 
    // NATS_SERVERS: joi.array().items(joi.string().required())

})
.unknown(true)

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${ error.message }`);
}

const envVars: EnvVars = value

export const envs = {
    port: envVars.PORT,
    host: envVars.HOST,
    jwt_secret: envVars.JWT_SECRET,
    jwt_expires_in: envVars.JWT_EXPIRES_IN,
    refres_token_expires_days: envVars.REFRESH_TOKEN_EXPIRES_DAYS,
    reset_token_expires_hours: envVars.RESET_TOKEN_EXPIRES_HOURS,

    smtp_user: envVars.SMTP_USER,
    smtp_pass: envVars.SMTP_PASS,
    sender_email: envVars.SENDER_EMAIL,

    node_env: envVars.NODE_ENV,

    //Para servicio nats 
    // NATS_SERVER: envVars.NATS_SERVER
    
}
