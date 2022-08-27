import { Definition, DefinitionParams, Position, Range } from 'vscode-languageserver';
import { app } from '../server';
import { nodeForPosition, treeForUri } from '../util';

export function onDefinition(data: DefinitionParams): Definition | undefined {
	const uri = data.textDocument.uri;
	const ast = treeForUri(uri);
	const node = nodeForPosition(ast, data.position)

	// We only support goto def for strings (variable names)
	// if called on anything else, abort
	if (node.type !== 'string') {
		return;
	}

	const varname = node.text;

	// With the varname, search the tree for a corresponding `set` statment
	const setNodes = ast.rootNode
		.descendantsOfType(['fn'])
		// All `set` calls
		.filter((f) => f.namedChild(0)?.text === 'set')
		// Second child call to `1` to skip open_paren of the args list

		// Set calls come in the form `set(varname, varvalue)` to the first arg is always the name
		// which we are filtering for
		.filter((f) => f.namedChild(1)?.child(1)?.text === varname);

	if (setNodes.length === 0) {
		// TODO: diagnostic for `get` calls with no `set` call
		// TODO: improve this with per-document var maps?
		// No definition found, return
		return;
	}

	if (setNodes.length === 1) {
		const node = setNodes[0];
		return {
			uri,
			range: Range.create(
				// Wrap the whole set token
				Position.create(node.startPosition.row, node.startPosition.column),
				Position.create(node.startPosition.row, node.startPosition.column)
			),
		};
	}

	return setNodes.map((node) => ({
		uri,
		range: Range.create(
			// Wrap the whole set token
			Position.create(node.startPosition.row, node.startPosition.column),
			Position.create(node.startPosition.row, node.startPosition.column)
		),
	}));
}

app.connection.onDefinition(onDefinition);
