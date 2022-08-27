import { DidChangeConfigurationParams } from 'vscode-languageserver';
import { handleDiagnostics } from '../diagnostic';
import { app } from '../server';
import { treeForUri } from '../util';

export function onDidChangeConfiguration(data: DidChangeConfigurationParams) {
	app.settings = data.settings;

	// Revalidate all open text documents
	app.documents.all().forEach((d) => {
		const ast = treeForUri(d.uri)

		handleDiagnostics(d, ast);
	});
}

app.connection.onDidChangeConfiguration(onDidChangeConfiguration)
