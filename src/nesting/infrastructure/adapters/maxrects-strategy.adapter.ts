/**
 * @file maxrects-strategy.adapter.ts
 * @description Adaptador de infraestructura que implementa el puerto NestingStrategy
 * utilizando la librería `maxrects-packer`.
 *
 * Este adaptador traduce los modelos de dominio al formato que espera la librería
 * y convierte los resultados de vuelta a modelos de dominio.
 *
 * Capa: Infraestructura (Adaptador de salida)
 * Patrón: Adapter / Strategy
 */

import { Injectable, Logger } from '@nestjs/common';
import { MaxRectsPacker, type IRectangle } from 'maxrects-packer';
import type { Canvas, Piece, NestingResult, PlacedPiece } from '../../domain/entities/nesting-models.js';
import type { NestingStrategy } from '../../domain/interfaces/nesting-strategy.interface.js';

/**
 * Datos personalizados que se adjuntan a cada rectángulo del packer.
 * Permite rastrear la pieza original después del empaquetado.
 */
interface RectData {
  /** ID original de la pieza de dominio */
  pieceId: string;
  /** Ancho original de la pieza (antes de posible rotación) */
  originalWidth: number;
  /** Alto original de la pieza (antes de posible rotación) */
  originalHeight: number;
  /** Si la pieza permite rotación */
  allowRotation: boolean;
}

@Injectable()
export class MaxRectsStrategyAdapter implements NestingStrategy {
  private readonly logger = new Logger(MaxRectsStrategyAdapter.name);

  /**
   * Ejecuta el algoritmo MaxRects para empaquetar piezas en un lienzo.
   *
   * Flujo:
   * 1. Configura el MaxRectsPacker con las dimensiones del lienzo.
   * 2. Agrega todas las piezas como rectángulos con metadata.
   * 3. Extrae los resultados del primer bin (solo usamos 1 lienzo).
   * 4. Calcula el porcentaje de uso y detecta piezas no ubicadas.
   *
   * @param canvas - Dimensiones del lienzo de corte.
   * @param pieces - Piezas individuales (ya expandidas, cantidad = 1).
   * @returns Resultado del empaquetado con distribución y métricas.
   */
  calculate(canvas: Canvas, pieces: Piece[]): NestingResult {
    this.logger.log(
      `MaxRects: empaquetando ${pieces.length} piezas en lienzo ${canvas.ancho}x${canvas.alto}`,
    );

    // ─── Configurar el packer ────────────────────────────────────
    const packer = new MaxRectsPacker<IRectangle>(
      canvas.ancho,
      canvas.alto,
      0, // padding entre piezas
      {
        smart: true,       // Dimensionado inteligente del bin
        pot: false,         // NO usar potencia de 2 (es para texturas, no cortes)
        square: false,      // NO forzar cuadrado
        allowRotation: false, // Rotación se controla por pieza individual
      },
    );

    // ─── Preparar los rectángulos con metadata ───────────────────
    const inputRects: IRectangle[] = pieces.map(piece => ({
      width: piece.ancho,
      height: piece.alto,
      x: 0,
      y: 0,
      allowRotation: piece.permitirRotacion,
      data: {
        pieceId: piece.id,
        originalWidth: piece.ancho,
        originalHeight: piece.alto,
        allowRotation: piece.permitirRotacion,
      } satisfies RectData,
    }));

    // ─── Ejecutar el empaquetado ─────────────────────────────────
    packer.addArray(inputRects);

    // ─── Extraer resultados ──────────────────────────────────────
    const placedPieces: PlacedPiece[] = [];
    const allPlacedIds = new Set<string>();

    for (const bin of packer.bins) {
      for (const rect of bin.rects) {
        const data = rect.data as RectData;
        const isRotated = !!(rect as any).rot;

        placedPieces.push({
          idPieza: data.pieceId,
          x: rect.x,
          y: rect.y,
          rotada: isRotated,
          anchoFinal: rect.width,
          altoFinal: rect.height,
        });

        allPlacedIds.add(data.pieceId);
      }
    }

    // ─── Identificar piezas no ubicadas ──────────────────────────
    const piezasNoUbicadas = pieces
      .filter(p => !allPlacedIds.has(p.id))
      .map(p => p.id);

    // ─── Calcular porcentaje de uso ──────────────────────────────
    const totalCanvasArea = canvas.ancho * canvas.alto;
    const usedArea = placedPieces.reduce(
      (sum, p) => sum + p.anchoFinal * p.altoFinal,
      0,
    );
    const usagePercentage = totalCanvasArea > 0
      ? ((usedArea / totalCanvasArea) * 100).toFixed(1)
      : '0.0';

    this.logger.log(
      `MaxRects completado: ${placedPieces.length}/${pieces.length} piezas ubicadas, ` +
      `uso: ${usagePercentage}%`,
    );

    return {
      lienzoUtilizado: { ancho: canvas.ancho, alto: canvas.alto },
      porcentajeUso: usagePercentage,
      distribucion: placedPieces,
      piezasNoUbicadas,
    };
  }
}
