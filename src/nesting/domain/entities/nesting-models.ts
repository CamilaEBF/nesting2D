/**
 * @file nesting-models.ts
 * @description Modelos de dominio puros para el sistema de Nesting 2D.
 *
 * Estos modelos representan las entidades del dominio sin dependencias
 * de frameworks ni infraestructura. Son objetos de valor inmutables
 * (Value Objects) que encapsulan la información del negocio.
 *
 * Principio: Independencia del dominio (capa más interna de la Arquitectura Hexagonal).
 */

// ─────────────────────────────────────────────────────────────
// Entidades de Entrada
// ─────────────────────────────────────────────────────────────

/**
 * Representa la superficie de corte (el material base).
 * Contiene las dimensiones del lienzo donde se ubicarán las piezas.
 */
export interface Canvas {
  /** Ancho del lienzo en unidades (mm, px, etc.) */
  readonly ancho: number;
  /** Alto del lienzo en unidades (mm, px, etc.) */
  readonly alto: number;
}

/**
 * Representa una pieza individual a ubicar sobre el lienzo.
 * Cada pieza tiene un identificador único, dimensiones, y opciones de corte.
 */
export interface Piece {
  /** Identificador único de la pieza */
  readonly id: string;
  /** Ancho de la pieza en unidades */
  readonly ancho: number;
  /** Alto de la pieza en unidades */
  readonly alto: number;
  /** Cantidad de copias requeridas de esta pieza */
  readonly cantidad: number;
  /** Indica si la pieza puede rotarse 90° para optimizar el empaquetado */
  readonly permitirRotacion: boolean;
}

// ─────────────────────────────────────────────────────────────
// Entidades de Salida
// ─────────────────────────────────────────────────────────────

/**
 * Representa la ubicación calculada de una pieza individual sobre el lienzo.
 * Indica las coordenadas exactas y si fue rotada.
 */
export interface PlacedPiece {
  /** Referencia al ID original de la pieza */
  readonly idPieza: string;
  /** Coordenada X de la esquina superior-izquierda en el lienzo */
  readonly x: number;
  /** Coordenada Y de la esquina superior-izquierda en el lienzo */
  readonly y: number;
  /** Indica si la pieza fue rotada 90° durante el empaquetado */
  readonly rotada: boolean;
  /** Ancho final de la pieza (puede diferir del original si fue rotada) */
  readonly anchoFinal: number;
  /** Alto final de la pieza (puede diferir del original si fue rotada) */
  readonly altoFinal: number;
}

/**
 * Resultado completo del algoritmo de empaquetado.
 * Contiene la distribución de piezas ubicadas, las no ubicadas, y métricas de eficiencia.
 */
export interface NestingResult {
  /** Dimensiones del lienzo utilizado */
  readonly lienzoUtilizado: Canvas;
  /** Porcentaje de uso del área del lienzo (0-100), formateado como string con 1 decimal */
  readonly porcentajeUso: string;
  /** Lista de piezas ubicadas exitosamente con sus coordenadas */
  readonly distribucion: PlacedPiece[];
  /** Lista de IDs de piezas que no pudieron ser ubicadas en el lienzo */
  readonly piezasNoUbicadas: string[];
}

// ─────────────────────────────────────────────────────────────
// Entidades auxiliares de dominio
// ─────────────────────────────────────────────────────────────

/**
 * Tipo de clasificación de una pieza según su geometría.
 * Se utiliza en la lógica de pre-procesamiento del caso de uso.
 *
 * - 'fuelle': Pieza con relación de aspecto > 5 (tira larga/delgada)
 * - 'regular': Pieza con relación de aspecto <= 5
 */
export type PieceClassification = 'fuelle' | 'regular';

/**
 * Pieza enriquecida con metadatos de clasificación.
 * Se genera durante el pre-procesamiento del caso de uso.
 */
export interface ClassifiedPiece extends Piece {
  /** Clasificación geométrica de la pieza */
  readonly clasificacion: PieceClassification;
  /** Relación de aspecto calculada (mayor dimensión / menor dimensión) */
  readonly relacionAspecto: number;
}
