/**
 * @file Bot Restart Command
 * @module plugins/owner/restart
 * @license Apache-2.0
 * @author o3din
 */

import { exec } from "child_process";

/**
 * Restarts the bot process
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @returns {Promise<void>}
 */

let handler = async (m, { conn }) => {
    await m.reply("🔄 *Restarting bot...*\n\n_The bot will be back online shortly._");

    // Give time for the message to be sent
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        // Method 1: Try systemctl restart (for systemd service)
        exec("systemctl restart o3din", (error) => {
            if (error) {
                // Method 2: If systemctl fails, exit process (pm2/supervisor will restart)
                process.exit(0);
            }
        });

        // Fallback: Exit after a delay if systemctl doesn't work
        setTimeout(() => {
            process.exit(0);
        }, 2000);

    } catch (e) {
        // Last resort: just exit
        process.exit(0);
    }
};

handler.help = ["restart"];
handler.tags = ["owner"];
handler.command = /^(restart|reboot)$/i;
handler.owner = true;

export default handler;
