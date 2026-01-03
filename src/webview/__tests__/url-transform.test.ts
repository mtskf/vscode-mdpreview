import { describe, it, expect } from 'vitest';
import { urlTransform } from '../lib/url-transform';

describe('urlTransform', () => {
  it('returns http/https URLs as is', () => {
    expect(urlTransform('https://example.com/image.png')).toBe('https://example.com/image.png');
    expect(urlTransform('http://example.com/image.png')).toBe('http://example.com/image.png');
  });

  it('returns data URLs as is', () => {
    expect(urlTransform('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });

  it('returns absolute paths as is', () => {
    expect(urlTransform('/absolute/path/image.png')).toBe('/absolute/path/image.png');
  });

  it('resolves relative paths against basePath', () => {
    expect(urlTransform('image.png', 'https://webview-uri/workspace/')).toBe('https://webview-uri/workspace/image.png');
    expect(urlTransform('./image.png', 'https://webview-uri/workspace/')).toBe('https://webview-uri/workspace/image.png');
    expect(urlTransform('sub/image.png', 'https://webview-uri/workspace/')).toBe('https://webview-uri/workspace/sub/image.png');
  });

  it('handles basePath without trailing slash', () => {
    expect(urlTransform('image.png', 'https://webview-uri/workspace')).toBe('https://webview-uri/workspace/image.png');
  });

  it('returns original URL if resolution fails', () => {
    // improper base path that causes URL constructor to fail?
    // URL constructor throws if base is invalid.
    expect(urlTransform('image.png', 'invalid-base-url')).toBe('image.png');
  });

  it('returns original URL if no basePath provided', () => {
    expect(urlTransform('image.png', undefined)).toBe('image.png');
  });
});
