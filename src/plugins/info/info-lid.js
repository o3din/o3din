/**
 * @file LID (Local ID) Finder Command
 * @module plugins/info/lid
 * @license Apache-2.0
 * @author o3din
 */

/**
 * Find the LID of the sender or a tagged user
 * @async
 * @function handler
 * @param {Object} m - Message object
 * @param {Object} conn - Connection object
 * @returns {Promise<void>}
 */

let handler = async (m, { conn }) => {
    try {
        // Get target user - either mentioned, quoted, or sender
        let targetJid = m.sender;
        let targetName = "You";

        // Check for mentioned users
        if (m.mentionedJid?.length > 0) {
            targetJid = m.mentionedJid[0];
            targetName = targetJid.split("@")[0];
        }
        // Check for quoted message
        else if (m.quoted?.sender) {
            targetJid = m.quoted.sender;
            targetName = targetJid.split("@")[0];
        }

        // Get phone number (if available)
        const phoneNumber = targetJid.split("@")[0];

        // Try to resolve LID
        let lid = null;
        if (targetJid.endsWith("@lid")) {
            lid = targetJid.split("@")[0];
        } else if (targetJid.endsWith("@s.whatsapp.net")) {
            try {
                const resolved = await conn.signalRepository?.lidMapping?.getLIDForPN?.(targetJid);
                if (resolved) {
                    lid = resolved.split("@")[0];
                }
            } catch {
                // LID resolution failed
            }
        }

        // Also try to get phone from LID (reverse lookup)
        let resolvedPhone = null;
        if (targetJid.endsWith("@lid")) {
            try {
                const pn = await conn.signalRepository?.lidMapping?.getPNForLID?.(targetJid);
                if (pn) {
                    resolvedPhone = pn.split("@")[0];
                }
            } catch {
                // Phone resolution failed
            }
        }

        // Get bot info
        const botJid = conn.user?.id || "";
        const botLid = conn.user?.lid || "";
        const botPhone = botJid.split(":")[0] || botJid.split("@")[0];

        let result = `*🔍 ID Information*

*Target:* ${targetName}
━━━━━━━━━━━━━━━━━
• *Raw JID:* ${targetJid}
• *Phone:* ${phoneNumber || "-"}
• *LID:* ${lid || "-"}
• *Resolved Phone:* ${resolvedPhone || "-"}

*Bot Info:*
━━━━━━━━━━━━━━━━━
• *Bot JID:* ${botJid}
• *Bot LID:* ${botLid}
• *Bot Phone:* ${botPhone}

_Use LID in OWNERS config for reliable owner matching._`;

        await m.reply(result);

    } catch (e) {
        global.logger?.error(e);
        m.reply(`Error: ${e.message}`);
    }
};

handler.help = ["lid"];
handler.tags = ["info"];
handler.command = /^(lid|myid|getlid|findlid)$/i;

export default handler;
