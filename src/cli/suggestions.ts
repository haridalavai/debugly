const commandSuggestions: Record<string, string[]> = {
    npm: ['run dev', 'install', 'start'],
    git: ['commit -m "message"', 'push', 'pull', 'status'],
    ls: ['-l', '-a', '-lh'],
};

export function getSuggestion(input: string): string {
    const [cmd, ...args] = input.split(' ');
    if (commandSuggestions[cmd] && args.length === 0) {
        return commandSuggestions[cmd][0]; // Suggest first available option
    }
    return '';
}