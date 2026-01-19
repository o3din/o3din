/**
 * @file Owner/creator information command handler
 * @module plugins/info/owner
 * @license Apache-2.0
 * @author o3din
 */

/**
 * Displays owner/creator contact information as a vCard
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @returns {Promise<void>}
 *
 * @description
 * Command to display the bot owner's contact information in vCard format.
 * Includes personal details, contact information, and social media links.
 *
 * @features
 * - Displays owner contact information as vCard
 * - Includes WhatsApp business profile details
 * - Shows social media links (Instagram)
 * - Contact address and business hours
 * - External advertisement integration
 * - Quoted message with forwarding context
 */

let handler = async (m, { conn }) => {
    const v = `BEGIN:VCARD
VERSION:3.0
N:;o3din;;;
FN:o3din
X-WA-BIZ-NAME:o3din
X-WA-BIZ-DESCRIPTION:o3din Bot Owner
TEL;waid=${global.config.owners?.[0] || "0"}:${global.config.owners?.[0] || "0"}
END:VCARD`;

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "o3din",
                contacts: [{ vcard: v }],
            },
        },
        { quoted: m }
    );
};

/**
 * Command metadata for help system
 * @property {Array<string>} help - Help text
 * @property {Array<string>} tags - Command categories
 * @property {RegExp} command - Command pattern matching
 */
handler.help = ["owner"];
handler.tags = ["info"];
handler.command = /^(owner|creator)$/i;

export default handler;
