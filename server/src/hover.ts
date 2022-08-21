import { Position, TextDocument } from 'vscode-languageserver-textdocument';
import { buildDocs } from './completion';
import { functions } from './functions';
import { app } from './server';

export function init() {
	app.connection.onHover((data) => {
		const document = app.documents.get(data.textDocument.uri);

		// This should never happen, if it does it means our document manager is incorrectly configured
		if (!document) {
			throw new Error(`could not get content for URI ${data.textDocument.uri}`);
		}

		const word = getWordAround(document, data.position)
		const fn = functions.find(f => f.name == word)

		if (!fn) {
			// Fail silently, the hover wasnt valid
			return;
		}

		return {
			contents: buildDocs(fn),
		};
	});
}

const STOP_CHARS = new Set(['(', ')', '{', '}', ' ', ',']);

function getWordAround(document: TextDocument, position: Position): string {
	const line = document.getText({
		start: { line: position.line, character: 0 },
		end: { line: position.line, character: Number.MAX_VALUE },
	});

	let backPos = position.character
	let frontPos = position.character

	for (let idx = position.character; idx >= 0 && !STOP_CHARS.has(line[idx]); idx--) {
		backPos = idx	
	}
		
	for (let idx = position.character; idx < line.length && !STOP_CHARS.has(line[idx]); idx++) {
		frontPos = idx	
	}


	// +1 for exlusive bounds
	return line.substring(backPos, frontPos + 1)
}
