/**
 * @file calculate-nesting.use-case.ts
 * @description Caso de Uso principal del módulo Nesting.
 *
 * Orquesta la lógica de negocio para el cálculo de empaquetado 2D:
 * 1. Expansión de piezas por cantidad.
 * 2. Clasificación de piezas (detección de "fuelles").
 * 3. Delegación al motor de empaquetado vía Strategy Pattern.
 *
 * Capa: Aplicación (Application Layer)
 * Dependencias: Solo depende de interfaces del dominio (Puerto NestingStrategy).
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Canvas, Piece, NestingResult, ClassifiedPiece, PieceClassification } from '../../domain/entities/nesting-models.js';
import { NESTING_STRATEGY_TOKEN, type NestingStrategy } from '../../domain/interfaces/nesting-strategy.interface.js';

/**
 * Umbral de relación de aspecto para clasificar una pieza como "fuelle".
 * Si max(ancho, alto) / min(ancho, alto) > ASPECT_RATIO_THRESHOLD, la pieza es un fuelle.
 */
const ASPECT_RATIO_THRESHOLD = 5;

@Injectable()
export class CalculateNestingUseCase {
  private readonly logger = new Logger(CalculateNestingUseCase.name);

  constructor(
    /**
     * Inyección del motor de empaquetado a través del puerto (Strategy Pattern).
     * La implementación concreta se resuelve en el módulo NestJS.
     */
    @Inject(NESTING_STRATEGY_TOKEN)
    private readonly nestingStrategy: NestingStrategy,
  ) {}

  /**
   * Ejecuta el cálculo completo de nesting 2D.
   *
   * Flujo:
   * 1. Expande las piezas según su cantidad (ej: cantidad=3 → 3 instancias).
   * 2. Clasifica cada pieza (regular o fuelle) basándose en su relación de aspecto.
   * 3. Delega al motor de empaquetado vía el puerto NestingStrategy.
   *
   * @param canvas - Dimensiones del lienzo de corte.
   * @param pieces - Piezas originales con sus cantidades.
   * @returns Resultado del empaquetado con distribución y métricas.
   */
  execute(canvas: Canvas, pieces: Piece[]): NestingResult {
    this.logger.log(
      `Iniciando cálculo de nesting: lienzo ${canvas.ancho}x${canvas.alto}, ` +
      `${pieces.length} tipo(s) de pieza`,
    );

    // ─── Paso 1: Expandir piezas por cantidad ────────────────────
    const expandedPieces = this.expandPiecesByQuantity(pieces);
    this.logger.log(`Piezas expandidas: ${expandedPieces.length} unidades totales`);

    // ─── Paso 2: Clasificar piezas (detección de fuelles) ────────
    // CLASIFICACIÓN DE FUELLES:
    // Una pieza es un "fuelle" (tira larga) si su relación de aspecto
    // (dimensión mayor / dimensión menor) es > 5.
    // En esta iteración, todas las piezas se envían juntas al motor,
    // pero la clasificación queda preparada para futuras optimizaciones
    // donde los fuelles podrían procesarse con estrategias diferentes.
    const classifiedPieces = this.classifyPieces(expandedPieces);

    const fuelles = classifiedPieces.filter(p => p.clasificacion === 'fuelle');
    const regulares = classifiedPieces.filter(p => p.clasificacion === 'regular');

    this.logger.log(
      `Clasificación: ${regulares.length} regulares, ${fuelles.length} fuelles ` +
      `(umbral ratio > ${ASPECT_RATIO_THRESHOLD})`,
    );

    // ─── Paso 3: Delegar al motor de empaquetado ─────────────────
    // NOTA: En esta iteración, todas las piezas (fuelles + regulares)
    // se envían juntas al motor. En iteraciones futuras, los fuelles
    // podrían procesarse con un algoritmo especializado (e.g., Guillotine)
    // antes de enviar las regulares al MaxRects.
    const allPieces: Piece[] = classifiedPieces.map(cp => ({
      id: cp.id,
      ancho: cp.ancho,
      alto: cp.alto,
      cantidad: 1, // Ya están expandidas
      permitirRotacion: cp.permitirRotacion,
    }));

    const result = this.nestingStrategy.calculate(canvas, allPieces);

    this.logger.log(
      `Resultado: ${result.distribucion.length} piezas ubicadas, ` +
      `${result.piezasNoUbicadas.length} no ubicadas, ` +
      `uso del lienzo: ${result.porcentajeUso}%`,
    );

    return result;
  }

  /**
   * Expande las piezas según su campo `cantidad`.
   * Cada copia recibe un sufijo único en su ID (ej: "p1_1", "p1_2").
   *
   * @param pieces - Piezas con cantidad >= 1.
   * @returns Array de piezas individuales (cantidad = 1 cada una).
   */
  private expandPiecesByQuantity(pieces: Piece[]): Piece[] {
    const expanded: Piece[] = [];

    for (const piece of pieces) {
      for (let i = 0; i < piece.cantidad; i++) {
        expanded.push({
          id: piece.cantidad > 1 ? `${piece.id}_${i + 1}` : piece.id,
          ancho: piece.ancho,
          alto: piece.alto,
          cantidad: 1,
          permitirRotacion: piece.permitirRotacion,
        });
      }
    }

    return expanded;
  }

  /**
   * Clasifica las piezas según su geometría.
   *
   * Regla de negocio:
   * - Una pieza es un "fuelle" si max(ancho, alto) / min(ancho, alto) > 5.
   * - Caso contrario, es "regular".
   *
   * @param pieces - Piezas expandidas (cantidad = 1).
   * @returns Piezas enriquecidas con información de clasificación.
   */
  private classifyPieces(pieces: Piece[]): ClassifiedPiece[] {
    return pieces.map(piece => {
      const maxDimension = Math.max(piece.ancho, piece.alto);
      const minDimension = Math.min(piece.ancho, piece.alto);
      const aspectRatio = minDimension > 0 ? maxDimension / minDimension : Infinity;

      const classification: PieceClassification =
        aspectRatio > ASPECT_RATIO_THRESHOLD ? 'fuelle' : 'regular';

      return {
        ...piece,
        clasificacion: classification,
        relacionAspecto: parseFloat(aspectRatio.toFixed(2)),
      };
    });
  }
}
