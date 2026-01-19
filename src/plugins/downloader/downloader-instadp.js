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
        // Method 1: Siputzx API
        try {
            const res = await fetch(`https://api.siputzx.my.id/api/s/igstalk?username=${username}`);
            if (!res.ok) throw new Error("API 1 failed");

            const json = await res.json();
            if (!json.status || !json.data) throw new Error("User not found");

            const { url_hd_profile_pic, url_profile_pic, fullname, posts, followers, following, bio } = json.data;
            const pp = url_hd_profile_pic || url_profile_pic;

            if (!pp) throw new Error("No PP");

            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption: `*Instagram Profile* (HD)

• *Name*: ${fullname || username}
• *Username*: @${username}
• *Followers*: ${followers || 0}
• *Following*: ${following || 0}
• *Posts*: ${posts || 0}
• *Bio*: ${bio || "-"}`
            }, { quoted: m });
            return;
        } catch (e) {
            global.logger?.warn(`InstaDP Method 1 failed: ${e.message}`);
        }

        // Method 2: NekoLabs API (Fallback)
        try {
            const res = await fetch(`https://api.nekolabs.web.id/api/igstalk?username=${username}`);
            if (!res.ok) throw new Error("API 2 failed");

            const json = await res.json();
            const data = json.result || json.data;
            if (!data) throw new Error("User not found");

            const pp = data.hd_profile_pic_url_info?.url || data.profile_pic_url;

            if (!pp) throw new Error("No PP");

            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption: `*Instagram Profile* (HD)

• *User*: @${username}
• *Name*: ${data.full_name || username}
• *Bio*: ${data.biography || "-"}
• *Followers*: ${data.edge_followed_by?.count || 0}`
            }, { quoted: m });
            return;
        } catch (e) {
            global.logger?.warn(`InstaDP Method 2 failed: ${e.message}`);
        }

        // Method 3: Alyachan API (Last Resort)
        try {
            const res = await fetch(`https://api.alyachan.dev/api/igstalk?user=${username}&apikey=free`);
            if (!res.ok) throw new Error("API 3 failed");
            const json = await res.json();
            if (!json.status) throw new Error("Failed");

            const data = json.data;
            await conn.sendMessage(m.chat, {
                image: { url: data.profileHD || data.profile },
                caption: `*Instagram Profile*

• *User*: @${username}
• *Name*: ${data.fullname}
• *Link*: https://instagram.com/${username}`
            }, { quoted: m });
            return;
        } catch (e) {
            throw new Error("All APIs failed to fetch profile.");
        }

    } catch (e) {
        global.logger?.error(e);
        m.reply(`Failed to fetch profile: ${e.message}`);
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["instadp"];
handler.tags = ["downloader"];
handler.command = /^(instadp|igdp|igp|ppig)$/i;

export default handler;
