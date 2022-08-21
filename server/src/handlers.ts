import {
	DidChangeConfigurationNotification,
	InitializeParams,
	InitializeResult,
	TextDocumentSyncKind,
} from 'vscode-languageserver';
import { app, DEFAULT_SETTINGS } from './server';

export function init() {
	app.connection.onInitialize((params: InitializeParams) => {
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

		const result: InitializeResult = {
			capabilities: {
				textDocumentSync: TextDocumentSyncKind.Incremental,
				// Tell the client that this server supports code completion.
				completionProvider: {
					resolveProvider: true,
					triggerCharacters: [ '.' ]
				},

				hoverProvider: true,
			},
		};

		return result;
	});

	app.connection.onInitialized(() => {
		if (app.clientCapabilities.hasConfigurationCapability) {
			// Register for all configuration changes.
			app.connection.client.register(DidChangeConfigurationNotification.type, undefined);
		}
	});

	// If we close the document, reset the settings
	app.documents.onDidClose(() => {
		app.settings = DEFAULT_SETTINGS;
	});

	app.connection.onDidChangeWatchedFiles((_change) => {
		// Monitored files have change in VSCode
		app.connection.console.log('We received an file change event');
	});
}
