/**
 * @file nesting.module.ts
 * @description Módulo NestJS para el dominio de Nesting 2D.
 *
 * Configura la inyección de dependencias siguiendo la Arquitectura Hexagonal:
 * - El token simbólico NESTING_STRATEGY_TOKEN (Puerto) se vincula a
 *   MaxRectsStrategyAdapter (Adaptador).
 * - El caso de uso recibe la estrategia inyectada automáticamente.
 * - El controlador HTTP se registra como punto de entrada.
 *
 * Para cambiar el motor de empaquetado, solo hay que reemplazar
 * `useClass: MaxRectsStrategyAdapter` por otro adaptador que implemente
 * NestingStrategy, sin tocar el caso de uso ni el controlador.
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
     * Vinculación del Puerto → Adaptador (Strategy Pattern via DI).
     *
     * El token simbólico NESTING_STRATEGY_TOKEN es inyectado en
     * CalculateNestingUseCase. NestJS resuelve este token con la
     * clase MaxRectsStrategyAdapter.
     *
     * Para usar un motor diferente (e.g., GuillotineStrategyAdapter):
     *   { provide: NESTING_STRATEGY_TOKEN, useClass: GuillotineStrategyAdapter }
     */
    {
      provide: NESTING_STRATEGY_TOKEN,
      useClass: MaxRectsStrategyAdapter,
    },

    /**
     * Caso de uso como provider inyectable.
     * Recibe automáticamente la estrategia de nesting vía constructor injection.
     */
    CalculateNestingUseCase,
  ],
  exports: [CalculateNestingUseCase],
})
export class NestingModule {}
