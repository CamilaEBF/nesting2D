/**
 * @file nesting.controller.ts
 * @description HTTP controller for the Nesting module.
 *
 * Acts as an input adapter (Driving Adapter) in the Hexagonal Architecture.
 * Receives HTTP requests, validates DTOs, delegates to the use case,
 * and formats the response according to the API contract.
 *
 * Layer: Infrastructure (HTTP input adapter)
 */

import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CalculateNestingUseCase } from '../../application/use-cases/calculate-nesting.use-case.js';
import { NestingRequestDto } from './dto/nesting-request.dto.js';
import type { Canvas, Piece, NestingResult } from '../../domain/entities/nesting-models.js';

/**
 * Successful API response structure.
 */
interface NestingApiResponse {
  status: 'success';
  data: NestingResult;
}

/**
 * HTTP controller for the nesting endpoint.
 *
 * Base route: /api/v1/nesting
 * Endpoint: POST /api/v1/nesting/calculate
 */
@Controller('api/v1/nesting')
export class NestingController {
  constructor(
    private readonly calculateNestingUseCase: CalculateNestingUseCase,
  ) {}

  /**
   * Calculates the optimal distribution of pieces on a canvas.
   *
   * @param dto - Validated request data (canvas + pieces).
   * @returns Response with the calculated distribution and metrics.
   *
   * @example
   * POST /api/v1/nesting/calculate
   * {
   *   "canvas": { "width": 1500, "height": 1000 },
   *   "pieces": [
   *     { "id": "p1", "width": 200, "height": 300, "quantity": 2, "allowRotation": true }
   *   ]
   * }
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({
    whitelist: true,             // Strip non-decorated properties
    forbidNonWhitelisted: true,  // Error on unknown properties
    transform: true,             // Transform payload to DTO class instances
    transformOptions: {
      enableImplicitConversion: true, // Allow implicit type conversion
    },
  }))
  calculate(@Body() dto: NestingRequestDto): NestingApiResponse {
    // ─── Map DTO → Domain Models ─────────────────────────────────
    const canvas: Canvas = {
      width: dto.canvas.width,
      height: dto.canvas.height,
    };

    const pieces: Piece[] = dto.pieces.map(p => ({
      id: p.id,
      width: p.width,
      height: p.height,
      quantity: p.quantity,
      allowRotation: p.allowRotation,
    }));

    // ─── Execute Use Case ────────────────────────────────────────
    const result = this.calculateNestingUseCase.execute(canvas, pieces);

    // ─── Format Response ─────────────────────────────────────────
    return {
      status: 'success',
      data: result,
    };
  }
}
