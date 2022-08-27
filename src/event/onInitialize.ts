import {
	InitializeParams,
	InitializeResult,
	TextDocumentSyncKind,
} from 'vscode-languageserver';
import { app } from '../server';

const ON_INIT: InitializeResult = {
	capabilities: {
		textDocumentSync: TextDocumentSyncKind.Incremental,
		// Tell the client that this server supports code completion.
		completionProvider: {
			resolveProvider: true,
			triggerCharacters: ['.'],
		},

		hoverProvider: true,
		definitionProvider: true,
		renameProvider: true
	},
};

export function onInitialize(params: InitializeParams): InitializeResult {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back the defaults.
	app.clientCapabilities.hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);

	app.clientCapabilities.hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	return ON_INIT;
}

app.connection.onInitialize(onInitialize)
