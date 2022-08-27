import { TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { handleDiagnostics } from '../diagnostic';
import { app } from '../server';

export function onDidChangeContent(event: TextDocumentChangeEvent<TextDocument>) {
	const text = event.document.getText();
	const ast = app.parser.parse(text);

	// Make sure we update the cache before continuing
	app.trees.set(event.document.uri, ast)

	handleDiagnostics(event.document, ast);
}

app.documents.onDidChangeContent(onDidChangeContent)
