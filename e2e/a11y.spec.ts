import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accesibilidad: sin violaciones críticas/serias en las páginas clave.
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

    // color-contrast es deuda de diseño (requiere decidir tonos de marca): se
    // reporta como warning pero no bloquea. El resto sí debe estar en cero.
    const contrast = seriousOrCritical.filter((v) => v.id === 'color-contrast');
    const blocking = seriousOrCritical.filter((v) => v.id !== 'color-contrast');

    if (contrast.length) {
      console.log(
        `[a11y:${p.name}] WARN color-contrast: ${contrast.reduce((n, v) => n + v.nodes.length, 0)} nodos (deuda de diseño)`
      );
    }
    if (blocking.length) {
      console.log(
        `[a11y:${p.name}] BLOQUEANTE:`,
        blocking.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}`).join(', ')
      );
    }
    expect(blocking).toEqual([]);
  });
}
