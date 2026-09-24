import { Module } from '@nestjs/common';
import { NestingModule } from './nesting/nesting.module.js';

@Module({
  imports: [NestingModule],
})
export class AppModule {}
