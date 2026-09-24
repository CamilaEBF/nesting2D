/**
 * @file nesting.module.ts
 * @description NestJS module for the 2D Nesting domain.
 *
 * Configures dependency injection following Hexagonal Architecture:
 * - The symbolic token NESTING_STRATEGY_TOKEN (Port) is bound to
 *   MaxRectsStrategyAdapter (Adapter).
 * - The use case receives the injected strategy automatically.
 * - The HTTP controller is registered as the entry point.
 *
 * To change the packing engine, simply replace
 * `useClass: MaxRectsStrategyAdapter` with another adapter implementing
 * NestingStrategy, without touching the use case or controller.
 */

import { Module } from '@nestjs/common';
import { CalculateNestingUseCase } from './application/use-cases/calculate-nesting.use-case.js';
import { NESTING_STRATEGY_TOKEN } from './domain/interfaces/nesting-strategy.interface.js';
import { MaxRectsStrategyAdapter } from './infrastructure/adapters/maxrects-strategy.adapter.js';
import { NestingController } from './infrastructure/http/nesting.controller.js';

@Module({
  controllers: [NestingController],
  providers: [
    /**
     * Port → Adapter binding (Strategy Pattern via DI).
     *
     * The symbolic token NESTING_STRATEGY_TOKEN is injected into
     * CalculateNestingUseCase. NestJS resolves this token with the
     * MaxRectsStrategyAdapter class.
     *
     * To use a different engine (e.g., GuillotineStrategyAdapter):
     *   { provide: NESTING_STRATEGY_TOKEN, useClass: GuillotineStrategyAdapter }
     */
    {
      provide: NESTING_STRATEGY_TOKEN,
      useClass: MaxRectsStrategyAdapter,
    },

    /**
     * Use case as an injectable provider.
     * Automatically receives the nesting strategy via constructor injection.
     */
    CalculateNestingUseCase,
  ],
  exports: [CalculateNestingUseCase],
})
export class NestingModule {}
