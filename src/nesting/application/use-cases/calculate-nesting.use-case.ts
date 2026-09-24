/**
 * @file calculate-nesting.use-case.ts
 * @description Main Use Case for the Nesting module.
 *
 * Orchestrates the business logic for 2D packing calculation:
 * 1. Piece expansion by quantity.
 * 2. Piece classification (bellows detection).
 * 3. Delegation to the packing engine via Strategy Pattern.
 *
 * Layer: Application (Application Layer)
 * Dependencies: Only depends on domain interfaces (NestingStrategy Port).
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Canvas, Piece, NestingResult, ClassifiedPiece, PieceClassification } from '../../domain/entities/nesting-models.js';
import { NESTING_STRATEGY_TOKEN, type NestingStrategy } from '../../domain/interfaces/nesting-strategy.interface.js';

/**
 * Aspect ratio threshold for classifying a piece as "bellows".
 * If max(width, height) / min(width, height) > ASPECT_RATIO_THRESHOLD, the piece is a bellows.
 */
const ASPECT_RATIO_THRESHOLD = 5;

@Injectable()
export class CalculateNestingUseCase {
  private readonly logger = new Logger(CalculateNestingUseCase.name);

  constructor(
    /**
     * Packing engine injection through the port (Strategy Pattern).
     * The concrete implementation is resolved in the NestJS module.
     */
    @Inject(NESTING_STRATEGY_TOKEN)
    private readonly nestingStrategy: NestingStrategy,
  ) {}

  /**
   * Executes the full 2D nesting calculation.
   *
   * Flow:
   * 1. Expands pieces by their quantity (e.g., quantity=3 → 3 instances).
   * 2. Classifies each piece (regular or bellows) based on its aspect ratio.
   * 3. Delegates to the packing engine via the NestingStrategy port.
   *
   * @param canvas - Cutting canvas dimensions.
   * @param pieces - Original pieces with their quantities.
   * @returns Packing result with distribution and metrics.
   */
  execute(canvas: Canvas, pieces: Piece[]): NestingResult {
    this.logger.log(
      `Starting nesting calculation: canvas ${canvas.width}x${canvas.height}, ` +
      `${pieces.length} piece type(s)`,
    );

    // ─── Step 1: Expand pieces by quantity ────────────────────────
    const expandedPieces = this.expandPiecesByQuantity(pieces);
    this.logger.log(`Expanded pieces: ${expandedPieces.length} total units`);

    // ─── Step 2: Classify pieces (bellows detection) ─────────────
    // BELLOWS CLASSIFICATION:
    // A piece is a "bellows" (long strip) if its aspect ratio
    // (larger dimension / smaller dimension) is > 5.
    // In this iteration, all pieces are sent together to the engine,
    // but the classification is prepared for future optimizations
    // where bellows could be processed with different strategies.
    const classifiedPieces = this.classifyPieces(expandedPieces);

    const bellows = classifiedPieces.filter(p => p.classification === 'bellows');
    const regulars = classifiedPieces.filter(p => p.classification === 'regular');

    this.logger.log(
      `Classification: ${regulars.length} regular, ${bellows.length} bellows ` +
      `(threshold ratio > ${ASPECT_RATIO_THRESHOLD})`,
    );

    // ─── Step 3: Delegate to packing engine ──────────────────────
    // NOTE: In this iteration, all pieces (bellows + regular) are
    // sent together to the engine. In future iterations, bellows
    // could be processed with a specialized algorithm (e.g., Guillotine)
    // before sending regular pieces to MaxRects.
    const allPieces: Piece[] = classifiedPieces.map(cp => ({
      id: cp.id,
      width: cp.width,
      height: cp.height,
      quantity: 1, // Already expanded
      allowRotation: cp.allowRotation,
    }));

    const result = this.nestingStrategy.calculate(canvas, allPieces);

    this.logger.log(
      `Result: ${result.distribution.length} pieces placed, ` +
      `${result.unplacedPieces.length} unplaced, ` +
      `canvas usage: ${result.usagePercentage}%`,
    );

    return result;
  }

  /**
   * Expands pieces by their `quantity` field.
   * Each copy receives a unique suffix in its ID (e.g., "p1_1", "p1_2").
   *
   * @param pieces - Pieces with quantity >= 1.
   * @returns Array of individual pieces (quantity = 1 each).
   */
  private expandPiecesByQuantity(pieces: Piece[]): Piece[] {
    const expanded: Piece[] = [];

    for (const piece of pieces) {
      for (let i = 0; i < piece.quantity; i++) {
        expanded.push({
          id: piece.quantity > 1 ? `${piece.id}_${i + 1}` : piece.id,
          width: piece.width,
          height: piece.height,
          quantity: 1,
          allowRotation: piece.allowRotation,
        });
      }
    }

    return expanded;
  }

  /**
   * Classifies pieces based on their geometry.
   *
   * Business rule:
   * - A piece is a "bellows" if max(width, height) / min(width, height) > 5.
   * - Otherwise, it is "regular".
   *
   * @param pieces - Expanded pieces (quantity = 1).
   * @returns Pieces enriched with classification information.
   */
  private classifyPieces(pieces: Piece[]): ClassifiedPiece[] {
    return pieces.map(piece => {
      const maxDimension = Math.max(piece.width, piece.height);
      const minDimension = Math.min(piece.width, piece.height);
      const ratio = minDimension > 0 ? maxDimension / minDimension : Infinity;

      const classification: PieceClassification =
        ratio > ASPECT_RATIO_THRESHOLD ? 'bellows' : 'regular';

      return {
        ...piece,
        classification,
        aspectRatio: parseFloat(ratio.toFixed(2)),
      };
    });
  }
}
