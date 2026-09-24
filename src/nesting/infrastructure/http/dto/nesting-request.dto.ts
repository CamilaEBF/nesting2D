/**
 * @file nesting-request.dto.ts
 * @description Data Transfer Objects for the Nesting module HTTP layer.
 *
 * These DTOs act as REST API contracts and use class-validator
 * to ensure input data meets business constraints before
 * reaching the use case.
 *
 * Layer: Infrastructure (HTTP input adapter)
 */

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsPositive,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for canvas (cutting surface) dimensions.
 */
export class CanvasDto {
  /**
   * Canvas width in units.
   * Must be a positive number greater than 0.
   */
  @IsNumber({}, { message: 'Canvas width must be a number.' })
  @IsPositive({ message: 'Canvas width must be greater than 0.' })
  width!: number;

  /**
   * Canvas height in units.
   * Must be a positive number greater than 0.
   */
  @IsNumber({}, { message: 'Canvas height must be a number.' })
  @IsPositive({ message: 'Canvas height must be greater than 0.' })
  height!: number;
}

/**
 * DTO for each individual piece to be placed on the canvas.
 */
export class PieceDto {
  /**
   * Unique piece identifier.
   * Required, must be a non-empty string.
   */
  @IsString({ message: 'Piece id must be a string.' })
  id!: string;

  /**
   * Piece width in units.
   * Must be a positive number greater than 0.
   */
  @IsNumber({}, { message: 'Piece width must be a number.' })
  @IsPositive({ message: 'Piece width must be greater than 0.' })
  width!: number;

  /**
   * Piece height in units.
   * Must be a positive number greater than 0.
   */
  @IsNumber({}, { message: 'Piece height must be a number.' })
  @IsPositive({ message: 'Piece height must be greater than 0.' })
  height!: number;

  /**
   * Number of required copies of this piece.
   * Must be an integer greater than or equal to 1.
   */
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity!: number;

  /**
   * Whether the piece can be rotated 90° to optimize packing.
   * Default value: false.
   */
  @IsBoolean({ message: 'allowRotation must be a boolean value.' })
  @IsOptional()
  allowRotation: boolean = false;
}

/**
 * Main DTO for the nesting calculation request.
 * Contains the canvas and the pieces to pack.
 *
 * Example payload:
 * ```json
 * {
 *   "canvas": { "width": 1500, "height": 1000 },
 *   "pieces": [
 *     { "id": "p1", "width": 200, "height": 300, "quantity": 2, "allowRotation": true }
 *   ]
 * }
 * ```
 */
export class NestingRequestDto {
  /**
   * Canvas (cutting surface) configuration.
   * Must be a valid object with width and height.
   */
  @ValidateNested({ message: 'Canvas must be a valid object.' })
  @Type(() => CanvasDto)
  canvas!: CanvasDto;

  /**
   * List of pieces to pack.
   * Must contain at least 1 piece.
   */
  @IsArray({ message: 'Pieces must be an array.' })
  @ArrayMinSize(1, { message: 'At least 1 piece is required.' })
  @ValidateNested({ each: true, message: 'Each piece must be a valid object.' })
  @Type(() => PieceDto)
  pieces!: PieceDto[];
}
