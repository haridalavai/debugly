import readline from 'readline';
import { getSuggestion } from './suggestions';

export function setupReadline() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    let currentInput = '';
    let suggestion = '';

    rl.on('line', (input) => {
        currentInput = input.trim();
        suggestion = getSuggestion(currentInput);
        rl.prompt();
    });

    rl.on('keypress', (char, key) => {
        if (key.name === 'right' && suggestion) {
            process.stdout.write(`\r${currentInput} ${suggestion}\n`);
            currentInput += ' ' + suggestion;
            suggestion = '';
        }
        rl.prompt();
    });

    return rl;
}