# Pruebas Automatizadas de API — Playwright

Este repositorio contiene pruebas de API escritas con **Playwright Test** para los módulos de autenticación, carrito de compras y productos de una aplicación de comercio (farmacia/tienda).

## 📁 Archivos incluidos

| Archivo | Módulo probado | Fichas técnicas |
|---|---|---|
| `auth-cliente.spec.js` | Autenticación / Login de cliente | TC-AUTO-001, TC-AUTO-002 |
| `carrito.spec.js` | Carrito de compras | TC-AUTO-005 |
| `producto.spec.js` | Productos | TC-AUTO-003, TC-AUTO-004 |

## 🧪 Descripción de los casos de prueba

### `auth-cliente.spec.js` — Módulo de Autenticación
Pruebas del endpoint `POST /api/auth/login-cliente`.

- **TC-AUTO-001**: Login exitoso con credenciales válidas. Verifica código `200`, mensaje `"Login exitoso."`, presencia de `token` y que el correo del cliente devuelto coincida con el enviado.
- **TC-AUTO-002**: Login fallido con contraseña incorrecta. Verifica código `401`, mensaje `"Contraseña incorrecta."` y ausencia de `token` en la respuesta.

> **Precondición:** debe existir un cliente registrado en la base de datos con el correo `cliente@ejemplo.com` y contraseña `password123` (constantes `CLIENTE_CORREO` / `CLIENTE_CONTRASENA` al inicio del archivo). Ajusta esos valores a un cliente real de tu entorno, o créalo antes vía el endpoint de registro si tu API lo expone.

### `carrito.spec.js` — Módulo de Carrito
Pruebas del endpoint `POST /api/carrito/agregar`.

- **TC-AUTO-005**: Agregar producto al carrito con datos incompletos (se omiten `id_producto` y `cantidad` a propósito). Verifica código `400` y mensaje `"Datos incompletos."`.

### `producto.spec.js` — Módulo de Productos
Pruebas de los endpoints `POST /api/producto/create` y `GET /api/producto`.

- **`beforeAll`**: crea un proveedor real vía `POST /api/prov/create` para obtener un `id_proveedor` válido, evitando depender de datos ya sembrados en la base de datos.
- **TC-AUTO-003**: Creación de un producto con datos válidos (nombre, descripción, precio unitario y proveedor). Verifica código `201`, que el nombre coincida y que se devuelva un `id` numérico.
- **TC-AUTO-004**: Listado de productos filtrando por nombre. Crea primero un producto "Aspirina" para garantizar al menos una coincidencia, luego consulta `GET /api/producto?nombre=Aspirina` y verifica código `200`, que la respuesta sea un arreglo no vacío y que todos los resultados contengan "aspirina" en el nombre.

## 🛠️ Tecnologías

- [Playwright Test](https://playwright.dev/docs/test-intro) — framework de pruebas end-to-end y de API
- Fixture `request` de Playwright para llamadas HTTP directas (sin UI/navegador)

## ▶️ Cómo ejecutar las pruebas

```bash
# Instalar dependencias
npm install

# Instalar Playwright (si no está instalado)
npm init playwright@latest
# o, si ya tienes package.json:
npx playwright install

# Ejecutar todas las pruebas
npx playwright test

# Ejecutar un archivo específico
npx playwright test auth-cliente.spec.js

# Ejecutar con reporte HTML
npx playwright test --reporter=html
```

## ⚙️ Configuración necesaria

Estas pruebas usan rutas **relativas** (`api/auth/login-cliente`, `api/producto/create`, etc.), por lo que Playwright necesita conocer la URL base de la API. Configúrala en `playwright.config.js`:

```js
// playwright.config.js
module.exports = {
  use: {
    baseURL: "http://localhost:3000", // ajusta al puerto/host real de tu API
  },
};
```

## 📋 Requisitos previos

- Node.js 18+
- La API backend corriendo y accesible en la `baseURL` configurada
- Base de datos con al menos un cliente de prueba registrado (ver precondición de `auth-cliente.spec.js`)

## 📌 Notas generales

- Son pruebas de **integración contra la API real** (no hay mocks): cada test realiza peticiones HTTP reales, por lo que requieren que el backend y la base de datos estén activos y accesibles.
- `producto.spec.js` crea datos reales (proveedor y productos) en cada corrida; si se ejecuta repetidamente contra la misma base de datos, esto puede generar registros duplicados. Considera limpiar la base de datos de pruebas entre corridas o usar una base de datos dedicada a QA.
- Las fichas técnicas (TC-AUTO-001 a 005) referencian un informe técnico externo con los casos de prueba originales.
