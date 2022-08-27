import { DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { FUNCTIONS } from '../../const/functions';
import { DiagnosticHandler } from '../interface';

const diag: DiagnosticHandler = {
	name: 'unknown-function',
	description: 'Emits an error when an unknown function call is evaluated',

	handle: (ast) =>
		ast.rootNode
			.descendantsOfType(['fn'])
			.filter((f) => FUNCTIONS.find((f2) => f2.name == f.namedChild(0)?.text) === undefined)
			.map((f) => {
				const start = f.startPosition;
				const end = f.endPosition;

				return {
					range: Range.create(
						Position.create(start.row, start.column),
						Position.create(end.row, end.column)
					),
					message: `Could not find function ${f.namedChild(0)?.text}`,
					severity: DiagnosticSeverity.Error,
				};
			}),
};

export default diag;
