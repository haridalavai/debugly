"use strict";
// debugly.ts - Main CLI file (Alternative to Nodemon)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const openai_1 = require("openai");
const marked_1 = require("marked");
const marked_terminal_1 = __importDefault(require("marked-terminal"));
const boxen_1 = __importDefault(require("boxen"));
const ora_1 = __importDefault(require("ora"));
const wrap_ansi_1 = __importDefault(require("wrap-ansi"));
const readline_1 = __importDefault(require("readline"));
dotenv_1.default.config();
let errorBuffer = '';
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
marked_1.marked.setOptions({
    // @ts-ignore
    renderer: new marked_terminal_1.default(),
});
let appProcess = null;
const commandSuggestions = {
    npm: ['run dev', 'install', 'start'],
    git: ['commit -m "message"', 'push', 'pull', 'status'],
    ls: ['-l', '-a', '-lh'],
};
const rl = readline_1.default.createInterface({
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
function getSuggestion(input) {
    const [cmd, ...args] = input.split(' ');
    if (commandSuggestions[cmd] && args.length === 0) {
        return commandSuggestions[cmd][0]; // Suggest first available option
    }
    return '';
}
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ No command provided. Usage: debugly <command> [args]');
    process.exit(1);
}
// Function to analyze errors and get fixes from OpenAI
async function analyzeError(errorMessage) {
    const spinner = (0, ora_1.default)('Analyzing error and fetching suggestion...').start();
    try {
        // fixLoading = true;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                    role: 'user', content: `Debug this error: ${errorMessage} and suggest a fix. 
                If there is information about the file or line or line number, include it in the fix. 
                respond only in markdown format.
                Do not add any prefix \`\`\` or tailing \`\`\` to the response.
                `
                }],
        });
        const suggestion = response.choices[0].message.content;
        //         const suggestion = `
        // An h1 header
        // ============
        // Paragraphs are separated by a blank line.
        // 2nd paragraph. *Italic*, **bold**, and \`monospace\`. Itemized lists
        // look like:
        //   * this one
        //   * that one
        //   * the other one
        // Note that --- not considering the asterisk --- the actual text
        // content starts at 4-columns in.
        // > Block quotes are
        // > written like so.
        // >
        // > They can span multiple paragraphs,
        // > if you like.
        // Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
        // in chapters 12--14"). Three dots ... will be converted to an ellipsis.
        // Unicode is supported. ☺
        // An h2 header
        // ------------
        // Here's a numbered list:
        //  1. first item
        //  2. second item
        //  3. third item
        // Note again how the actual text starts at 4 columns in (4 characters
        // from the left side). Here's a code sample:
        //     # Let me re-iterate ...
        //     for i in 1 .. 10 { do-something(i) }
        // As you probably guessed, indented 4 spaces. By the way, instead of
        // indenting the block, you can use delimited blocks, if you like:
        // ~~~
        // define foobar() {
        //     print "Welcome to flavor country!";
        // }
        // ~~~
        // (which makes copying & pasting easier). You can optionally mark the
        // delimited block for Pandoc to syntax highlight it:
        // ~~~python
        // import time
        // # Quick, count to ten!
        // for i in range(10):
        //     # (but not *too* quick)
        //     time.sleep(0.5)
        //     print(i)
        // ~~~
        // ### An h3 header ###
        // Now a nested list:
        //  1. First, get these ingredients:
        //       * carrots
        //       * celery
        //       * lentils
        //  2. Boil some water.
        //  3. Dump everything in the pot and follow
        //     this algorithm:
        //         find wooden spoon
        //         uncover pot
        //         stir
        //         cover pot
        //         balance wooden spoon precariously on pot handle
        //         wait 10 minutes
        //         goto first step (or shut off burner when done)
        //     Do not bump wooden spoon or it will fall.
        // Notice again how text always lines up on 4-space indents (including
        // that last line which continues item 3 above).
        // Here's a link to [a website](http://foo.bar), to a [local
        // doc](local-doc.html), and to a [section heading in the current
        // doc](#an-h2-header). Here's a footnote [^1].
        // [^1]: Footnote text goes here.
        // Tables can look like this:
        // size  material      color
        // ----  ------------  ------------
        // 9     leather       brown
        // 10    hemp canvas   natural
        // 11    glass         transparent
        // Table: Shoes, their sizes, and what they're made of
        // (The above is the caption for the table.) Pandoc also supports
        // multi-line tables:
        // --------  -----------------------
        // keyword   text
        // --------  -----------------------
        // red       Sunsets, apples, and
        //           other red or reddish
        //           things.
        // green     Leaves, grass, frogs
        //           and other things it's
        //           not easy being.
        // --------  -----------------------
        // A horizontal rule follows.
        // ***
        // Here's a definition list:
        // apples
        //   : Good for making applesauce.
        // oranges
        //   : Citrus!
        // tomatoes
        //   : There's no "e" in tomatoe.
        // Again, text is indented 4 spaces. (Put a blank line between each
        // term/definition pair to spread things out more.)
        // Here's a "line block":
        // | Line one
        // |   Line too
        // | Line tree
        // and images can be specified like so:
        // ![example image](example-image.jpg "An exemplary image")
        // Inline math equations go in like so: $\omega = d\phi / dt$. Display
        // math should get its own line and be put in in double-dollarsigns:
        // $$I = \int \rho R^{2} dV$$
        // And note that you can backslash-escape any punctuation characters
        // which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.
        // `;
        if (!suggestion) {
            spinner.fail('🚫 No fix found. Please try again later.');
            printBoxedMessage('\n🚫 No fix found. Please try again later.', '🚫 No fix found. Please try again later.');
            return;
        }
        spinner.succeed('💡 Debug Suggestion Received');
        printBoxedMessage(suggestion, '💡 Debugly Suggestion');
        // while (true) {
        //     const { action } = await inquirer.prompt([
        //         {
        //             type: 'list',
        //             name: 'action',
        //             message: 'What would you like to do next?',
        //             choices: [
        //                 { name: '🔍 Search on Google', value: 'search' },
        //                 { name: '📝 Open in VSCode', value: 'vscode' },
        //                 { name: '🔄 Continue debugging', value: 'continue' },
        //                 { name: '❌ Exit Debugly', value: 'exit' },
        //             ],
        //         },
        //     ]);
        //     if (action === 'search') {
        //         await open(`https://www.google.com/search?q=${encodeURIComponent(errorMessage)}`);
        //     } else if (action === 'vscode') {
        //         await open('vscode://file/' + process.cwd());
        //     } else if (action === 'continue') {
        //         console.log('✅ Continuing debugging...\n');
        //         return; // Exit the function, allowing Debugly to keep running
        //     } else if (action === 'exit') {
        //         console.log('👋 Exiting Debugly...');
        //         process.exit(0); // Gracefully exit
        //     }
        // }
        // console.log(suggestion);
    }
    catch (error) {
        console.error('Error communicating with OpenAI:', error);
    }
    finally {
        spinner.clear();
    }
}
// add brain emoji to the title
function printBoxedMessage(message, title = '🧠 Debugly') {
    // // bold the title using chalk
    const boldTitle = chalk_1.default.bold(title);
    // const border = '─'.repeat(title?.length);
    // // // add right border to the title
    // console.log(`\n╭─${border}─╮`);
    // // subtract 2 from the border length for the title
    // const titleLength = title?.length || 0;
    // const titleBorder = '─'.repeat(border.length);
    // // add a link to the file after the title
    // console.log(`│ ${boldTitle} │`);
    // console.log(`├─${border}─╯`);
    const lines = marked_1.marked.parse(message).toString().trim();
    // lines.forEach(line => {
    //     console.log(`│ ${line}`);
    // });
    // console.log(`╰─${border}─`);
    // console.log(boxen(marked.parse(message).toString().trim(), { padding: 1, borderColor: 'yellowBright', borderStyle: 'round', title: title,  }));
    // console.log("--------------------------------")
    // console.log( "| " + marked.parse(message).toString().trim() + " |")
    // console.log("--------------------------------")
    // const formattedText = message
    //   .replace(/```([\s\S]+?)```/g, (match: string, code: string) => {
    //     return `\n${boxen(marked.parse(code).toString().trim(), { padding: 1, borderStyle: 'round', borderColor: 'yellow' })}\n`;
    //   });
    //     const renderedMarkdown = marked.parse(formattedText).toString().trim();
    const wrappedText = (0, wrap_ansi_1.default)(lines, 80, { hard: false });
    const boxedMessage = (0, boxen_1.default)(wrappedText, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: boldTitle,
    });
    console.log(boxedMessage);
}
// Function to start the application and watch for errors
function startApp() {
    if (appProcess) {
        appProcess.kill();
    }
    printBoxedMessage(`🚀 Starting the app with command: ${args.join(' ')}`);
    appProcess = (0, child_process_1.spawn)(args[0], args.slice(1), { shell: true });
    appProcess.stderr?.on('data', async (data) => {
        const errorMessage = data.toString();
        console.error(`\n🚨 Error detected:\n${errorMessage}`);
        // const { shouldDebug } = await inquirer.prompt([
        //     {
        //         type: 'confirm',
        //         name: 'shouldDebug',
        //         message: 'Would you like to debug this error?',
        //         default: true,
        //     },
        // ]);
        // if (shouldDebug) {
        analyzeError(errorMessage);
        // } else {
        //     console.log('Skipping debugging...');
        // }
    });
    appProcess.stdout?.on('data', (data) => {
        printBoxedMessage(data.toString().trim(), '🔄 Debugly Output:');
    });
    appProcess.on('message', (message) => {
        printBoxedMessage(message, '🔄 Debugly Message:');
    });
    appProcess.on('close', (code) => {
        if (errorBuffer.trim().length > 0) {
            printBoxedMessage(`\n🚨 Error detected:\n${errorBuffer}\n`);
            analyzeError(errorBuffer);
        }
        errorBuffer = '';
    });
    appProcess.on('exit', (code) => {
        printBoxedMessage(`\n🔴 Process exited with code: ${code}`);
        // Restart the process after a brief delay
        if (code !== 0) {
            printBoxedMessage('⏳ Waiting for file changes before restarting...');
            appProcess = null;
        }
    });
}
// Add this function to handle process termination
function cleanup() {
    if (appProcess) {
        appProcess.kill();
    }
    process.exit(0);
}
// Handle process termination
process.on('SIGINT', cleanup); // Ctrl+C
process.on('SIGTERM', cleanup); // Kill command
// Watch for file changes and restart the app
// chokidar.watch('.', { ignored: /node_modules|\.git/ }).on('change', (path) => {
//   console.log(`\n🔄 File changed: ${path}`);
//   startApp();
// });
// Initial start
printBoxedMessage('🛠️ Debugly is running and watching for changes...');
startApp();
