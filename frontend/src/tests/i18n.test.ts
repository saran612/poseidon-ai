import { describe, it, expect } from 'vitest';
import i18n, { resources } from '@/lib/i18n';

describe('i18n localization and resource completeness', () => {
  const languages = ['en', 'ta', 'hi'] as const;

  function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
    return Object.keys(obj).reduce((res: string[], el: string) => {
      const name = prefix ? `${prefix}.${el}` : el;
      if (typeof obj[el] === 'object' && obj[el] !== null && !Array.isArray(obj[el])) {
        res.push(...getAllKeys(obj[el], name));
      } else {
        res.push(name);
      }
      return res;
    }, []);
  }

  const enKeys = getAllKeys(resources.en.translation);

  it('contains all essential navigation keys in en', () => {
    const requiredNavKeys = [
      'nav.overview',
      'nav.map',
      'nav.weather',
      'nav.priorities',
      'nav.resources',
      'nav.shelters',
      'nav.routing',
      'nav.decisions',
      'nav.analytics',
      'nav.logs',
      'nav.settings',
      'nav.dispatchQueue',
    ];

    for (const key of requiredNavKeys) {
      expect(enKeys).toContain(key);
    }
  });

  for (const lang of languages) {
    it(`ensures ${lang} has all keys defined in en`, () => {
      const currentKeys = getAllKeys(resources[lang].translation);
      const missingKeys = enKeys.filter((k) => !currentKeys.includes(k));
      expect(missingKeys, `Language "${lang}" is missing keys: ${missingKeys.join(', ')}`).toEqual([]);
    });

    it(`resolves navigation keys without returning raw key in ${lang}`, async () => {
      await i18n.changeLanguage(lang);
      const translatedOverview = i18n.t('nav.overview');
      expect(translatedOverview).not.toBe('nav.overview');
      expect(translatedOverview.length).toBeGreaterThan(0);
    });
  }
});
