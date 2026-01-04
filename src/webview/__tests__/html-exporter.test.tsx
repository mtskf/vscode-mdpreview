import { describe, it, expect } from 'vitest';
import { generateStandaloneHtml } from '../lib/html-exporter';

describe('html-exporter', () => {
  describe('generateStandaloneHtml', () => {
    it('returns valid HTML document structure', () => {
      const result = generateStandaloneHtml('<p>Test</p>', '');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
      expect(result).toContain('<head>');
      expect(result).toContain('</head>');
      expect(result).toContain('<body');
      expect(result).toContain('</body>');
    });

    it('includes content within body', () => {
      const content = '<h1>Hello World</h1>';
      const result = generateStandaloneHtml(content, '');

      expect(result).toContain(content);
      // Content should be between body tags
      const bodyMatch = result.match(/<body[^>]*>([\s\S]*)<\/body>/);
      expect(bodyMatch?.[1]).toContain(content);
    });

    it('inlines styles within style tags', () => {
      const styles = 'body { background: #1e1e1e; color: #fff; }';
      const result = generateStandaloneHtml('<p>Test</p>', styles);

      expect(result).toContain('<style>');
      expect(result).toContain(styles);
      expect(result).toContain('</style>');
    });

    it('sets proper meta tags for encoding and viewport', () => {
      const result = generateStandaloneHtml('<p>Test</p>', '');

      expect(result).toContain('charset="UTF-8"');
      expect(result).toContain('viewport');
    });

    it('includes dark mode body class', () => {
      const result = generateStandaloneHtml('<p>Test</p>', '');

      expect(result).toMatch(/<body[^>]*class="[^"]*dark[^"]*"/);
    });

    it('escapes title for XSS prevention', () => {
      const result = generateStandaloneHtml('<p>Test</p>', '', '<script>alert(1)</script>');

      // Should not contain raw script tag in title
      expect(result).not.toContain('<title><script>');
    });
  });
});
