import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { app } from './server';

export function init() {
	// The content of a text document has changed. This event is emitted
	// when the text document first opened or when its content has changed.
	app.documents.onDidChangeContent((change) => {
		handleTextDocumentChange(change.document);
	});

	app.connection.onDidChangeConfiguration((change) => {
		app.settings = change.settings;

		// Revalidate all open text documents
		app.documents.all().forEach(handleTextDocumentChange);
	});
}

async function handleTextDocumentChange(textDocument: TextDocument): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more
	const text = textDocument.getText();
	const diagnostics: Diagnostic[] = [];

	// Send the computed diagnostics to VSCode.
	app.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
