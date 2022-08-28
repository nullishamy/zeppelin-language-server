import { DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { VALUES } from '../../const/values';
import { DiagnosticHandler } from '../interface';

const diag: DiagnosticHandler = {
	name: 'unknown-value',
	description: 'Emits an error when an unknown value is evaluated',

	handle: (ast) =>
		ast.rootNode
			.descendantsOfType(['property'])
			.filter((f) => VALUES.find((f2) => f2.key == f.namedChild(0)?.text) === undefined)
			.map((f) => {
				const start = f.startPosition;
				const end = f.endPosition;

				return {
					range: Range.create(
						Position.create(start.row, start.column),
						Position.create(end.row, end.column)
					),
					message: `Could not find value ${f.namedChild(0)?.text}`,
					severity: DiagnosticSeverity.Error,
				};
			}),
};

export default diag;
