import dotenv from 'dotenv';
import path from 'path';

export function loadConfig() {
    dotenv.config({
        path: path.resolve(process.cwd(), '.env'), // Load .env from the project root
    });
}