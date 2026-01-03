export type WebviewMessage =
  | { type: 'update'; text: string; base?: string }
  | { type: 'toggle' }
  | { type: 'open-link'; href: string }
  | { type: 'paste-image'; data: string; fileName: string }
  | { type: 'insert-image'; text: string };
