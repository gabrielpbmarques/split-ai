import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsModule } from 'src/components/components.module';
import { HealthModule } from 'src/health/health.module';
import { env } from 'src/shared/config/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    DevtoolsModule.register({
      http: !env.isProduction,
    }),
    HealthModule,
    ComponentsModule,
  ],
})
export class AppModule {}
