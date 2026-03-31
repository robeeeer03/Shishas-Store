# HookahShop - PRD (Product Requirements Document)

## Original Problem Statement
Crear una web de una tienda de cachimbas con cachimbas, carbones, sabores, y todo lo relacionado con cachimbas.

## User Choices
- Carrito de compra sin pagos
- Categorías: Cachimbas, Carbones, Sabores, Accesorios, Bases
- Panel de administración para gestionar productos
- Sin autenticación de usuarios (tienda pública)
- Sin preferencias de diseño específicas

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB (products collection)
- **State Management**: React Context (Cart)

## User Personas
1. **Cliente**: Usuario que navega la tienda, añade productos al carrito
2. **Administrador**: Gestiona productos (CRUD) desde el panel admin

## Core Requirements (Static)
- [x] Catálogo de productos con categorías
- [x] Carrito de compra funcional (sin pagos)
- [x] Panel de administración con login
- [x] CRUD de productos
- [x] Diseño dark theme premium

## What's Been Implemented (2024-03-31)
- Homepage con hero, categorías bento grid, productos destacados
- Página de tienda con filtros por categoría y búsqueda
- Página de detalle de producto
- Carrito slide-out con persistencia localStorage
- Panel admin con login (admin/hookah2024)
- CRUD completo de productos
- 18 productos iniciales (seed data)
- 5 categorías: Cachimbas, Carbones, Sabores, Accesorios, Bases

## API Endpoints
- `GET /api/categories` - Listar categorías
- `GET /api/products` - Listar productos (filtros: category_id, featured)
- `GET /api/products/:id` - Detalle de producto
- `POST /api/admin/login` - Login admin
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/:id` - Actualizar producto
- `DELETE /api/admin/products/:id` - Eliminar producto

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Catálogo funcional
- [x] Carrito de compra
- [x] Panel admin

### P1 (Important)
- [ ] Integración de pagos (Stripe)
- [ ] Sistema de pedidos
- [ ] Notificaciones por email

### P2 (Nice to have)
- [ ] Sistema de valoraciones/reviews
- [ ] Lista de deseos
- [ ] Filtros avanzados (precio, marca)
- [ ] Comparador de productos

## Next Tasks
1. Añadir integración de pagos si el cliente lo requiere
2. Implementar sistema de gestión de pedidos
3. Añadir más imágenes de productos reales
