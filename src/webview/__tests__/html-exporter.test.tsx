import { describe, it, expect } from 'vitest';
import { generateStandaloneHtml, sanitizeForExport } from '../lib/html-exporter';

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

    it('uses provided title in document', () => {
      const result = generateStandaloneHtml('<p>Test</p>', '', 'My Document');

      expect(result).toContain('<title>My Document</title>');
    });
  });

  describe('sanitizeForExport', () => {
    it('removes vscode-resource: URLs from img src', () => {
      const html = '<img src="vscode-resource://file/path/to/image.png" alt="test">';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-resource:');
      expect(result).toContain('alt="test"');
      expect(result).toContain('src="data:image');
    });

    it('converts vscode href to # with title', () => {
      const html = '<a href="vscode-resource://file/doc.md">Link</a>';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-resource:');
      expect(result).toContain('href="#"');
      expect(result).toContain('title="Link unavailable');
    });

    it('removes vscode-file: URLs from img src', () => {
      const html = '<img src="vscode-file://vscode-app/path/image.png">';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-file:');
    });

    it('removes vscode-webview: URLs from img src', () => {
      const html = '<img src="https://file+.vscode-resource.vscode-cdn.net/path/image.png">';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-resource.vscode-cdn.net');
    });

    it('preserves https URLs', () => {
      const html = '<img src="https://example.com/image.png">';
      const result = sanitizeForExport(html);

      expect(result).toContain('https://example.com/image.png');
    });

    it('preserves data URIs', () => {
      const html = '<img src="data:image/png;base64,ABC123">';
      const result = sanitizeForExport(html);

      expect(result).toContain('data:image/png;base64,ABC123');
    });

    it('removes vscode URLs from CSS url() rules', () => {
      const css = 'background: url("vscode-resource://file/bg.png");';
      const result = sanitizeForExport(css);

      expect(result).not.toContain('vscode-resource:');
    });

    it('replaces vscode href in non-anchor elements with #', () => {
      const html = '<use href="vscode-resource://file/icon.svg#icon"></use>';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-resource:');
      expect(result).toContain('href="#"');
      expect(result).toContain('<use');
    });

    it('sanitizes unquoted src attributes', () => {
      const html = '<img src=vscode-resource://file/image.png alt=test>';
      const result = sanitizeForExport(html);

      expect(result).not.toContain('vscode-resource:');
      expect(result).toContain('src="data:image');
    });
  });
});
