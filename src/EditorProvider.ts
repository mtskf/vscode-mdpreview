import * as vscode from 'vscode';

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
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
      const docFolder = vscode.Uri.joinPath(document.uri, '..');
      const baseUri = webviewPanel.webview.asWebviewUri(docFolder);
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
        base: baseUri.toString()
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

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">
				<title>Markdown Preview</title>
			</head>
			<body class="bg-background text-foreground">
				<div id="root"></div>
				<script type="module" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private updateTextDocument(document: vscode.TextDocument, text: string) {
		const edit = new vscode.WorkspaceEdit();
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			text
		);
		return vscode.workspace.applyEdit(edit);
	}
}
