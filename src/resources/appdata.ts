import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const APPDATA_PATH = path.join(
	os.homedir(),
	'Library',
	'Application Support',
	'Studio',
	'appdata-v1.json'
);

async function readAppDataRaw(): Promise< string > {
	return await fs.readFile( APPDATA_PATH, { encoding: 'utf8' } );
}

export function registerAppDataResources( server: McpServer ) {
	server.registerResource(
		'studio_appdata',
		'studio://appdata',
		{
			description: 'Read-only Studio app data from appdata-v1.json. Use as fallback when CLI output lacks fields (e.g., wp-theme which is used for specific site).',
			mimeType: 'application/json',
		},
		async ( uri ) => {
			const raw = await readAppDataRaw();
			const appdataJson = JSON.parse( raw );

			const response: Record< string, any > = {
				locale: appdataJson.locale,
				betaFeatures: appdataJson.betaFeatures,
				currentStudioVersion: appdataJson.lastSeenVersion,
			};

			response.sites = appdataJson.sites.map( ( site: any ) => {
				const { adminPassword, ...rest } = site;

				return rest;
			} );

			response.previews = appdataJson.snapshots.map( ( snapshot: any ) => {
				const { adminPassword, ...rest } = snapshot;

				return rest;
			} );

			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify( response, null, 2 ),
					},
				],
			};
		}
	);
}
