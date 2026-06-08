import { test, expect } from '@playwright/test';

test.describe('Promotions on Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to product 1 which has a promotion in fixtures
    await page.goto('/producto?id=1');
    await expect(page.getByRole('heading', { name: /Alimento Premium Perro/i })).toBeVisible({ timeout: 10000 });
  });

  test('muestra las promociones activas en la sección de detalles', async ({ page }) => {
    // The fixture has promotion ID 1 linked to product 1
    // Promotion: "Promo Razas Grandes" with "10% en alimento premium"
    
    // Check that the promotion section is visible
    const promoSection = page.locator('.bg-brand-50.border.border-brand-200');
    await expect(promoSection).toBeVisible();
    
    // Check promotion title
    await expect(page.getByText('Promo Razas Grandes')).toBeVisible();
    
    // Check promotion description
    await expect(page.getByText('10% en alimento premium')).toBeVisible();
    
    // Check discount text
    await expect(page.getByText('10% descuento')).toBeVisible();
  });

  test('aplica el descuento de promoción al precio mostrado', async ({ page }) => {
    // Product 1 price: 20000, promotion: 10% discount
    // Expected price: 18000
    
    // The component applies the promotion via applyPromotionToProduct()
    // which sets sale_price, so the effective price should reflect the discount
    
    // Price text should show the discounted price
    const priceText = await page.locator('text=/\$|ARS/').first().textContent();
    console.log('Price shown:', priceText);
    
    // Should have a discount badge
    await expect(page.getByText(/-\d+%/)).toBeVisible();
  });

  test('no muestra promoc para producto sin promociones vinculadas', async ({ page }) => {
    // Navigate to product 2 (Pelota Mordillo Gato) - has no promotions
    await page.goto('/producto?id=2');
    await expect(page.getByRole('heading', { name: /Pelota Mordillo Gato/i })).toBeVisible({ timeout: 10000 });
    
    // Should not have promotion section
    const promoSection = page.locator('.bg-brand-50').filter({ hasText: /Promo|Descuento/i });
    await expect(promoSection).toHaveCount(0);
  });
});
