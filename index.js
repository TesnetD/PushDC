import fetch from 'node-fetch';
import readline from 'readline-sync';
import fs from 'fs';
import chalk from 'chalk';
import cfonts from 'cfonts';
    cfonts.say('NT Exhaust', {
      font: 'block',
      align: 'center',
      colors: ['cyan', 'magenta'],
      background: 'black',
      letterSpacing: 1,
      lineHeight: 1,
      space: true,
      maxLength: '0',
    });
    console.log(chalk.green("=== Telegram Channel : NT Exhaust ( @NTExhaust ) ==="));
const channelIds = readline.question("Masukkan ID channel (pisahkan dengan koma untuk banyak channel): ").split(',');

const delay1 = parseInt(readline.question("How many delay(Slowmode): "));
const tokens = fs.readFileSync("token.txt", "utf-8").split('\n').map(token => token.trim());
const getRandomComment = async (channelId, token) => {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const messages = await response.json();
            if (messages.length) {
                let comment = messages[Math.floor(Math.random() * messages.length)].content;
                if (comment.length > 1) {
                    const index = Math.floor(Math.random() * comment.length);
                    comment = comment.slice(0, index) + comment.slice(index + 1);
                }
                return comment;
            }
        } else {
             //console.log(chalk.red(`[✖] Failed to fetch messages from ${channelId}: ${response.status}`));
        }
    } catch (error) {
        console.log(chalk.red(`[✖] Error fetching messages: ${error.message}`));
    }
    return null;
};

const sendMessage = async (channelId, content, token) => {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        
        if (response.ok) {
            console.log(chalk.green(`[✔] Message sent to ${channelId}: ${content}`));
        } else if (response.status === 429) {
            console.log(chalk.yellow(`[⚠] Rate limited! Waiting before retrying...`));
            const retryAfter = (await response.json()).retry_after;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            await sendMessage(channelId, content, token);
        } else {
            // console.log(chalk.red(`[✖] Failed to send message to ${channelId}: ${response.status}`));
        }
    } catch (error) {
        console.log(chalk.red(`[✖] Error sending message: ${error.message}`));
    }
};



(async () => {
    while (true) {
        await Promise.all(tokens.map(async token => {
            for (const channelId of channelIds) {
                const randomComment = await getRandomComment(channelId.trim(), token);
                const messageContent = randomComment
                await sendMessage(channelId.trim(), messageContent, token);
                await new Promise(resolve => setTimeout(resolve, delay1 * 1000));
                // await deleteMessage(channelId.trim(), token);
                // await new Promise(resolve => setTimeout(resolve, waktu2 * 1000));
            }
        }));
    }
})();
