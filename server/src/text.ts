import { Diagnostic, DiagnosticSeverity, Position, Range } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { app } from './server';
import { functions } from './functions';
import { notEqual } from 'assert';

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

	const ast = app.parser.parse(text)

	const errors = ast.rootNode.descendantsOfType([ 'ERROR' ])
	diagnostics.push(...errors.map(err => {
		const start = err.startPosition
		const end = err.endPosition

		return {
			range: Range.create(
				Position.create(start.row, start.column), 
				Position.create(end.row, end.column)
			),
			message: `Parsing error: ${err.text}`,
			severity: DiagnosticSeverity.Error
		}
	}))

	const blocks = ast.rootNode.descendantsOfType([ 'eval_block' ])
		// As blocks can only have one expression, this will work
		// HACK: child 1 because of the curly brace
		// FIXME: use a named child instead
		.filter(b => b.child(1)?.type === 'string' || b.child(1)?.type === 'number')
		.map(b => {
			const start = b.startPosition
			const end = b.endPosition

			return {
				range: Range.create(
					Position.create(start.row, start.column), 
					Position.create(end.row, end.column)
				),
				message: `Evaluating ${b.child(1)?.type}s will not yield a value`,
				severity: DiagnosticSeverity.Warning
			}
		})

	diagnostics.push(...blocks)

	const notFound = ast.rootNode.descendantsOfType([ 'fn' ])
		.filter(f => functions.find(f2 => f2.name == f.namedChild(0)?.text) === undefined)
		.map(f => {
			const start = f.startPosition
			const end = f.endPosition

			return {
				range: Range.create(
					Position.create(start.row, start.column), 
					Position.create(end.row, end.column)
				),
				message: `Could not find function ${f.namedChild(0)?.text}`,
				severity: DiagnosticSeverity.Error
			}
		})

	diagnostics.push(...notFound)

	diagnostics.push({
		range: Range.create(Position.create(0, 0), Position.create(0, 0)),
		message: ast.rootNode.toString(),
		severity: DiagnosticSeverity.Information			
	})	

	// Send the computed diagnostics to the client.
	app.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
