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
        let ppUrl = null;
        let userData = null;

        // Method 1: Direct Instagram Web Scraping
        try {
            const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "X-IG-App-ID": "936619743392459",
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json"
                }
            });
            if (res.ok) {
                const json = await res.json();
                const user = json?.data?.user;
                if (user) {
                    ppUrl = user.profile_pic_url_hd || user.profile_pic_url;
                    userData = {
                        fullname: user.full_name,
                        bio: user.biography,
                        followers: user.edge_followed_by?.count,
                        following: user.edge_follow?.count,
                        posts: user.edge_owner_to_timeline_media?.count
                    };
                }
            }
        } catch (e) {
            global.logger?.warn(`InstaDP Method 1: ${e.message}`);
        }

        // Method 2: i.instagram.com API
        if (!ppUrl) {
            try {
                // First get user ID from username
                const searchRes = await fetch(`https://www.instagram.com/web/search/topsearch/?query=${username}`, {
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
                });
                if (searchRes.ok) {
                    const searchJson = await searchRes.json();
                    const foundUser = searchJson?.users?.find(u => u.user?.username?.toLowerCase() === username.toLowerCase());
                    if (foundUser?.user) {
                        ppUrl = foundUser.user.profile_pic_url;
                        userData = {
                            fullname: foundUser.user.full_name,
                            bio: "",
                            followers: 0,
                            following: 0,
                            posts: 0
                        };
                    }
                }
            } catch (e) {
                global.logger?.warn(`InstaDP Method 2: ${e.message}`);
            }
        }

        // Method 3: Third-party API fallback
        if (!ppUrl) {
            const apis = [
                `https://api.siputzx.my.id/api/s/igstalk?username=${username}`,
                `https://api.maher-zubair.tech/instagram/stalk?q=${username}`,
                `https://deliriussapi-oficial.vercel.app/tools/igstalk?q=${username}`
            ];

            for (const apiUrl of apis) {
                try {
                    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
                    if (!res.ok) continue;
                    const json = await res.json();

                    // Try to extract PP from various response formats
                    const data = json.data || json.result || json;
                    if (data) {
                        ppUrl = data.url_hd_profile_pic || data.profile_pic_url_hd ||
                            data.profileHD || data.profile || data.photo_profile ||
                            data.hd_profile_pic_url_info?.url || data.profile_pic_url;
                        if (ppUrl) {
                            userData = {
                                fullname: data.fullname || data.full_name || data.name || username,
                                bio: data.bio || data.biography || "-",
                                followers: data.followers || data.edge_followed_by?.count || 0,
                                following: data.following || 0,
                                posts: data.posts || 0
                            };
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        if (!ppUrl) {
            throw new Error("Could not fetch profile. The account may be private or doesn't exist.");
        }

        const caption = `*Instagram Profile*

• *Name*: ${userData?.fullname || username}
• *Username*: @${username}
• *Followers*: ${userData?.followers || "-"}
• *Following*: ${userData?.following || "-"}
• *Posts*: ${userData?.posts || "-"}
• *Bio*: ${userData?.bio || "-"}`;

        await conn.sendMessage(m.chat, {
            image: { url: ppUrl },
            caption: caption
        }, { quoted: m });

    } catch (e) {
        global.logger?.error(e);
        m.reply(`Error: ${e.message}`);
    } finally {
        await global.loading(m, conn, true);
    }
};

handler.help = ["instadp"];
handler.tags = ["downloader"];
handler.command = /^(instadp|igdp|igp|ppig)$/i;

export default handler;
