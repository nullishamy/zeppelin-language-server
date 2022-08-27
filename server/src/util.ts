import Parser from 'tree-sitter';
import { Position, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { app } from './server';

export function documentForUri(uri: string): TextDocument {
	const document = app.documents.get(uri);

	// This should never happen, if it does it means our document manager is incorrectly configured
	if (!document) {
		throw new Error(`could not get content for URI ${uri}`);
	}

	return document;
}

export function treeForUri(uri: string): Parser.Tree {
	const existing = app.trees.get(uri)

	if (existing) {
		return existing
	}

	const content = documentForUri(uri)
	const ast = app.parser.parse(content.getText())

	app.trees.set(uri, ast)

	return ast
}

export function nodeForPosition(ast: Parser.Tree, pos: Position): Parser.SyntaxNode {
	return ast.rootNode.descendantForPosition({
		row: pos.line,
		column: pos.character,
	});
}

export function pointToRange(start: Parser.Point, end: Parser.Point): Range {
	return Range.create(
		Position.create(start.row, start.column),
		Position.create(end.row, end.column),
	)	
}
