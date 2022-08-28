#!/usr/bin/env node

import {
	Connection,
	createConnection,
	ProposedFeatures,
	TextDocuments,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import Parser from 'tree-sitter';
import ZeppelinTag from 'tree-sitter-zeppelin';

import { init as completionInit } from './completion';
import { init as eventInit } from './event';

// The settings shape
interface Settings {
	maxNumberOfProblems: number;
}

// The client capabililties
interface ClientCapabilities {
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
}

// The server state
interface App {
	settings: Settings;
	clientCapabilities: ClientCapabilities;
	connection: Connection;
	documents: TextDocuments<TextDocument>;
	// URI => AST
	trees: Map<string, Parser.Tree>;
	parser: Parser;
}

export const DEFAULT_SETTINGS: Settings = {
	maxNumberOfProblems: 1000,
};

export const app: App = {
	settings: DEFAULT_SETTINGS,
	clientCapabilities: {
		hasConfigurationCapability: false,
		hasDiagnosticRelatedInformationCapability: false,
	},
	connection: createConnection(ProposedFeatures.all),
	documents: new TextDocuments(TextDocument),
	trees: new Map(),
	parser: (() => {
		const parser = new Parser();
		parser.setLanguage(ZeppelinTag);
		return parser;
	})(),
};

// Initialise modules
eventInit();
completionInit();

// Make the text document manager listen on the connection
// for open, change and close text document events
app.documents.listen(app.connection);

// Listen on the connection
app.connection.listen();
