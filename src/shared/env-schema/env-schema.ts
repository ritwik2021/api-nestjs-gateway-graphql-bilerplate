import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required()
});
