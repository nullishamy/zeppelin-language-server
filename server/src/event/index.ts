export function init() {
	[
		'onDidChangeConfiguration',
		'onDidChangeContent',
		'onDidClose',
		'onInitialize',
		'onInitialized',
		'onDefinition',
		'onHover',
		'onRenameRequest'
	].forEach(s => import(`./${s}`).catch(console.error))
}
