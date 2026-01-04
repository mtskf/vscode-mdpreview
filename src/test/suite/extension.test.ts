import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';
import { MarkdownEditorProvider } from '../../EditorProvider';
import * as os from 'os';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should accept html export command', async () => {
    // Open a markdown file
    const doc = await vscode.workspace.openTextDocument({
      language: 'markdown',
      content: '# Hello World\n\nTest content'
    });
    await vscode.window.showTextDocument(doc);

    // Open Preview (using toggle command)
    await vscode.commands.executeCommand('antigravity.markdown.toggle');

    // Give it a moment to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Execute Export Command
    try {
      // Set test URI to bypass save dialog

      MarkdownEditorProvider.test_pendingExportUri = vscode.Uri.file(path.join(os.tmpdir(), 'test-export.html'));

      await vscode.commands.executeCommand('antigravity.markdown.exportHtml');
      assert.ok(true, 'Command executed without error');
    } catch (e) {
      assert.fail(`Command failed: ${e}`);
    }
	});
});
