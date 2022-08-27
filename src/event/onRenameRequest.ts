import { RenameParams, WorkspaceEdit } from 'vscode-languageserver';
import { app } from '../server';
import { nodeForPosition, pointToRange, treeForUri } from '../util';

export function onRenameRequest(data: RenameParams): WorkspaceEdit | undefined {
	const uri = data.textDocument.uri;
	const ast = treeForUri(uri);
	const node = nodeForPosition(ast, data.position);

	if (node.type !== 'string') {
		// We only support renaming of string values (variable names)
		// as functions (builtin) cannot be renamed, and there are no user defined functions
		return;
	}

	const oldName = node.text;
	const newName = data.newName;

	// Find all usages, either through `get` or `set` calls.
	// The first argument of each is the old name we want to replace
	const usages = ast.rootNode
		.descendantsOfType(['fn'])
		.filter((f) => f.namedChild(0)?.text === 'set' || f.namedChild(0)?.text === 'get')
		.filter((f) => f.namedChild(1)?.child(1)?.text === oldName)
		.map((f) => f.namedChild(1)!.child(1)!);

	if (usages.length === 0) {
		// No usages found, return
		return;
	}

	// Map to a list of changes, which are just an object with the new content and the range
	return {
		changes: {
			[uri]: usages.map((u) => ({
				newText: `"${newName}"`,
				range: pointToRange(u.startPosition, u.endPosition),
			})),
		},
	};
}

app.connection.onRenameRequest(onRenameRequest);
