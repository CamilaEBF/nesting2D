/**
 * @file nesting-strategy.interface.ts
 * @description Puerto (Port) de la Arquitectura Hexagonal.
 *
 * Define el contrato que cualquier motor de empaquetado rectangular debe cumplir.
 * Esto permite intercambiar la implementación concreta (MaxRects, Guillotine, etc.)
 * sin modificar la lógica de negocio (Caso de Uso).
 *
 * Patrón: Strategy / Puertos y Adaptadores
 */

import type { Canvas, Piece, NestingResult } from '../entities/nesting-models.js';

/**
 * Token de inyección de dependencias para NestJS.
 * Se utiliza como clave simbólica para resolver la implementación concreta
 * del adaptador de nesting en tiempo de ejecución.
 */
export const NESTING_STRATEGY_TOKEN = Symbol('NESTING_STRATEGY');

/**
 * Interfaz que define el contrato del motor de empaquetado 2D.
 *
 * Cualquier adaptador (MaxRects, Skyline, Shelf, etc.) debe implementar
 * este método para ser inyectable en el caso de uso.
 */
export interface NestingStrategy {
  /**
   * Ejecuta el algoritmo de empaquetado 2D sobre un lienzo dado.
   *
   * @param canvas - Dimensiones del lienzo (superficie de corte).
   * @param pieces - Lista de piezas a ubicar, ya expandidas por cantidad.
   * @returns Resultado del empaquetado con distribución y métricas.
   */
  calculate(canvas: Canvas, pieces: Piece[]): NestingResult;
}
