// Messages sent from Webview to Extension
export type WebviewToExtensionMessage =
  | { type: 'update'; text: string }
  | { type: 'open-link'; href: string }
  | { type: 'paste-image'; data: string; fileName: string }
  | { type: 'toggle' };

// Messages sent from Extension to Webview
export type ExtensionToWebviewMessage =
  | { type: 'update'; text: string; base?: string }
  | { type: 'toggle' }
  | { type: 'insert-image'; text: string };

// Union type for backwards compatibility/generic handlers if needed,
// but prefer specific types where possible.
export type WebviewMessage = WebviewToExtensionMessage | ExtensionToWebviewMessage;
