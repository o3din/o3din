/**
 * @file Bot Update Command
 * @module plugins/owner/update
 * @license Apache-2.0
 * @author o3din
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Updates the bot from GitHub repository
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @returns {Promise<void>}
 *
 * @description
 * Owner-only command to update the bot from GitHub.
 * Pulls latest changes and optionally restarts the bot.
 */

let handler = async (m, { conn, args }) => {
    const force = args[0] === "force" || args[0] === "-f";

    await m.reply("🔄 *Checking for updates...*");

    try {
        // Fetch latest from origin
        await execAsync("git fetch origin main", { cwd: process.cwd() });

        // Check if updates are available
        const { stdout: status } = await execAsync("git status -uno", { cwd: process.cwd() });

        if (status.includes("Your branch is up to date")) {
            return m.reply("✅ *Bot is already up to date!*");
        }

        await m.reply("📥 *Updates found! Pulling changes...*");

        // Pull changes
        let pullCommand = "git pull origin main";
        if (force) {
            pullCommand = "git reset --hard origin/main";
        }

        const { stdout: pullOutput, stderr: pullError } = await execAsync(pullCommand, { cwd: process.cwd() });

        // Install dependencies if package.json changed
        const changedFiles = pullOutput.toLowerCase();
        if (changedFiles.includes("package.json") || changedFiles.includes("bun.lock")) {
            await m.reply("📦 *Installing new dependencies...*");
            await execAsync("bun install", { cwd: process.cwd() });
        }

        // Get commit info
        const { stdout: commitInfo } = await execAsync("git log -1 --pretty=format:'%h - %s (%cr)'", { cwd: process.cwd() });

        await m.reply(`✅ *Update successful!*

📌 *Latest commit*: ${commitInfo}

⚠️ *Restart the bot to apply changes:*
• Use \`.restart\` command
• Or manually: \`bot restart\``);

    } catch (e) {
        global.logger?.error(e);

        if (e.message.includes("conflict") || e.message.includes("CONFLICT")) {
            return m.reply(`❌ *Update failed - Merge conflict detected*

Try: \`.update force\` to force update (will discard local changes)`);
        }

        m.reply(`❌ *Update failed:* ${e.message}`);
    }
};

handler.help = ["update"];
handler.tags = ["owner"];
handler.command = /^(update|gitpull)$/i;
handler.owner = true;

export default handler;
