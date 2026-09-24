# ✂️ Nesting 2D API - Cut Optimization Engine

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

RESTful API built with **Node.js** and **NestJS** to solve *2D Bin Packing* (Nesting) problems applied to leatherwork and the textile industry. It calculates the optimal distribution of rectangular molds on a canvas, minimizing material waste.

This repository is a **Proof of Concept (PoC)** focused on the design of the mathematical core and domain architecture.

## 🏛 Architecture & Design Patterns

This project was built with a strong focus on scalability and maintainability, applying **Hexagonal Architecture (Ports and Adapters)** and **SOLID** principles:

*   **Domain-Driven Design (DDD):** Pure business logic (piece models, canvases, and *aspect ratio* calculation for bellows) is isolated in the Domain layer, with no dependencies on external frameworks.
*   **Strategy Pattern:** The mathematical engine is implemented through the `INestingStrategy` interface. It currently uses an adapter for `maxrects-packer`, but allows easily injecting irregular polygon packing algorithms in the future without modifying use cases.
*   **Dependency Injection:** Native NestJS dependency management to decouple infrastructure (HTTP controllers and external libraries) from application use cases.

## 🚀 Installation & Setup

**Prerequisites:** Node.js (v18+)

```bash
# 1. Clone the repository
git clone https://github.com/CamilaEBF/nesting2D.git
cd nesting2D

# 2. Install dependencies
npm install

# 3. Start the server in development mode
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## 📖 API Documentation

### Calculate Optimal Distribution

Calculates the $(x, y)$ coordinates of each mold to maximize canvas usage.

**Endpoint:** `POST /api/v1/nesting/calculate`

**Body (JSON):**

```json
{
  "canvas": {
    "width": 1500,
    "height": 1000
  },
  "pieces": [
    { "id": "front-panel", "width": 200, "height": 300, "quantity": 2, "allowRotation": true },
    { "id": "base-bellows", "width": 50, "height": 800, "quantity": 1, "allowRotation": false }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "canvasUsed": {
      "width": 1500,
      "height": 1000
    },
    "usagePercentage": "10.7",
    "distribution": [
      { "pieceId": "front-panel_1", "x": 0, "y": 0, "rotated": false, "finalWidth": 200, "finalHeight": 300 },
      { "pieceId": "front-panel_2", "x": 200, "y": 0, "rotated": false, "finalWidth": 200, "finalHeight": 300 },
      { "pieceId": "base-bellows", "x": 0, "y": 300, "rotated": false, "finalWidth": 50, "finalHeight": 800 }
    ],
    "unplacedPieces": []
  }
}
```

## 🗺 Roadmap (Next Iterations)

This PoC is the foundation for a comprehensive workshop management system. The upcoming architectural phases include:

- [ ] **Polyglot Persistence:** Integration with **PostgreSQL** for transactional (ACID) management of supply inventory (hardware, zipper meters) and **MongoDB** to store complex cutting plan documents.
- [ ] **Offloading & Task Queues:** Migration of synchronous mathematical calculation to an asynchronous *Workers* system using **Redis** and **BullMQ** (event-driven architecture) to prevent *Event Loop* blocking on complex canvases.
- [ ] **Irregular Polygons:** Implementation of a new mathematical strategy for canvas utilization with previous waste (boolean geometry operations).
- [ ] **Frontend Client:** Interactive user interface built with **React** featuring SVG plan rendering.
