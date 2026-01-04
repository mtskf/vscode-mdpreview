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
