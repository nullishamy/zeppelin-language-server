#!/usr/bin/env node

import { Connection, createConnection, ProposedFeatures, TextDocuments } from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import Parser from 'tree-sitter';
import ZeppelinTag from 'tree-sitter-zeppelin';

import { init as completionInit } from './completion';
import { init as handlerInit } from './handlers';
import { init as hoverInit } from './hover';
import { init as textInit } from './text';

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
interface State {
	settings: Settings;
	clientCapabilities: ClientCapabilities;
	connection: Connection;
	documents: TextDocuments<TextDocument>;
	parser: Parser;
}

export const DEFAULT_SETTINGS: Settings = {
	maxNumberOfProblems: 1000,
};

export const app: State = {
	settings: DEFAULT_SETTINGS,
	clientCapabilities: {
		hasConfigurationCapability: false,
		hasDiagnosticRelatedInformationCapability: false,
	},
	connection: createConnection(ProposedFeatures.all),
	documents: new TextDocuments(TextDocument),
	parser: (() => {
	    const parser = new Parser()
	    parser.setLanguage(ZeppelinTag)
	    return parser
	})()
};

// Initialise modules
handlerInit()
textInit()
completionInit()
hoverInit()

// Make the text document manager listen on the connection
// for open, change and close text document events
app.documents.listen(app.connection);

// Listen on the connection
app.connection.listen();
