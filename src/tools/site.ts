import { readAppData } from '../lib/appdata.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSiteTools( server: McpServer ) {
	server.registerTool(
		'studio_site_list',
		{
			description:
				'List local Studio sites and returns sites name, path on the machine, id, PHP version, etc.',
		},
		async () => {
			const appdata = await readAppData();
			const sites: any[] = Array.isArray( appdata?.sites ) ? appdata.sites : [];
			const sanitizedSites = sites.map( ( site: any ) => {
				const { adminPassword, ...rest } = site;

				return rest;
			} );

			const structuredContent = {
				sites: sanitizedSites,
			};

			return {
				content: [ { type: 'text', text: JSON.stringify( structuredContent, null, 2 ) } ],
				structuredContent,
			};
		}
	);
}
