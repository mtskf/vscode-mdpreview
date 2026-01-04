/**
 * Generates a self-contained HTML document from preview content.
 *
 * @param content - The HTML content to include in the body
 * @param styles - CSS styles to inline in the document
 * @param title - Optional document title (defaults to "Markdown Export")
 * @returns Complete HTML document as a string
 */
export function generateStandaloneHtml(
  content: string,
  styles: string,
  title: string = 'Markdown Export'
): string {
  // Escape title to prevent XSS
  const escapedTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <style>
${styles}
  </style>
</head>
<body class="bg-background text-foreground dark">
  <div class="prose prose-invert max-w-none p-6">
    ${content}
  </div>
</body>
</html>`;
}

/**
 * Patterns that identify VS Code webview-specific URLs.
 * These URLs will not work outside of VS Code.
 */
const VSCODE_URL_PATTERNS = [
  /vscode-resource:/gi,
  /vscode-file:/gi,
  /vscode-webview:/gi,
  /https?:\/\/[^"'\s]*vscode-resource\.vscode-cdn\.net[^"'\s]*/gi,
  /https?:\/\/file\+\.[^"'\s]*vscode[^"'\s]*/gi,
];

/**
 * Sanitizes HTML/CSS content for standalone export by removing or replacing
 * VS Code webview-specific URLs that won't work in a normal browser.
 *
 * @param content - HTML or CSS content to sanitize
 * @returns Sanitized content with vscode URLs replaced appropriately
 */
export function sanitizeForExport(content: string): string {
  let result = content;

  // Pattern fragment for vscode-specific URLs (used in HTML attributes)
  const vscodeUrlPattern = 'vscode-resource|vscode-file|vscode-webview|vscode-resource\\.vscode-cdn\\.net|file\\+\\..*vscode';

  // Replace vscode-specific URLs in img src with placeholder image
  result = result.replace(
    new RegExp(`\\bsrc=["']([^"']*(?:${vscodeUrlPattern})[^"']*)["']`, 'gi'),
    'src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23444\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'55\' text-anchor=\'middle\' fill=\'%23888\' font-size=\'10\'%3ELocal Image%3C/text%3E%3C/svg%3E"'
  );

  // Replace vscode-specific URLs in href with # (dead link indicator)
  // First remove any existing title attribute to avoid duplicates
  result = result.replace(
    new RegExp(`\\bhref=["']([^"']*(?:${vscodeUrlPattern})[^"']*)["'](\\s+title=["'][^"']*["'])?`, 'gi'),
    'href="#" title="Link unavailable in exported HTML"'
  );

  // Replace vscode URLs in CSS url() with empty/transparent
  for (const pattern of VSCODE_URL_PATTERNS) {
    result = result.replace(
      new RegExp(`url\\(["']?(${pattern.source}[^"')]*?)["']?\\)`, 'gi'),
      'url()'
    );
  }

  return result;
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
