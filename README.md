# Car Dealership Inventory System

Monorepo scaffold for a full-stack car dealership inventory application.

## Structure

- `backend/` - Node.js, Express, MongoDB, Jest, and Supertest
- `frontend/` - React app created with Vite

## My AI Usage

- Used GitHub Copilot to confirm the initial monorepo scaffold for the backend and frontend folders.
- Used GitHub Copilot to verify the backend Jest smoke test and the frontend Vite build during setup.
- Used GitHub Copilot to initialize git at the repository root and prepare the project for the first commit.
- Used GitHub Copilot to draft this README section so I can keep expanding my AI usage notes as the project grows.
- Used Claude AI to debug a JWT `secretOrPrivateKey must have a value` error caused by `dotenv.config()` being called too late in the startup sequence, then moved env loading to the top of `index.js`.
- Used Claude AI to implement the `GET /api/vehicles` list endpoint following TDD: wrote the failing test first (RED), then implemented the service and route (GREEN), and finally cleaned up stale server test mocks (BLUE/REFACTOR).
- Used Claude AI to implement `GET /api/vehicles/search` with query-based filtering (make, model, category, price range) following TDD. In the REFACTOR phase, Claude identified duplicate field-mapping logic across three service functions and extracted a shared `formatVehicle()` helper to follow DRY/Single Responsibility principles.
- Used Claude AI to implement `PUT /api/vehicles/:id` for updating vehicle details following TDD. The REFACTOR phase extracted a centralised `handleRouteError()` helper in the routes file to map service-layer errors (e.g., "not found" → 404) to correct HTTP status codes, keeping route handlers clean and consistent.
- Used Claude AI to implement `DELETE /api/vehicles/:id` following TDD, introducing Role-Based Access Control (RBAC). Added a `role` field to the User model, updated the auth service to include `role` in the JWT payload, and created a `requireAdmin` middleware to enforce permissions (403 Forbidden).
- Used Claude AI to implement `POST /api/vehicles/:id/purchase` following TDD. Added a `quantity` field to the Vehicle model and created a service to decrement stock, throwing appropriate errors for out-of-stock or not-found scenarios.
- Used Claude AI to implement `POST /api/vehicles/:id/restock` following TDD. Created a service to increment vehicle quantity (defaulting to 1 or using an optional payload amount) and protected the route with the `requireAdmin` middleware.
- Used Claude AI to enforce project data rules by making the `category` field required on the Vehicle model, complete with a new model validation test suite.
- Reflection: AI helped me move quickly through repetitive setup work, while I still verified each command and kept the structure intentionally minimal so I can build features with TDD later. Using Claude for the dotenv debugging was especially valuable — it traced through the execution order across multiple files to identify a race condition I might have missed on my own. The REFACTOR suggestions (like extracting shared helpers) are where AI adds the most value — it spots patterns across functions that are easy to miss when writing them incrementally.
