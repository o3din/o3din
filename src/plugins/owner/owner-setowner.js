/**
 * @file Set Owner Command
 * @module plugins/owner/setowner
 * @license Apache-2.0
 * @author o3din
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Add or remove owners dynamically
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {Array} args - Command arguments
 * @returns {Promise<void>}
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const action = args[0]?.toLowerCase();
    const target = args[1]?.replace(/[^0-9]/g, ""); // Clean phone number

    if (!action || !["add", "remove", "del", "list"].includes(action)) {
        return m.reply(`*Owner Management*

Usage:
• ${usedPrefix}${command} add <number> - Add new owner
• ${usedPrefix}${command} remove <number> - Remove owner
• ${usedPrefix}${command} list - Show all owners

Example:
${usedPrefix}${command} add 916395849750`);
    }

    // List owners
    if (action === "list") {
        const owners = global.config.owner || [];
        if (owners.length === 0) {
            return m.reply("❌ No owners configured");
        }

        let list = "*👑 Current Owners*\n\n";
        owners.forEach((num, i) => {
            list += `${i + 1}. ${num}\n`;
        });
        list += `\n_Total: ${owners.length} owner(s)_`;
        return m.reply(list);
    }

    // Add/Remove requires target number
    if (!target || target.length < 10) {
        return m.reply("❌ Please provide a valid phone number (with country code)");
    }

    const currentOwners = [...(global.config.owner || [])];

    if (action === "add") {
        // Check if already owner
        if (currentOwners.includes(target)) {
            return m.reply(`❌ ${target} is already an owner`);
        }

        // Add to runtime config
        currentOwners.push(target);
        global.config.owner = currentOwners;

        // Update .env file
        try {
            await updateEnvOwners(currentOwners);
            m.reply(`✅ *Owner Added*

• Number: ${target}
• Total Owners: ${currentOwners.length}

_Changes saved to .env_`);
        } catch (e) {
            global.config.owner = currentOwners; // Keep runtime change
            m.reply(`✅ *Owner Added (Runtime Only)*

• Number: ${target}
• Total Owners: ${currentOwners.length}

⚠️ Could not save to .env: ${e.message}`);
        }

    } else if (action === "remove" || action === "del") {
        // Check if exists
        const index = currentOwners.indexOf(target);
        if (index === -1) {
            return m.reply(`❌ ${target} is not an owner`);
        }

        // Remove from runtime config
        currentOwners.splice(index, 1);
        global.config.owner = currentOwners;

        // Update .env file
        try {
            await updateEnvOwners(currentOwners);
            m.reply(`✅ *Owner Removed*

• Number: ${target}
• Remaining Owners: ${currentOwners.length}

_Changes saved to .env_`);
        } catch (e) {
            global.config.owner = currentOwners; // Keep runtime change
            m.reply(`✅ *Owner Removed (Runtime Only)*

• Number: ${target}
• Remaining Owners: ${currentOwners.length}

⚠️ Could not save to .env: ${e.message}`);
        }
    }
};

/**
 * Update OWNERS in .env file
 * @param {Array} owners - Array of owner numbers
 */
async function updateEnvOwners(owners) {
    const envPath = join(process.cwd(), ".env");
    let envContent = "";

    try {
        envContent = readFileSync(envPath, "utf8");
    } catch {
        throw new Error(".env file not found");
    }

    const ownersString = `OWNERS=[${owners.join(",")}]`;

    if (envContent.includes("OWNERS=")) {
        // Replace existing OWNERS line
        envContent = envContent.replace(/OWNERS=.*/g, ownersString);
    } else {
        // Add OWNERS at the end
        envContent += `\n${ownersString}\n`;
    }

    writeFileSync(envPath, envContent, "utf8");
}

handler.help = ["setowner"];
handler.tags = ["owner"];
handler.command = /^(setowner|addowner|delowner)$/i;
handler.owner = true;

export default handler;
