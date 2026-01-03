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

    // Resolve custom CSS URIs for localResourceRoots
    const customCssUris = await this.resolveCustomCssUris(document);

    const roots: vscode.Uri[] = [
      vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ...(vscode.workspace.workspaceFolders?.map(f => f.uri) || []),
      ...customCssUris.map((u: vscode.Uri) => vscode.Uri.joinPath(u, '..'))
    ];

    // Add document folder to roots only if it's not untitled
    if (document.uri.scheme !== 'untitled') {
      roots.push(vscode.Uri.joinPath(document.uri, '..'));
    }

		webviewPanel.webview.options = {
			enableScripts: true,
      localResourceRoots: roots
		};

		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document, customCssUris);

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
        case 'paste-image':
          this.handlePasteImage(document, webviewPanel, e.data, e.fileName);
          return;
			}
		});

		updateWebview();
	}

  private async handlePasteImage(document: vscode.TextDocument, startWebviewPanel: vscode.WebviewPanel, base64Data: string, fileName: string) {
      if (document.uri.scheme === 'untitled') {
          vscode.window.showWarningMessage('Please save the document before pasting images.');
          return;
      }

      const docDir = vscode.Uri.joinPath(document.uri, '..');
      const assetsDir = vscode.Uri.joinPath(docDir, 'assets');

      try {
          // Ensure assets directory exists
          try {
              await vscode.workspace.fs.stat(assetsDir);
          } catch {
              await vscode.workspace.fs.createDirectory(assetsDir);
          }

          // Generate unique filename
          const timestamp = new Date().getTime();
          const ext = path.extname(fileName) || '.png';
          const newFileName = `image-${timestamp}${ext}`;
          const fileUri = vscode.Uri.joinPath(assetsDir, newFileName);

          // Write file
          const buffer = Buffer.from(base64Data, 'base64');
          await vscode.workspace.fs.writeFile(fileUri, buffer);

          // Generate relative path for Markdown
          // Simple assumes assets is subfolder
          const relativePath = `assets/${newFileName}`;
          const markdownSnippet = `![Image](${relativePath})`;

          startWebviewPanel.webview.postMessage({
              type: 'insert-image',
              text: markdownSnippet
          });
      } catch (e) {
          vscode.window.showErrorMessage(`Failed to save image: ${e}`);
      }
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

	private async resolveCustomCssUris(document: vscode.TextDocument): Promise<vscode.Uri[]> {
    const config = vscode.workspace.getConfiguration('antigravity', document.uri);
    const customCssPaths: string[] = config.get('customCss') || [];
    const validUris: vscode.Uri[] = [];
    const docWorkspace = vscode.workspace.getWorkspaceFolder(document.uri);

    for (const cssPath of customCssPaths) {
      let cssUri: vscode.Uri | undefined;

      if (path.isAbsolute(cssPath)) {
        // Check if absolute path is within any workspace folder
        const absoluteUri = vscode.Uri.file(cssPath);
        const isInWorkspace = vscode.workspace.workspaceFolders?.some(folder =>
          absoluteUri.fsPath.startsWith(folder.uri.fsPath)
        );
        if (isInWorkspace) {
          cssUri = absoluteUri;
        } else {
          vscode.window.showWarningMessage(`Custom CSS rejected (outside workspace): ${cssPath}`);
          continue;
        }
      } else if (docWorkspace) {
        cssUri = vscode.Uri.joinPath(docWorkspace.uri, cssPath);
      } else if (vscode.workspace.workspaceFolders?.[0]) {
        cssUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, cssPath);
      }

      if (cssUri) {
        // Check if file exists
        try {
          await vscode.workspace.fs.stat(cssUri);
          validUris.push(cssUri);
        } catch {
          vscode.window.showWarningMessage(`Custom CSS not found: ${cssPath}`);
        }
      } else {
        vscode.window.showWarningMessage(`Custom CSS skipped (no workspace): ${cssPath}`);
      }
    }
    return validUris;
  }

	private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument, customCssUris: vscode.Uri[]): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.css'));
    const nonce = getNonce();

    // Convert custom CSS URIs to link tags (async check not possible here, rely on localResourceRoots)
    const customCssLinks = customCssUris.map(cssUri => {
      const webviewUri = webview.asWebviewUri(cssUri);
      return `<link href="${webviewUri}" rel="stylesheet">`;
    }).join('\n');

		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
				<link href="${styleUri}" rel="stylesheet">
				${customCssLinks}
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
