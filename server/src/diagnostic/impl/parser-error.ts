import { DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { DiagnosticHandler } from '../interface';

const diag: DiagnosticHandler = {
	name: 'parser-error',
	description: 'Emits an error when the parser encounters an error',

	handle: (ast) =>
		ast.rootNode.descendantsOfType(['ERROR']).map((err) => {
			const start = err.startPosition;
			const end = err.endPosition;

			return {
				range: Range.create(
					Position.create(start.row, start.column),
					Position.create(end.row, end.column)
				),
				message: `Parsing error: ${err.text}`,
				severity: DiagnosticSeverity.Error,
			};
		}),
};

export default diag;
