import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as xss from 'xss-clean';
import * as hpp from 'hpp';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

async function main() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = await app.get(ConfigService);
  const envApp = configService.get('NODE_ENV');
  const port = configService.get('NODE_PORT');
  const allowedDomains = configService.get('ALLOWED_DOMAINS');
  const whitelist = allowedDomains.split(',');
  app.setGlobalPrefix(configService.get('GLOBAL_PREFIX'));
  app.use(cookieParser());

  /**
   * sets up CORS options depending on the environment, allowing all origins to connect in the development environment
   * and checking against a whitelist in other environments, and then applying the options using the cors middleware.
   */
  const corsOptions = {
    credentials: true
  };

  if (envApp === 'dev') {
    corsOptions['origin'] = '*';
  } else {
    corsOptions['origin'] = function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Access Denied'));
      }
    };
  }
  app.enableCors(corsOptions);

  /**
   * helmet middleware to set various security headers in a production environment.
   * It also sets a content security policy with custom directives to control which resources are allowed to be loaded.
   * Helmet will not work with playground, so if the env = production then playground should get disabled
   */
  if (envApp === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'", 'https://polyfill.io', 'https://*.cloudflare.com'],
            scriptSrc: ["'self'", 'https://polyfill.io', 'https://*.cloudflare.com'],
            styleSrc: ["'self'", 'https:'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            fontSrc: ["'self'", 'https:', 'data:'],
            childSrc: ["'self'", 'blob:'],
            frameSrc: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        expectCt: true,
        frameguard: true,
        hidePoweredBy: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: {
          permittedPolicies: 'by-content-type'
        },
        referrerPolicy: true
      })
    );
  }

  app.set('trust proxy', true);
  app.use(compression()); // Compression Settings
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.getHttpAdapter().getInstance().disable('Server');
  app.useGlobalPipes(new ValidationPipe());

  app.use(xss()); // XSS Filter
  app.use(hpp()); // Prevent http Parameter pollution

  await app.listen(port, () => {
    Logger.log(`${envApp} Server is running on ${port}`, `Application Server`);
  });
}
main();
