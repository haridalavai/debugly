// debugly.ts - Main CLI file (Alternative to Nodemon)

import dotenv from 'dotenv';
dotenv.config();

import { startApp, cleanup } from './core/app';
import { setupReadline } from './cli/readline';
import { startServer } from './web/server'; // Import the server start function

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ No command provided. Usage: debugly <command> [args]');
    process.exit(1);
}

const errorQueue = new Set<string>();
const errorCounter = { value: 1 };

// Start the CLI application
setupReadline();
startApp(args, errorQueue, errorCounter);

// Start the web server
startServer();

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
