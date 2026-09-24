/**
 * @file nesting-models.ts
 * @description Pure domain models for the 2D Nesting system.
 *
 * These models represent domain entities with no dependencies on
 * frameworks or infrastructure. They are immutable Value Objects
 * that encapsulate core business information.
 *
 * Principle: Domain independence (innermost layer of Hexagonal Architecture).
 */

// ─────────────────────────────────────────────────────────────
// Input Entities
// ─────────────────────────────────────────────────────────────

/**
 * Represents the cutting surface (base material).
 * Contains the dimensions of the canvas where pieces will be placed.
 */
export interface Canvas {
  /** Canvas width in units (mm, px, etc.) */
  readonly width: number;
  /** Canvas height in units (mm, px, etc.) */
  readonly height: number;
}

/**
 * Represents an individual piece to be placed on the canvas.
 * Each piece has a unique identifier, dimensions, and cutting options.
 */
export interface Piece {
  /** Unique piece identifier */
  readonly id: string;
  /** Piece width in units */
  readonly width: number;
  /** Piece height in units */
  readonly height: number;
  /** Number of required copies of this piece */
  readonly quantity: number;
  /** Whether the piece can be rotated 90° to optimize packing */
  readonly allowRotation: boolean;
}

// ─────────────────────────────────────────────────────────────
// Output Entities
// ─────────────────────────────────────────────────────────────

/**
 * Represents the calculated placement of a single piece on the canvas.
 * Indicates exact coordinates and whether it was rotated.
 */
export interface PlacedPiece {
  /** Reference to the original piece ID */
  readonly pieceId: string;
  /** X coordinate of the top-left corner on the canvas */
  readonly x: number;
  /** Y coordinate of the top-left corner on the canvas */
  readonly y: number;
  /** Whether the piece was rotated 90° during packing */
  readonly rotated: boolean;
  /** Final piece width (may differ from original if rotated) */
  readonly finalWidth: number;
  /** Final piece height (may differ from original if rotated) */
  readonly finalHeight: number;
}

/**
 * Complete result of the packing algorithm.
 * Contains the distribution of placed pieces, unplaced pieces, and efficiency metrics.
 */
export interface NestingResult {
  /** Dimensions of the canvas used */
  readonly canvasUsed: Canvas;
  /** Canvas area usage percentage (0-100), formatted as a string with 1 decimal */
  readonly usagePercentage: string;
  /** List of successfully placed pieces with their coordinates */
  readonly distribution: PlacedPiece[];
  /** List of piece IDs that could not be placed on the canvas */
  readonly unplacedPieces: string[];
}

// ─────────────────────────────────────────────────────────────
// Auxiliary Domain Entities
// ─────────────────────────────────────────────────────────────

/**
 * Classification type for a piece based on its geometry.
 * Used in the use case's pre-processing logic.
 *
 * - 'bellows': Piece with aspect ratio > 5 (long/thin strip)
 * - 'regular': Piece with aspect ratio <= 5
 */
export type PieceClassification = 'bellows' | 'regular';

/**
 * Piece enriched with classification metadata.
 * Generated during use case pre-processing.
 */
export interface ClassifiedPiece extends Piece {
  /** Geometric classification of the piece */
  readonly classification: PieceClassification;
  /** Calculated aspect ratio (larger dimension / smaller dimension) */
  readonly aspectRatio: number;
}
