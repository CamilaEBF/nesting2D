/**
 * @file nesting-request.dto.ts
 * @description Data Transfer Objects para la capa HTTP del módulo Nesting.
 *
 * Estos DTOs actúan como contratos de la API REST y utilizan class-validator
 * para asegurar que los datos de entrada cumplan con las restricciones de negocio
 * antes de llegar al caso de uso.
 *
 * Capa: Infraestructura (Adaptador de entrada HTTP)
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
 * DTO para las dimensiones del lienzo (superficie de corte).
 */
export class LienzoDto {
  /**
   * Ancho del lienzo en unidades.
   * Debe ser un número positivo mayor a 0.
   */
  @IsNumber({}, { message: 'El ancho del lienzo debe ser un número.' })
  @IsPositive({ message: 'El ancho del lienzo debe ser mayor a 0.' })
  ancho!: number;

  /**
   * Alto del lienzo en unidades.
   * Debe ser un número positivo mayor a 0.
   */
  @IsNumber({}, { message: 'El alto del lienzo debe ser un número.' })
  @IsPositive({ message: 'El alto del lienzo debe ser mayor a 0.' })
  alto!: number;
}

/**
 * DTO para cada pieza individual a ubicar en el lienzo.
 */
export class PiezaDto {
  /**
   * Identificador único de la pieza.
   * Requerido, debe ser un string no vacío.
   */
  @IsString({ message: 'El id de la pieza debe ser un string.' })
  id!: string;

  /**
   * Ancho de la pieza en unidades.
   * Debe ser un número positivo mayor a 0.
   */
  @IsNumber({}, { message: 'El ancho de la pieza debe ser un número.' })
  @IsPositive({ message: 'El ancho de la pieza debe ser mayor a 0.' })
  ancho!: number;

  /**
   * Alto de la pieza en unidades.
   * Debe ser un número positivo mayor a 0.
   */
  @IsNumber({}, { message: 'El alto de la pieza debe ser un número.' })
  @IsPositive({ message: 'El alto de la pieza debe ser mayor a 0.' })
  alto!: number;

  /**
   * Cantidad de copias requeridas de esta pieza.
   * Debe ser un entero mayor o igual a 1.
   */
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(1, { message: 'La cantidad debe ser al menos 1.' })
  cantidad!: number;

  /**
   * Indica si la pieza puede rotarse 90° para optimizar el empaquetado.
   * Valor por defecto: false.
   */
  @IsBoolean({ message: 'permitirRotacion debe ser un valor booleano.' })
  @IsOptional()
  permitirRotacion: boolean = false;
}

/**
 * DTO principal para la solicitud de cálculo de nesting.
 * Contiene el lienzo y las piezas a empaquetar.
 *
 * Ejemplo de payload:
 * ```json
 * {
 *   "lienzo": { "ancho": 1500, "alto": 1000 },
 *   "piezas": [
 *     { "id": "p1", "ancho": 200, "alto": 300, "cantidad": 2, "permitirRotacion": true }
 *   ]
 * }
 * ```
 */
export class NestingRequestDto {
  /**
   * Configuración del lienzo (superficie de corte).
   * Debe ser un objeto válido con ancho y alto.
   */
  @ValidateNested({ message: 'El lienzo debe ser un objeto válido.' })
  @Type(() => LienzoDto)
  lienzo!: LienzoDto;

  /**
   * Lista de piezas a empaquetar.
   * Debe contener al menos 1 pieza.
   */
  @IsArray({ message: 'Las piezas deben ser un arreglo.' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos 1 pieza.' })
  @ValidateNested({ each: true, message: 'Cada pieza debe ser un objeto válido.' })
  @Type(() => PiezaDto)
  piezas!: PiezaDto[];
}
