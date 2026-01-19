/**
 * @file Instagram HD Profile Picture Downloader
 * @module plugins/downloader/instadp
 * @license Apache-2.0
 * @author o3din
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`Need username\nEx: ${usedPrefix + command} o3din`);
    }

    const username = args[0].replace(/^@/, "").replace(/https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

    await global.loading(m, conn);

    try {
        // Using Siputzx API which usually provides stalk data including HD PP
        const res = await fetch(`https://api.siputzx.my.id/api/s/igstalk?username=${username}`);
        if (!res.ok) throw new Error("API request failed");

        const json = await res.json();
        if (!json.status || !json.data) throw new Error("User not found or private");

        const { url_hd_profile_pic, url_profile_pic, fullname, posts, followers, following, bio } = json.data;

        // Prefer HD, fall back to normal
        const pp = url_hd_profile_pic || url_profile_pic;

        if (!pp) throw new Error("No profile picture found");

        const caption = `*Instagram Profile*

• *Name*: ${fullname || username}
• *Username*: @${username}
• *Followers*: ${followers || 0}
• *Following*: ${following || 0}
• *Posts*: ${posts || 0}
• *Bio*: ${bio || "-"}`;

        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: caption
        }, { quoted: m });

    } catch (e) {
        // Fallback to simple image fetch from another source if stalk fails?
        // Let's stick to error reporting for now as Stalk APIs are flaky
        global.logger?.error(e);
        m.reply(`Failed to fetch profile. Make sure the username is correct.`);
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["instadp"];
handler.tags = ["downloader"];
handler.command = /^(instadp|igdp|igp|ppig)$/i;

export default handler;
