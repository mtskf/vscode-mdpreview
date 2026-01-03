import * as vscode from 'vscode';
import * as path from 'path';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new MarkdownEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(MarkdownEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'antigravity.markdownEditor';
  private static readonly webviews = new Set<vscode.WebviewPanel>();

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

  public static toggle() {
    for (const panel of this.webviews) {
      if (panel.visible) {
        panel.webview.postMessage({ type: 'toggle' });
      }
    }
  }

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
    MarkdownEditorProvider.webviews.add(webviewPanel);

    const roots = [
      vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ...(vscode.workspace.workspaceFolders?.map(f => f.uri) || [])
    ];

    // Add document folder to roots only if it's not untitled
    if (document.uri.scheme !== 'untitled') {
      roots.push(vscode.Uri.joinPath(document.uri, '..'));
    }

		webviewPanel.webview.options = {
			enableScripts: true,
      localResourceRoots: roots
		};

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
      let baseUri: string | undefined;
      if (document.uri.scheme !== 'untitled') {
          const docFolder = vscode.Uri.joinPath(document.uri, '..');
          baseUri = webviewPanel.webview.asWebviewUri(docFolder).toString();
      }

			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
        base: baseUri
			});
		}

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
      MarkdownEditorProvider.webviews.delete(webviewPanel);
		});

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'update':
					this.updateTextDocument(document, e.text);
					return;
        case 'toggle':
          // Toggle handled by extension command, but we might receive ack/sync here if needed
          return;
        case 'open-link':
          this.openLink(e.href);
          return;
			}
		});

		updateWebview();
	}

  private async openLink(href: string) {
    // Simple resolution: assume it's a filename
    // If it doesn't have an extension, try adding .md
    let filename = href;
    if (!filename.includes('.')) {
      filename += '.md';
    }

    // Try to find the file in the workspace
    // Matches any file with that name in the workspace (fuzzy)
    const files = await vscode.workspace.findFiles(`**/${filename}`, '**/node_modules/**', 1);

    if (files.length > 0) {
      const doc = await vscode.workspace.openTextDocument(files[0]);
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showWarningMessage(`File not found: ${filename}`);
    }
  }

	private getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.css'));
    const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
				<link href="${styleUri}" rel="stylesheet">
				<title>Markdown Preview</title>
			</head>
			<body class="bg-background text-foreground">
				<div id="root"></div>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private updateTextDocument(document: vscode.TextDocument, text: string) {
    if (document.getText() === text) {
      return;
    }
		const edit = new vscode.WorkspaceEdit();
    const lastLine = document.lineAt(document.lineCount - 1);
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount - 1, lastLine.range.end.character),
			text
		);
		return vscode.workspace.applyEdit(edit);
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
