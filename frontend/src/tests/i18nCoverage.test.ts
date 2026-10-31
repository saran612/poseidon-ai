import { describe, it, expect } from 'vitest';
import i18n from '@/lib/i18n';

describe('i18n Translation Completeness (en, ta, hi)', () => {
  const enResources = i18n.getResourceBundle('en', 'translation') || {};
  const taResources = i18n.getResourceBundle('ta', 'translation') || {};
  const hiResources = i18n.getResourceBundle('hi', 'translation') || {};

  function getFlatKeys(obj: Record<string, any>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(getFlatKeys(obj[key], fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  const enKeys = getFlatKeys(enResources);

  it('contains essential navigation and app translation keys in English', () => {
    expect(enKeys).toContain('nav.overview');
    expect(enKeys).toContain('nav.map');
    expect(enKeys).toContain('nav.priorities');
    expect(enKeys).toContain('nav.resources');
    expect(enKeys).toContain('nav.shelters');
    expect(enKeys).toContain('nav.routing');
    expect(enKeys).toContain('nav.decisions');
    expect(enKeys).toContain('nav.weather');
    expect(enKeys).toContain('nav.analytics');
    expect(enKeys).toContain('nav.logs');
    expect(enKeys).toContain('nav.settings');
  });

  it('ensures every key present in en also exists in ta (Tamil)', () => {
    const missingInTa: string[] = [];
    for (const key of enKeys) {
      const parts = key.split('.');
      let cur: any = taResources;
      for (const p of parts) {
        cur = cur?.[p];
      }
      if (cur === undefined) {
        missingInTa.push(key);
      }
    }
    expect(missingInTa).toEqual([]);
  });

  it('ensures every key present in en also exists in hi (Hindi)', () => {
    const missingInHi: string[] = [];
    for (const key of enKeys) {
      const parts = key.split('.');
      let cur: any = hiResources;
      for (const p of parts) {
        cur = cur?.[p];
      }
      if (cur === undefined) {
        missingInHi.push(key);
      }
    }
    expect(missingInHi).toEqual([]);
  });
});
