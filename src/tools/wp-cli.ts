import { formatCliFailure, runStudioCli } from '../lib/studio-cli.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerWpCliTools( server: McpServer ) {
	server.registerTool(
		'studio_wp',
		{
			description:
				'Run WP-CLI commands on a Studio site (wraps `studio wp`). Examples: "plugin list", "theme activate flavor", "user list".',
			inputSchema: {
				path: z.string().describe( 'Path to the root directory of a Studio site.' ),
				command: z.string().describe( 'WP-CLI command to run (e.g., "plugin list", "option get siteurl").' ),
			},
		},
		async ( { path, command } ) => {
			const args = [ 'wp', '--path', path, ...command.split( /\s+/ ) ];
	
			const res = await runStudioCli( args );
	
			if ( res.exitCode !== 0 ) {
				return {
					content: [
						{
							type: 'text',
							text: formatCliFailure( 'studio wp', res ),
						},
					],
				};
			}
	
			return {
				content: [
					{
						type: 'text',
						text: res.stdout.trim() || '(no output)',
					},
				],
			};
		}
	);
}
