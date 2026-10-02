require("dotenv").config();
const { test, expect } = require("@playwright/test");
const Stripe = require("stripe");
const {
  crearEscenario,
  agregarAlCarrito,
  verCarrito,
  stockActual,
  ventasDeCliente,
} = require("../helpers/fixtures");

/**
 * Módulo: Checkout / Stripe (backend)
 * Herramienta: Playwright (pruebas de API)
 * Corresponde a las filas TC-023, TC-024 y TC-025 del plan de pruebas.
 *
 * Requisitos de entorno (archivo .env, el mismo que usa el servidor):
 *  - TC-023  : STRIPE_SECRET_KEY de PRUEBA (sk_test_...) y HOST_FRONTEND.
 *              Hace una llamada real a Stripe en modo test (no cobra nada).
 *              Si la llave no es de prueba, la prueba se OMITE por seguridad.
 *  - TC-024/025 : STRIPE_WEBHOOK_SECRET (whsec_...). No llaman a Stripe:
 *              la firma del webhook se genera localmente con ese secreto.
 *  - TC-025  : el webhook (stripe.controller.js -> webhookStripe) registra la
 *              venta con id_usuario = 23 e id_sucursal = 9 FIJOS. Debe existir
 *              la sucursal 9 y el usuario 23 en la BD; si no existe la
 *              sucursal 9 la prueba se omite.
 *
 * NOTA sobre TC-025: el plan original decía "payment_intent.succeeded", pero el
 * código solo procesa el evento "checkout.session.completed" (cualquier otro
 * evento se responde 200 "Evento ignorado", ver TC-025b). Se probó lo que el
 * código realmente implementa.
 */

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

// Instancia local SOLO para firmar payloads de prueba (no hace llamadas de red).
const stripeLocal = Stripe("sk_test_solo_para_firmar_payloads");

function eventoStripe(type, id_cliente) {
  const ahora = Date.now();
  return JSON.stringify({
    id: `evt_qa_${ahora}`,
    object: "event",
    created: Math.floor(ahora / 1000),
    type,
    data: {
      object: {
        id: `cs_test_qa_${ahora}`,
        object: "checkout.session",
        client_reference_id: String(id_cliente),
      },
    },
  });
}

function firmar(payload) {
  return stripeLocal.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
}

function enviarWebhook(request, payload, firma) {
  const headers = { "Content-Type": "application/json" };
  if (firma) headers["stripe-signature"] = firma;
  return request.post("api/stripe/webhook", { data: payload, headers });
}

test.describe("Stripe - checkout", () => {
  test("TC-023: checkout con datos válidos genera la sesión de pago", async ({ request }) => {
    test.skip(
      !STRIPE_KEY.startsWith("sk_test_") || !process.env.HOST_FRONTEND,
      "Requiere STRIPE_SECRET_KEY de prueba (sk_test_...) y HOST_FRONTEND en .env"
    );

    const e = await crearEscenario(request, { stock: 10, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    const res = await request.post("api/stripe/checkout", {
      data: { id_cliente: e.id_cliente, cliente_email: e.correo },
    });

    expect(res.status(), `respuesta: ${await res.text()}`).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);

    await request.delete(`api/carrito/vaciar/${e.id_cliente}`);
  });

  test("TC-023b: checkout con el carrito vacío es rechazado (400) sin llamar a Stripe", async ({ request }) => {
    const e = await crearEscenario(request);

    const res = await request.post("api/stripe/checkout", {
      data: { id_cliente: e.id_cliente, cliente_email: e.correo },
    });

    expect(res.status()).toBe(400);
    expect((await res.json()).message).toBe("Carrito vacío.");
  });
});

test.describe("Stripe - webhook", () => {
  test("TC-024: webhook con firma inválida es rechazado (400) y no procesa la compra", async ({ request }) => {
    const e = await crearEscenario(request, { stock: 10, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    // Evento "válido" en forma, pero con una firma falsificada
    const payload = eventoStripe("checkout.session.completed", e.id_cliente);
    const res = await enviarWebhook(request, payload, "t=1700000000,v1=firma_falsificada_abc123");

    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("Webhook Error");

    // Nada se procesó: el carrito sigue intacto, el stock igual y sin ventas
    expect(await verCarrito(request, e.id_cliente)).toHaveLength(1);
    expect(await stockActual(request, e.id_inventario)).toBe(10);
    expect(await ventasDeCliente(request, e.id_cliente)).toHaveLength(0);

    await request.delete(`api/carrito/vaciar/${e.id_cliente}`);
  });

  test("TC-024b: webhook sin cabecera stripe-signature es rechazado (400)", async ({ request }) => {
    const payload = eventoStripe("checkout.session.completed", 1);
    const res = await enviarWebhook(request, payload, null);

    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("Webhook Error");
  });

  test("TC-025: webhook checkout.session.completed firmado registra la venta, vacía el carrito y descuenta stock", async ({ request }) => {
    test.skip(!WEBHOOK_SECRET, "Requiere STRIPE_WEBHOOK_SECRET en .env");
    const sucursal9 = await request.get("api/sucursal/9");
    test.skip(sucursal9.status() !== 200, "Requiere la sucursal id=9 (fija en webhookStripe)");

    const e = await crearEscenario(request, { stock: 10, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    const payload = eventoStripe("checkout.session.completed", e.id_cliente);
    const res = await enviarWebhook(request, payload, firmar(payload));

    expect(res.status(), `respuesta: ${await res.text()}`).toBe(200);
    expect(await res.text()).toBe("Venta registrada");

    // Se generó 1 venta por 2 x Q25 = Q50
    const ventas = await ventasDeCliente(request, e.id_cliente);
    expect(ventas).toHaveLength(1);
    expect(Number(ventas[0].total)).toBe(50);

    // Carrito vaciado e inventario descontado (10 - 2)
    expect(await verCarrito(request, e.id_cliente)).toHaveLength(0);
    expect(await stockActual(request, e.id_inventario)).toBe(8);
  });

  test("TC-025b: un evento firmado de otro tipo (payment_intent.succeeded) se ignora sin crear ventas", async ({ request }) => {
    test.skip(!WEBHOOK_SECRET, "Requiere STRIPE_WEBHOOK_SECRET en .env");

    const e = await crearEscenario(request, { stock: 10, precio: 25 });
    await agregarAlCarrito(request, { id_cliente: e.id_cliente, id_producto: e.id_producto, cantidad: 2 });

    const payload = eventoStripe("payment_intent.succeeded", e.id_cliente);
    const res = await enviarWebhook(request, payload, firmar(payload));

    expect(res.status()).toBe(200);
    expect(await res.text()).toBe("Evento ignorado");

    expect(await verCarrito(request, e.id_cliente)).toHaveLength(1);
    expect(await ventasDeCliente(request, e.id_cliente)).toHaveLength(0);

    await request.delete(`api/carrito/vaciar/${e.id_cliente}`);
  });
});
