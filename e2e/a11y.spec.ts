import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accesibilidad: cero violaciones serias/críticas (incluye color-contrast) en
// las páginas públicas clave.
const pages = [
  { name: 'home', path: '/' },
  { name: 'catálogo', path: '/productos' },
  { name: 'historial', path: '/historial' },
];

for (const p of pages) {
  test(`a11y: ${p.name} sin violaciones críticas/serias`, async ({ page }) => {
    await page.goto(p.path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (seriousOrCritical.length) {
      console.log(
        `[a11y:${p.name}]`,
        seriousOrCritical
          .map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`)
          .join(', ')
      );
    }
    expect(seriousOrCritical).toEqual([]);
  });
}
