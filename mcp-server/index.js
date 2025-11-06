import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

class NextjsProjectServer {
  constructor() {
    this.server = new Server(
      {
        name: 'nextjs-project-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'read_project_structure',
            description: 'Read the complete project directory structure',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to read (default: project root)',
                  default: '.'
                }
              }
            }
          },
          {
            name: 'get_package_info',
            description: 'Get package.json information and dependencies',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'analyze_components',
            description: 'Analyze React components in the project',
            inputSchema: {
              type: 'object',
              properties: {
                directory: {
                  type: 'string',
                  description: 'Directory to analyze (default: src/app)',
                  default: 'src/app'
                }
              }
            }
          },
          {
            name: 'get_build_info',
            description: 'Get Next.js build configuration and status',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'read_project_structure':
            return await this.readProjectStructure(args?.path || '.');
          
          case 'get_package_info':
            return await this.getPackageInfo();
          
          case 'analyze_components':
            return await this.analyzeComponents(args?.directory || 'src/app');
          
          case 'get_build_info':
            return await this.getBuildInfo();
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async readProjectStructure(targetPath) {
    const projectRoot = process.cwd();
    const fullPath = path.resolve(projectRoot, targetPath);
    
    try {
      const structure = await this.buildDirectoryTree(fullPath);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(structure, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read project structure: ${error.message}`);
    }
  }

  async buildDirectoryTree(dirPath, depth = 0) {
    if (depth > 3) return { truncated: true }; // Prevent deep recursion
    
    const stats = await fs.stat(dirPath);
    const name = path.basename(dirPath);
    
    if (stats.isFile()) {
      return { name, type: 'file', size: stats.size };
    }
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git directories
      if (name === 'node_modules' || name === '.git' || name === '.next') {
        return { name, type: 'directory', skipped: true };
      }
      
      const children = [];
      try {
        const entries = await fs.readdir(dirPath);
        for (const entry of entries) {
          const childPath = path.join(dirPath, entry);
          children.push(await this.buildDirectoryTree(childPath, depth + 1));
        }
      } catch (error) {
        return { name, type: 'directory', error: error.message };
      }
      
      return { name, type: 'directory', children };
    }
    
    return { name, type: 'unknown' };
  }

  async getPackageInfo() {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      return {
        content: [
          {
            type: 'text',
            text: `# Package Information

## Project Details
- **Name**: ${packageJson.name}
- **Version**: ${packageJson.version}
- **Description**: ${packageJson.description || 'No description'}

## Scripts
${Object.entries(packageJson.scripts || {}).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Dependencies
${Object.entries(packageJson.dependencies || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Dev Dependencies  
${Object.entries(packageJson.devDependencies || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read package.json: ${error.message}`);
    }
  }

  async analyzeComponents(directory) {
    const fullPath = path.resolve(process.cwd(), directory);
    
    try {
      const components = await this.findReactComponents(fullPath);
      
      return {
        content: [
          {
            type: 'text',
            text: `# React Components Analysis

Found ${components.length} component files in ${directory}:

${components.map(comp => `## ${comp.name}
- **Path**: ${comp.path}
- **Type**: ${comp.type}
- **Size**: ${comp.size} bytes
`).join('\n')}
`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to analyze components: ${error.message}`);
    }
  }

  async findReactComponents(dirPath) {
    const components = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively search subdirectories
          components.push(...await this.findReactComponents(fullPath));
        } else if (entry.isFile()) {
          // Check for React component files
          if (entry.name.match(/\.(tsx|jsx|js|ts)$/)) {
            const stats = await fs.stat(fullPath);
            components.push({
              name: entry.name,
              path: fullPath,
              type: entry.name.includes('.tsx') || entry.name.includes('.jsx') ? 'React Component' : 'JavaScript/TypeScript',
              size: stats.size
            });
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be readable
      return [];
    }
    
    return components;
  }

  async getBuildInfo() {
    try {
      const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
      let nextConfig = 'No next.config.ts found';
      
      try {
        nextConfig = await fs.readFile(nextConfigPath, 'utf8');
      } catch {
        // Check for .js version
        try {
          const nextConfigJsPath = path.resolve(process.cwd(), 'next.config.js');
          nextConfig = await fs.readFile(nextConfigJsPath, 'utf8');
        } catch {
          // No config file found
        }
      }
      
      // Check for build output
      const buildPath = path.resolve(process.cwd(), '.next');
      let buildExists = false;
      let buildInfo = 'No build output found';
      
      try {
        await fs.access(buildPath);
        buildExists = true;
        const buildStats = await fs.stat(buildPath);
        buildInfo = `Build directory exists (modified: ${buildStats.mtime.toISOString()})`;
      } catch {
        // Build directory doesn't exist
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `# Next.js Build Information

## Configuration
\`\`\`typescript
${nextConfig}
\`\`\`

## Build Status
- **Build exists**: ${buildExists}
- **Info**: ${buildInfo}

## Framework Version
- Check package.json for Next.js version
`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get build info: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Next.js Project MCP Server running on stdio');
  }
}

const server = new NextjsProjectServer();
server.run().catch(console.error);