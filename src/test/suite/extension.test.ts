import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';

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
      await vscode.commands.executeCommand('antigravity.markdown.exportHtml');
      assert.ok(true, 'Command executed without error');
    } catch (e) {
      assert.fail(`Command failed: ${e}`);
    }
	});
});
