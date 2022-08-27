import { app, DEFAULT_SETTINGS } from '../server';

export function onDidClose() {
	app.settings = DEFAULT_SETTINGS;
}

app.documents.onDidClose(onDidClose)
