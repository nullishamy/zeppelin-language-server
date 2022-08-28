import Parser from "tree-sitter";
import { Diagnostic } from "vscode-languageserver";

export interface DiagnosticHandler {
	name: string;
	description: string;

	handle: (ast: Parser.Tree) => Diagnostic[]
}
