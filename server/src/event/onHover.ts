import { Hover, HoverParams } from 'vscode-languageserver';
import { buildFunctionDocs } from '../completion';
import { FUNCTIONS } from '../const/functions';
import { VALUES } from '../const/values';
import { app } from '../server';
import { nodeForPosition, treeForUri } from '../util';

export function onHover(data: HoverParams): Hover | undefined {
	const ast = treeForUri(data.textDocument.uri);
	const node = nodeForPosition(ast, data.position)

	if (node.type !== 'ident') {
		// If we arent hovering an identifier we cant do anything
		return;
	}

	// Determine what type we're hovering over
	// ie the context

	const parent = node.parent;

	if (parent === null) {
		// Cannot identify the context, fail silently
		return;
	}

	if (parent.type === 'fn') {
		// We're hovering over a function name, proceed with that
		const fnName = node.text;

		const fn = FUNCTIONS.find((f) => f.name == fnName);

		if (fn) {
			return {
				contents: buildFunctionDocs(fn),
			};
		} else {
			return {
				contents: `unknown builtin ${fnName}`,
			};
		}
	}

	if (parent.type === 'property') {
		// We're hovering over some part of a property, identify the base

		const base = parent.namedChild(0);
		const props = parent.namedChildren;

		if (!base) {
			// The property was malformed
			return {
				contents: `unknown property ${node.text}`,
			};
		}

		if (!props) {
			// We arent accessing any properties, return base info
			// TODO: linter warning?

			const obj = VALUES.find((v) => v.key == base.text);

			return {
				contents: `${base.text}: ${obj?.type ?? 'unknown'}`,
			};
		}

		// We are accessing some amount of properties on a value
		const key = props.map((c) => c.text).join('.');
		const obj = VALUES.find((v) => v.key == key);

		return {
			contents: `${key}: ${obj?.type ?? 'unknown'}`,
		};
	}

	// Fail silently, the hover type wasnt valid
}

app.connection.onHover(onHover);
