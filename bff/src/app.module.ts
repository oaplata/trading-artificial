import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from './health/health.module';
import { DataModule } from './data/data.module';
import { LinesModule } from './lines/lines.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MlProxyModule } from './ml-proxy/ml-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TerminusModule,
    HealthModule,
    DataModule,
    LinesModule,
    FeedbackModule,
    MlProxyModule,
  ],
})
export class AppModule {}
