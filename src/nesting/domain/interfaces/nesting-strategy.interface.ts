/**
 * @file nesting-strategy.interface.ts
 * @description Port of the Hexagonal Architecture.
 *
 * Defines the contract that any rectangular packing engine must fulfill.
 * This allows swapping the concrete implementation (MaxRects, Guillotine, etc.)
 * without modifying the business logic (Use Case).
 *
 * Pattern: Strategy / Ports and Adapters
 */

import type { Canvas, Piece, NestingResult } from '../entities/nesting-models.js';

/**
 * Dependency injection token for NestJS.
 * Used as a symbolic key to resolve the concrete nesting
 * adapter implementation at runtime.
 */
export const NESTING_STRATEGY_TOKEN = Symbol('NESTING_STRATEGY');

/**
 * Interface defining the contract for a 2D packing engine.
 *
 * Any adapter (MaxRects, Skyline, Shelf, etc.) must implement
 * this method to be injectable into the use case.
 */
export interface NestingStrategy {
  /**
   * Executes the 2D packing algorithm on a given canvas.
   *
   * @param canvas - Canvas dimensions (cutting surface).
   * @param pieces - List of pieces to place, already expanded by quantity.
   * @returns Packing result with distribution and metrics.
   */
  calculate(canvas: Canvas, pieces: Piece[]): NestingResult;
}
