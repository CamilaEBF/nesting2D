/**
 * @file maxrects-strategy.adapter.ts
 * @description Infrastructure adapter implementing the NestingStrategy port
 * using the `maxrects-packer` library.
 *
 * This adapter translates domain models to the format expected by the library
 * and converts the results back to domain models.
 *
 * Layer: Infrastructure (Output Adapter)
 * Pattern: Adapter / Strategy
 */

import { Injectable, Logger } from '@nestjs/common';
import { MaxRectsPacker, type IRectangle } from 'maxrects-packer';
import type { Canvas, Piece, NestingResult, PlacedPiece } from '../../domain/entities/nesting-models.js';
import type { NestingStrategy } from '../../domain/interfaces/nesting-strategy.interface.js';

/**
 * Custom data attached to each packer rectangle.
 * Allows tracking the original piece after packing.
 */
interface RectData {
  /** Original domain piece ID */
  pieceId: string;
  /** Original piece width (before possible rotation) */
  originalWidth: number;
  /** Original piece height (before possible rotation) */
  originalHeight: number;
  /** Whether the piece allows rotation */
  allowRotation: boolean;
}

@Injectable()
export class MaxRectsStrategyAdapter implements NestingStrategy {
  private readonly logger = new Logger(MaxRectsStrategyAdapter.name);

  /**
   * Executes the MaxRects algorithm to pack pieces on a canvas.
   *
   * Flow:
   * 1. Configures the MaxRectsPacker with canvas dimensions.
   * 2. Adds all pieces as rectangles with metadata.
   * 3. Extracts results from the first bin (we only use 1 canvas).
   * 4. Calculates usage percentage and detects unplaced pieces.
   *
   * @param canvas - Cutting canvas dimensions.
   * @param pieces - Individual pieces (already expanded, quantity = 1).
   * @returns Packing result with distribution and metrics.
   */
  calculate(canvas: Canvas, pieces: Piece[]): NestingResult {
    this.logger.log(
      `MaxRects: packing ${pieces.length} pieces on ${canvas.width}x${canvas.height} canvas`,
    );

    // ─── Configure the packer ────────────────────────────────────
    const packer = new MaxRectsPacker<IRectangle>(
      canvas.width,
      canvas.height,
      0, // padding between pieces
      {
        smart: true,        // Smart bin sizing
        pot: false,          // Do NOT use power of 2 (that's for textures, not cuts)
        square: false,       // Do NOT force square
        allowRotation: false, // Rotation is controlled per individual piece
      },
    );

    // ─── Prepare rectangles with metadata ────────────────────────
    const inputRects: IRectangle[] = pieces.map(piece => ({
      width: piece.width,
      height: piece.height,
      x: 0,
      y: 0,
      allowRotation: piece.allowRotation,
      data: {
        pieceId: piece.id,
        originalWidth: piece.width,
        originalHeight: piece.height,
        allowRotation: piece.allowRotation,
      } satisfies RectData,
    }));

    // ─── Execute packing ─────────────────────────────────────────
    packer.addArray(inputRects);

    // ─── Extract results ─────────────────────────────────────────
    const placedPieces: PlacedPiece[] = [];
    const allPlacedIds = new Set<string>();

    for (const bin of packer.bins) {
      for (const rect of bin.rects) {
        const data = rect.data as RectData;
        const isRotated = !!(rect as any).rot;

        placedPieces.push({
          pieceId: data.pieceId,
          x: rect.x,
          y: rect.y,
          rotated: isRotated,
          finalWidth: rect.width,
          finalHeight: rect.height,
        });

        allPlacedIds.add(data.pieceId);
      }
    }

    // ─── Identify unplaced pieces ────────────────────────────────
    const unplacedPieces = pieces
      .filter(p => !allPlacedIds.has(p.id))
      .map(p => p.id);

    // ─── Calculate usage percentage ──────────────────────────────
    const totalCanvasArea = canvas.width * canvas.height;
    const usedArea = placedPieces.reduce(
      (sum, p) => sum + p.finalWidth * p.finalHeight,
      0,
    );
    const usagePercentage = totalCanvasArea > 0
      ? ((usedArea / totalCanvasArea) * 100).toFixed(1)
      : '0.0';

    this.logger.log(
      `MaxRects complete: ${placedPieces.length}/${pieces.length} pieces placed, ` +
      `usage: ${usagePercentage}%`,
    );

    return {
      canvasUsed: { width: canvas.width, height: canvas.height },
      usagePercentage,
      distribution: placedPieces,
      unplacedPieces,
    };
  }
}
