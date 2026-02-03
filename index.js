const { exec } = require('child_process');
const express = require('express');
const axios = require('axios');
const ffmpegPath = require('ffmpeg-static');
const app = express();

app.get('/', (req, res) => res.send('Viru TV Pro Engine: Online & Stable 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 

// ඔයාගේ Schedule එකට අනුව වීඩියෝ IDs
const programs = {
    pirith: "DZhT5oOflOw",
    morning: "DZhT5oOflOw",
    songs: "DZhT5oOflOw",
    movie: "DZhT5oOflOw",
    cartoon: "DZhT5oOflOw",
    news: "DZhT5oOflOw",
    music: "DZhT5oOflOw"
};

// වඩාත්ම ස්ථාවර Proxy ලැයිස්තුව
const instances = [
    "https://inv.tux.rs",
    "https://invidious.flokinet.to",
    "https://iv.ggtyler.dev",
    "https://invidious.projectsegfau.lt",
    "https://invidious.lunar.icu",
    "https://invidious.sethforprivacy.com"
];

const getProgramByTime = () => {
    const now = new Date();
    const slTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    console.log(`[SYSTEM] Current SL Time: ${hour}:00`);

    if (hour >= 0 && hour < 7) return programs.pirith;
    if (hour >= 7 && hour < 10) return programs.morning;
    if (hour >= 10 && hour < 12) return programs.songs;
    if (hour >= 12 && hour < 13) return programs.movie;
    if (hour >= 13 && hour < 14) return programs.pirith;
    if (hour >= 14 && hour < 15) return programs.movie;
    if (hour >= 15 && hour < 18) return programs.cartoon;
    if (hour >= 18 && hour < 19) return programs.pirith;
    if (hour >= 19 && hour < 20) return programs.news;
    return programs.music;
};

const startStream = async (instanceIdx = 0) => {
    const videoId = getProgramByTime();
    
    try {
        console.log(`[LOG] Connecting to: ${instances[instanceIdx]}`);
        const response = await axios.get(`${instances[instanceIdx]}/api/v1/videos/${videoId}`, { 
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (!response.data || !response.data.formatStreams) {
            throw new Error("No streams available on this instance.");
        }

        // 360p තෝරාගන්නේ Render Data ඉතුරු කරගන්නයි
        const videoData = response.data.formatStreams.find(s => s.quality === "360p") || response.data.formatStreams[0];
        const directUrl = videoData.url;

        console.log("[SUCCESS] Direct URL found. Starting FFmpeg...");

        const filter = `drawtext=text='VIRU TV LIVE':fontcolor=gold:fontsize=24:x=20:y=20,drawtext=text='%{localtime\\:%H\\\\:%M\\\\:%S}':fontcolor=white:fontsize=18:x=20:y=50`;

        // මෙතන Bitrate එක 600k නිසා ඔයාගේ 100GB Bandwidth එක මාසෙම දුවන්න පුළුවන්
        const ffmpegCmd = `${ffmpegPath} -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directUrl}" -vf "${filter}" -vcodec libx264 -preset ultrafast -b:v 600k -maxrate 800k -bufsize 1500k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

        const proc = exec(ffmpegCmd);

        proc.stderr.on('data', (data) => {
            if (data.includes("frame=")) process.stdout.write(".");
        });

        proc.on('close', (code) => {
            console.log(`\n[LOG] FFmpeg closed (Code: ${code}). Restarting...`);
            setTimeout(() => startStream(0), 5000);
        });

    } catch (error) {
        console.error(`[ERROR] Instance ${instanceIdx} failed: ${error.message}`);
        const nextIdx = (instanceIdx + 1) % instances.length;
        console.log(`[RETRY] Switching to Instance ${nextIdx} in 3 seconds...`);
        setTimeout(() => startStream(nextIdx), 3000);
    }
};

if (!streamKey) {
    console.error("[CRITICAL] Please set STREAM_KEY in Render Environment Variables!");
} else {
    startStream();
}
