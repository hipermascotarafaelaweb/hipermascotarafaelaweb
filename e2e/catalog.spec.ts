import { test, expect } from '@playwright/test';

// Catálogo: render desde datos (mock de Supabase) + filtros client-side.
test.describe('Catálogo /productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: 'Nuestros productos' })).toBeVisible();
  });

  test('renderiza los productos del catálogo', async ({ page }) => {
    await expect(page.getByText('3 productos')).toBeVisible();
    await expect(page.getByText('Alimento Premium Perro 15kg')).toBeVisible();
    await expect(page.getByText('Pelota Mordillo Gato')).toBeVisible();
    await expect(page.getByText('Hueso de Juguete Perro')).toBeVisible();
  });

  test('la búsqueda filtra por nombre', async ({ page }) => {
    await page.getByPlaceholder('Buscar productos...').fill('Alimento');
    await expect(page.getByText('1 producto', { exact: true })).toBeVisible();
    await expect(page.getByText('Alimento Premium Perro 15kg')).toBeVisible();
    await expect(page.getByText('Pelota Mordillo Gato')).toHaveCount(0);
  });

  test('el filtro por mascota (Perros) acota el listado', async ({ page }) => {
    await page.getByRole('button', { name: 'Filtrar' }).click();
    await page.getByRole('button', { name: 'Perros' }).click();
    // Perros: Alimento (perro) + Hueso (perro), no Pelota (gato)
    await expect(page.getByText('2 productos')).toBeVisible();
    await expect(page.getByText('Pelota Mordillo Gato')).toHaveCount(0);
  });

  test('el producto sin stock muestra "Sin stock" y deshabilita la compra', async ({ page }) => {
    const card = page.locator('.group', { hasText: 'Hueso de Juguete Perro' });
    const btn = card.getByRole('button', { name: 'Sin stock' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test('una búsqueda sin resultados muestra el estado vacío', async ({ page }) => {
    await page.getByPlaceholder('Buscar productos...').fill('xyz-no-existe');
    await expect(page.getByText('No encontramos productos')).toBeVisible();
  });

  test('los filtros avanzados (tamaño) acotan el catálogo', async ({ page }) => {
    await page.getByRole('button', { name: 'Filtrar' }).click();
    const adv = page.getByTestId('advanced-filters');
    await expect(adv).toBeVisible();
    // Tamaño = Grande → Alimento (grande) + Hueso (grande), no Pelota (chico)
    await adv.getByLabel('Tamaño').selectOption('grande');
    await expect(page.getByText('2 productos')).toBeVisible();
    await expect(page.getByText('Pelota Mordillo Gato')).toHaveCount(0);
  });
});
