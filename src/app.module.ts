import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envSchema } from './shared/env-schema/env-schema';
import { LoggerMiddleware } from './shared/logger/logger.middleware';
import { customInputValidation } from './shared/core/input-Validation.middleware';
import { LoggingInterceptor } from './shared/core/logging-interceptor';
import { loggerConfig } from './shared/logger/logger.config';
import { UserModule } from './modules/user/user.module';
import config from './shared/config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [config]
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        introspection: configService.get('ENV') === 'production' ? false : true,
        playground: configService.get('ENV') === 'production' ? false : true,
        context: async ({ req }) => ({ req }),
        debug: false,
        formatError: (error: any) => {
          return {
            message: error?.extensions?.code || error?.extensions?.error,
            statusCode: error?.extensions?.response?.statusCode,
            success: false,
            details: error?.extensions?.response?.message || error?.extensions?.response?.error || error?.message,
            data: error?.extensions?.response?.data
          };
        }
      })
    }),
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     ttl: config.get('THROTTLE_TTL'),
    //     limit: config.get('THROTTLE_LIMIT')
    //   })
    // }),
    WinstonModule.forRoot(loggerConfig),
    UserModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, customInputValidation).forRoutes('/');
  }
}
