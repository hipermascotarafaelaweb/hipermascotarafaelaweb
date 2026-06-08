import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to product detail page with promotions...');
  await page.goto('http://localhost:3000/producto?id=1', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Take a screenshot
  await page.screenshot({ path: '/tmp/product-detail.png' });
  console.log('✓ Screenshot saved to /tmp/product-detail.png');
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for product name
  const bodyText = await page.innerText('body');
  console.log('\n=== Product Info ===');
  console.log('Has "Alimento Premium Perro 15kg":', bodyText.includes('Alimento Premium Perro 15kg'));
  
  // Check for promotion-related content
  console.log('\n=== Checking for Promotions ===');
  console.log('Has "Promo":', bodyText.includes('Promo'));
  console.log('Has "Descuento":', bodyText.includes('Descuento'));
  console.log('Has "Destacado":', bodyText.includes('Destacado'));
  console.log('Has "-10%":', bodyText.includes('-10%'));
  console.log('Has "Razas Grandes":', bodyText.includes('Razas Grandes'));
  
  // Look for promotion section
  const promoSection = await page.locator('text=/Promoci|Oferta|Destacado/i').first();
  const promoVisible = await promoSection.isVisible().catch(() => false);
  console.log('Promotion section visible:', promoVisible);
  
  // Check all h2 headings
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('\nPage headings:', headings);
  
  // List all visible text with badges
  const badges = await page.locator('[class*="badge"]').allTextContents();
  console.log('\nBadges found:', badges.length > 0 ? badges : 'None');
  
  // Check if there's a PromotionsSection component rendered
  const dataTestPromo = await page.locator('[data-testid*="promo"]').allTextContents();
  console.log('Promo test elements:', dataTestPromo.length > 0 ? dataTestPromo : 'None');
  
  await browser.close();
  console.log('\n✓ Test complete');
})();
