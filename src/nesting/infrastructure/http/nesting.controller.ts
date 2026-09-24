/**
 * @file nesting.controller.ts
 * @description Controlador HTTP para el módulo Nesting.
 *
 * Actúa como adaptador de entrada (Driving Adapter) en la Arquitectura Hexagonal.
 * Recibe las solicitudes HTTP, valida los DTOs, delega al caso de uso,
 * y formatea la respuesta según el contrato de la API.
 *
 * Capa: Infraestructura (Adaptador de entrada HTTP)
 */

import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CalculateNestingUseCase } from '../../application/use-cases/calculate-nesting.use-case.js';
import { NestingRequestDto } from './dto/nesting-request.dto.js';
import type { Canvas, Piece, NestingResult } from '../../domain/entities/nesting-models.js';

/**
 * Estructura de la respuesta exitosa de la API.
 */
interface NestingApiResponse {
  status: 'success';
  data: NestingResult;
}

/**
 * Controlador HTTP para el endpoint de nesting.
 *
 * Ruta base: /api/v1/nesting
 * Endpoint: POST /api/v1/nesting/calculate
 */
@Controller('api/v1/nesting')
export class NestingController {
  constructor(
    private readonly calculateNestingUseCase: CalculateNestingUseCase,
  ) {}

  /**
   * Calcula la distribución óptima de piezas sobre un lienzo.
   *
   * @param dto - Datos validados de la solicitud (lienzo + piezas).
   * @returns Respuesta con la distribución calculada y métricas.
   *
   * @example
   * POST /api/v1/nesting/calculate
   * {
   *   "lienzo": { "ancho": 1500, "alto": 1000 },
   *   "piezas": [
   *     { "id": "p1", "ancho": 200, "alto": 300, "cantidad": 2, "permitirRotacion": true }
   *   ]
   * }
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({
    whitelist: true,             // Elimina propiedades no decoradas
    forbidNonWhitelisted: true,  // Error si envían propiedades desconocidas
    transform: true,             // Transforma el payload a instancias de las clases DTO
    transformOptions: {
      enableImplicitConversion: true, // Permite conversión de tipos implícita
    },
  }))
  calculate(@Body() dto: NestingRequestDto): NestingApiResponse {
    // ─── Mapear DTO → Modelos de Dominio ─────────────────────────
    const canvas: Canvas = {
      ancho: dto.lienzo.ancho,
      alto: dto.lienzo.alto,
    };

    const pieces: Piece[] = dto.piezas.map(p => ({
      id: p.id,
      ancho: p.ancho,
      alto: p.alto,
      cantidad: p.cantidad,
      permitirRotacion: p.permitirRotacion,
    }));

    // ─── Ejecutar Caso de Uso ────────────────────────────────────
    const result = this.calculateNestingUseCase.execute(canvas, pieces);

    // ─── Formatear Respuesta ─────────────────────────────────────
    return {
      status: 'success',
      data: result,
    };
  }
}
