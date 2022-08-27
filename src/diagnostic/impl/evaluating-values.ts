import { DiagnosticSeverity, Position, Range } from 'vscode-languageserver';
import { DiagnosticHandler } from '../interface';

const diag: DiagnosticHandler = {
	name: 'evaluating-values',
	description: 'Emits a warning when only a value is evaluated from an eval-block',

	handle: (ast) =>
		ast.rootNode
			.descendantsOfType(['eval_block'])
			// As blocks can only have one expression, this will work
			// HACK: child 1 because of the curly brace
			// FIXME: use a named child instead
			.filter((b) => b.child(1)?.type === 'string' || b.child(1)?.type === 'number')
			.map((b) => {
				const start = b.startPosition;
				const end = b.endPosition;

				return {
					range: Range.create(
						Position.create(start.row, start.column),
						Position.create(end.row, end.column)
					),
					message: `Evaluating ${b.child(1)?.type}s will not yield a value`,
					severity: DiagnosticSeverity.Warning,
				};
			}),
};

export default diag;
