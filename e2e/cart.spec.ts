import { test, expect, type Page } from '@playwright/test';

// Carrito: agregar desde el catálogo, abrir el panel, ajustar cantidades y
// verificar totales (con precio efectivo de oferta/promoción).
test.describe('Carrito de compras', () => {
  const ALIMENTO = 'Alimento Premium Perro 15kg'; // precio 20000, promo -10% => 18000
  const PELOTA = 'Pelota Mordillo Gato'; // precio 5000, oferta => 3500

  test.beforeEach(async ({ page }) => {
    await page.goto('/productos');
    await expect(page.getByText('3 productos')).toBeVisible();
  });

  const addToCart = async (page: Page, name: string) => {
    const card = page.locator('.group', { hasText: name });
    await card.getByRole('button', { name: 'Agregar' }).click();
  };

  test('agregar un producto actualiza el badge del carrito', async ({ page }) => {
    await addToCart(page, PELOTA);
    // El botón confirma visualmente
    const card = page.locator('.group', { hasText: PELOTA });
    await expect(card.getByText('Sumado al pedido')).toBeVisible();
    // Badge en el navbar
    await expect(page.getByRole('banner').getByLabel('Abrir carrito').getByText('1')).toBeVisible();
  });

  test('el panel del carrito lista los productos y calcula el total con ofertas', async ({ page }) => {
    await addToCart(page, ALIMENTO);
    await addToCart(page, PELOTA);

    await page.getByLabel('Abrir carrito').click();

    const drawer = page.getByRole('complementary');
    await expect(drawer.getByText(ALIMENTO)).toBeVisible();
    await expect(drawer.getByText(PELOTA)).toBeVisible();

    // Subtotal = 18000 (promo) + 3500 (oferta) = 21500
    await expect(drawer.getByText('$21.500').first()).toBeVisible();
  });

  test('aumentar la cantidad recalcula el total', async ({ page }) => {
    await addToCart(page, PELOTA);
    await page.getByLabel('Abrir carrito').click();

    const drawer = page.getByRole('complementary');
    await drawer.getByLabel('Aumentar cantidad').click();

    // 2 x 3500 = 7000
    await expect(drawer.getByText('$7.000').first()).toBeVisible();
  });

  test('eliminar el último producto deja el carrito vacío', async ({ page }) => {
    await addToCart(page, PELOTA);
    await page.getByLabel('Abrir carrito').click();

    const drawer = page.getByRole('complementary');
    await drawer.getByLabel('Eliminar producto').click();
    await expect(drawer.getByText('Tu carrito está vacío')).toBeVisible();
  });

  test('Continuar lleva al formulario de datos (paso checkout)', async ({ page }) => {
    await addToCart(page, PELOTA);
    await page.getByLabel('Abrir carrito').click();

    const drawer = page.getByRole('complementary');
    await drawer.getByRole('button', { name: 'Continuar' }).click();
    await expect(drawer.getByRole('heading', { name: 'Tus datos' })).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'Confirmar pedido por WhatsApp' })).toBeVisible();
  });
});
