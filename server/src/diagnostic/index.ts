import { DiagnosticHandler } from "./interface";
import { TextDocument } from "vscode-languageserver-textdocument";
import Parser from "tree-sitter";
import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver";
import { app } from "../server";

import values from './impl/evaluating-values'
import unknownf from './impl/unknown-function'
import unknownv from './impl/unknown-value'
import error from './impl/parser-error'

export const DIAGNOSTICS: DiagnosticHandler[] = [
	values,
	unknownf,
	unknownv,
	error
]

export function handleDiagnostics(document: TextDocument, ast: Parser.Tree) {
	const diagnostics: Diagnostic[] = [];

	for (const handler of DIAGNOSTICS) {
		diagnostics.push(...handler.handle(ast))
	}

	diagnostics.push({
		range: Range.create(Position.create(0, 0), Position.create(0, 0)),
		message: ast.rootNode.toString(),
		severity: DiagnosticSeverity.Information			
	})	

	// Send the computed diagnostics to the client.
	app.connection.sendDiagnostics({ uri: document.uri, diagnostics });
}
