import { DidChangeConfigurationNotification } from 'vscode-languageserver';
import { app } from '../server';

export function onInitialized() {
	if (app.clientCapabilities.hasConfigurationCapability) {
		// Register for all configuration changes.
		app.connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
}

app.connection.onInitialized(onInitialized)
