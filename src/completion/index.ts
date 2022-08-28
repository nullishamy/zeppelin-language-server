import {
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
} from 'vscode-languageserver';
import { FUNCTIONS, TagFunction } from '../const/functions';
import { TagValue, VALUES } from '../const/values';
import { app } from '../server';

const GLOBAL_VALUES = VALUES.filter((v) => v.kind === 'root').map((f) => {
	// key will be a legible value because we're only getting roots
	return {
		label: f.key,
		kind: CompletionItemKind.Constant,
		data: f.key,
	};
});

const GLOBAL_FUNCTIONS = FUNCTIONS.map((f) => {
	return {
		label: f.name,
		kind: CompletionItemKind.Function,
		data: f.name,
	};
});

const GLOBALS = [...GLOBAL_VALUES, ...GLOBAL_FUNCTIONS];

export function init() {
	// This handler provides the initial list of the completion items.
	app.connection.onCompletion((data: TextDocumentPositionParams): CompletionItem[] => {
		const document = app.documents.get(data.textDocument.uri);

		// This should never happen, if it does it means our document manager is incorrectly configured
		if (!document) {
			throw new Error(`could not get content for URI ${data.textDocument.uri}`);
		}

		const ast = app.parser.parse(document.getText());
		const node = ast.rootNode.descendantForPosition({
			row: data.position.line,
			// Go back so that we select the ident of the object we're accessing
			column: data.position.character - 2,
		});

		if (node.type !== 'ident') {
			// We arent completing an identifier of any kind, fallback to globals
			return GLOBALS;
		}

		const parent = node.parent;

		if (parent === null) {
			return GLOBALS;
		}

		if (parent.type === 'fn') {
			return GLOBAL_FUNCTIONS;
		}

		if (parent.type === 'property') {
			// We're completing a property, find the base to provide more accurate completion
			const base = parent.namedChild(0);

			if (!base) {
				// Base was malformed, fallback to global values
				return GLOBAL_VALUES;
			}

			const baseName = base.text;

			const baseProps = VALUES.filter(
				(v) => v.kind === 'child' && v.key.startsWith(baseName)
			);

			if (baseProps.length === 0) {
				// Base was not recognised, fallback to global values
				return GLOBAL_VALUES;
			}

			return baseProps.map((v) => ({
				label: v.key,
				kind: CompletionItemKind.Property,
				data: v.key,
			}));
		}

		return GLOBALS;
	});

	// This handler resolves additional information for the item selected in
	// the completion list.
	app.connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
		const fn = FUNCTIONS.find((f) => f.name === item.data);
		if (fn) {
			item.documentation = buildFunctionDocs(fn);
		}

		const value = VALUES.find((v) => v.key === item.data);
		if (value) {
			item.documentation = buildValueDocs(value);
		}

		return item;
	});
}

export function buildValueDocs(val: TagValue): string {
	return `
${val.key}: ${val.type}
`;
}

export function buildFunctionDocs(fn: TagFunction): string {
	return `
${fn.name}(${fn.arguments.join(', ')}): ${fn.returnValue}

${fn.description}

Examples: 
${fn.examples?.join('\n') ?? 'None'}

`;
}
