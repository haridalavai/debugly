import chalk from 'chalk';
import boxen from 'boxen';
import wrapAnsi from 'wrap-ansi';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    // @ts-ignore
    renderer: new TerminalRenderer(),
});

export function printBoxedMessage(message: string, title: string = '🧠 Debugly') {
    const boldTitle = chalk.bold(title);
    const lines = marked.parse(message).toString().trim();
    const wrappedText = wrapAnsi(lines, 80, { hard: false });

    const boxedMessage = boxen(wrappedText, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: boldTitle,
    });

    console.log(boxedMessage);
}