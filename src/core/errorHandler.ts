import ora from 'ora';
import { OpenAI } from 'openai';
import { printBoxedMessage } from '../cli/print';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeError(errorMessage: string, errorNumber: number) {
    const spinner = ora(`Analyzing error #${errorNumber} and fetching suggestion...`).start();
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user', content: `Debug this error: ${errorMessage} and suggest a fix. 
                Include a reference to error #${errorNumber} in the suggestion. 
                Include links to articles or documentation that can help the user understand the error and how to fix it.
                Respond only in markdown format. Do not add any prefix \`\`\` or tailing \`\`\` to the response.
                `
            }],
        });
        const suggestion = response.choices[0].message.content;

        if (!suggestion) {
            spinner.fail(`🚫 No fix found for error #${errorNumber}. Please try again later.`);
            printBoxedMessage(`\n🚫 No fix found for error #${errorNumber}. Please try again later.`, `🚫 Error #${errorNumber}`);
            return;
        }

        await axios.post('http://localhost:3000/api/errors', {
            error: errorMessage,
            suggestion,
        });

        spinner.stop();
        spinner.clear();

        // Generate search links
        const encodedError = encodeURIComponent(errorMessage);
        const googleLink = `https://www.google.com/search?q=${encodedError}`;
        const stackOverflowLink = `https://stackoverflow.com/search?q=${encodedError}`;
        const perplexityLink = `https://www.perplexity.ai/search?q=${encodedError}`;

        // Print the suggestion with links
        printBoxedMessage(
            `${suggestion}\n\n🔗 Reference: Error #${errorNumber}\n\n [Stack Overflow](https://stackoverflow.com/search) | [Google](https://www.google.com/search) | [Perplexity](https://www.perplexity.ai/search)\n\n`,
            
        );
    } catch (error) {
        console.error(`Error communicating with OpenAI for error #${errorNumber}:`, error);
    } finally {
        spinner.clear();
    }
}

export function processErrorQueue(errorQueue: Set<string>, errorCounter: { value: number }) {
    if (errorQueue.size === 0 || errorQueue.size < 0) return;

    const errorsToAnalyze = Array.from(errorQueue);
    errorQueue.clear();

    errorsToAnalyze.forEach(async (errorMessage) => {
        const errorNumber = errorCounter.value++;
        await analyzeError(errorMessage, errorNumber);
    });
}