import { spawn, ChildProcess } from 'child_process';
import { printBoxedMessage } from '../cli/print';
import { processErrorQueue } from './errorHandler';

let appProcess: ChildProcess | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

export function startApp(args: string[], errorQueue: Set<string>, errorCounter: { value: number }) {
    if (appProcess) {
        appProcess.kill();
    }

    printBoxedMessage(`🚀 Starting the app with command: ${args.join(' ')}`);

    appProcess = spawn(args[0], args.slice(1), { shell: true });

    appProcess.stderr?.on('data', (data) => {
        const errorMessage = data.toString();
        const errorNumber = errorCounter.value;
        printBoxedMessage(`${errorMessage}`, `🚨 Error #${errorNumber} detected:`);

        errorQueue.add(errorMessage);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            processErrorQueue(errorQueue, errorCounter);
        }, 2000);
    });

    appProcess.stdout?.on('data', (data) => {
        printBoxedMessage(data.toString().trim(), '🔄 Debugly Output:');
    });

    appProcess.on('exit', (code) => {
        printBoxedMessage(`\n🔴 Process exited with code: ${code}`);
        if (code !== 0) {
            printBoxedMessage('⏳ Waiting for file changes before restarting');
            appProcess = null;
        }
    });
}

export function cleanup() {
    if (appProcess) {
        appProcess.kill();
    }
    process.exit(0);
}