/**
 * @file Carbon code image generator command handler
 * @module plugins/maker/carbon
 * @license Apache-2.0
 * @author o3din
 */

/**
 * Generates stylish carbon code images from text
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @param {Array<string>} args - Command arguments
 * @param {string} usedPrefix - Command prefix used
 * @param {string} command - Command name
 * @returns {Promise<void>}
 *
 * @description
 * Creates beautiful carbon-style code snippet images.
 * Uses NekoLabs Canvas API for image generation.
 *
 * @features
 * - Generates carbon-style code images
 * - Preserves code formatting and syntax
 * - Returns as image message
 * - Simple one-line usage
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const code = args.join(" ");

        if (!code) {
            return m.reply(`Need code\nEx: ${usedPrefix + command} console.log("Hello")`);
        }

        await global.loading(m, conn);

        // Try primary API
        let buf;
        try {
            const url = `https://api.nekolabs.web.id/canvas/carbonify?code=${encodeURIComponent(code)}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error("Primary API failed");
            buf = Buffer.from(await res.arrayBuffer());
        } catch {
            // Fallback API
            const fallbackUrl = `https://carbonnowsh.herokuapp.com/?code=${encodeURIComponent(code)}&theme=dracula&bg=rgba(171,184,195,1)&t=seti&wt=none&l=auto&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false`;
            const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error("All APIs failed");
            buf = Buffer.from(await res.arrayBuffer());
        }

        await conn.sendMessage(
            m.chat,
            { image: buf, caption: "Carbon code snippet" },
            { quoted: m }
        );
    } catch (e) {
        global.logger?.error(e);
        m.reply(`Error: ${e.message}`);
    } finally {
        await global.loading(m, conn, true);
    }
};

/**
 * Command metadata for help system
 * @property {Array<string>} help - Help text
 * @property {Array<string>} tags - Command categories
 * @property {RegExp} command - Command pattern matching
 */
handler.help = ["carbon"];
handler.tags = ["maker"];
handler.command = /^(carbon)$/i;

export default handler;
