# ✂️ Nesting 2D API - Motor de Optimización de Cortes

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

API RESTful desarrollada en **Node.js** y **NestJS** para resolver problemas de *2D Bin Packing* (Nesting) aplicados a la marroquinería y la industria textil. Calcula la distribución óptima de moldes rectangulares sobre un lienzo, minimizando el desperdicio de material.

Este repositorio es una **Prueba de Concepto (PoC)** centrada en el diseño del núcleo matemático y la arquitectura del dominio.

## 🏛 Arquitectura y Patrones de Diseño

Este proyecto fue construido con un fuerte enfoque en la escalabilidad y mantenibilidad, aplicando **Arquitectura Hexagonal (Puertos y Adaptadores)** y principios **SOLID**:

*   **Domain-Driven Design (DDD):** La lógica de negocio pura (modelos de piezas, lienzos y cálculo de *aspect ratio* para fuelles) está aislada en la capa de Dominio, sin dependencias de frameworks externos.
*   **Strategy Pattern:** El motor matemático se implementa mediante la interfaz `INestingStrategy`. Actualmente utiliza un adaptador para `maxrects-packer`, pero permite inyectar fácilmente algoritmos de empaquetado de polígonos irregulares en el futuro sin modificar los casos de uso.
*   **Dependency Injection:** Gestión de dependencias nativa de NestJS para desacoplar la infraestructura (controladores HTTP y librerías externas) de los casos de uso de la aplicación.

## 🚀 Instalación y Ejecución

**Prerrequisitos:** Node.js (v18+)

```bash
# 1. Clonar el repositorio
git clone https://github.com/camilaebf/nesting2D.git
cd nesting2D

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor en modo desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.

## 📖 Documentación de la API

### Calcular Distribución Óptima

Calcula las coordenadas $(x, y)$ de cada molde para maximizar el uso del lienzo.

**Endpoint:** `POST /api/v1/nesting/calculate`

**Body (JSON):**

```json
{
  "lienzo": {
    "ancho": 1500,
    "alto": 1000
  },
  "piezas": [
    { "id": "panel-frontal", "ancho": 200, "alto": 300, "cantidad": 2, "permitirRotacion": true },
    { "id": "fuelle-base", "ancho": 50, "alto": 800, "cantidad": 1, "permitirRotacion": false }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "lienzoUtilizado": {
      "ancho": 1500,
      "alto": 1000
    },
    "porcentajeUso": "10.67",
    "distribucion": [
      { "idPieza": "panel-frontal", "x": 0, "y": 0, "rotada": false },
      { "idPieza": "panel-frontal", "x": 200, "y": 0, "rotada": false },
      { "idPieza": "fuelle-base", "x": 0, "y": 300, "rotada": false }
    ],
    "piezasNoUbicadas": []
  }
}
```

## 🗺 Roadmap (Próximas Iteraciones)

Esta PoC es la base de un sistema integral de gestión de taller. Las próximas fases arquitectónicas incluyen:

- [ ] **Persistencia Políglota:** Integración con **PostgreSQL** para manejo transaccional (ACID) del inventario de insumos (herrajes, metros de cierre) y **MongoDB** para almacenar los documentos complejos de los planos de corte.
- [ ] **Offloading y Colas de Tareas:** Migración del cálculo matemático síncrono a un sistema de *Workers* asíncronos utilizando **Redis** y **BullMQ** (arquitectura orientada a eventos) para evitar el bloqueo del *Event Loop* ante lienzos complejos.
- [ ] **Polígonos Irregulares:** Implementación de una nueva estrategia matemática para el aprovechamiento de lienzos con mermas previas (operaciones booleanas de geometría).
- [ ] **Frontend Client:** Interfaz de usuario interactiva desarrollada en **React** con renderizado de planos en SVG.
