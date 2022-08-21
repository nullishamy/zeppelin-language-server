import {
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
} from 'vscode-languageserver';
import { functions, TagFunction } from './functions';
import { app } from './server';

export function init() {
	// This handler provides the initial list of the completion items.
	app.connection.onCompletion(
		(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
			// The pass parameter contains the position of the text document in
			// which code complete got requested. For the example we ignore this
			// info and always provide the same completion items.
			return functions.map(f => {
				return {
					label: f.name,
					kind: CompletionItemKind.Function,
					data: f.name
				}
			})
		}
	);

	// This handler resolves additional information for the item selected in
	// the completion list.
	app.connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
		const fn = functions.find(f => f.name == item.data)

		if (!fn) {
			// This should not happen as we control the data flow, this would indicate a failure
			// in our data or the client, both of which are fatal.
			throw new Error(`could not locate function ${item.data}`)
		}

		item.documentation = buildDocs(fn)

		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	});
}

export function buildDocs(fn: TagFunction): string {
return `
${fn.name}(${fn.arguments.join(', ')}): ${fn.returnValue}

${fn.description}

Examples: 
${fn.examples?.join('\n') ?? 'None'}

`	
}
