const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Ada Radio & Remix Test is LIVE! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// --- Viru TV Media Inventory ---
const BANA_VIDEO = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const MORNING_SHOW = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";

// අලුත් Remix Collection එක (දවල් 10-12 කාලසටහනටත් මෙය අදාළ වේ)
const SINDU_COLLECTION = "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4";

let currentProcess = null;
let isFirstRun = true; 

const getSLTime = () => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return slTime.getHours();
};

const startEngine = () => {
    let videoToPlay = "";
    const hour = getSLTime();

    // මුලින්ම Deploy කළ සැණින් අලුත් Remix ටික ප්ලේ වේ
    if (isFirstRun) {
        console.log("[TEST-MODE] First Run: Testing New Remix Collection...");
        videoToPlay = SINDU_COLLECTION; 
        isFirstRun = false; 
    } else {
        // --- කාලසටහන (Final Schedule) ---
        if (hour >= 0 && hour < 7) videoToPlay = BANA_VIDEO;
        else if (hour >= 7 && hour < 10) videoToPlay = MORNING_SHOW;
        else if (hour >= 10 && hour < 12) videoToPlay = SINDU_COLLECTION; // දවල් 10-12 Remix
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC;
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI; 
        else videoToPlay = NATURE_MUSIC;
    }

    console.log(`[STREAM] Now Live: ${videoToPlay}`);

    // --- 360p + 128k High Quality Audio Settings ---
    // Video: 300k | Audio: 128k | CPU: Ultrafast
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 300k -maxrate 350k -bufsize 700k -r 15 -s 640x360 -g 30 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    currentProcess.on('close', () => {
        console.log(`\n[SYSTEM] Segment Finished. Switching to next scheduled video...`);
        setTimeout(startEngine, 3000);
    });
};

// Auto-switch hourly
setInterval(() => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    if (slTime.getMinutes() === 0 && currentProcess) {
        console.log(`[AUTO-SWITCH] Switching hour: ${slTime.getHours()}:00`);
        currentProcess.kill('SIGKILL');
        currentProcess = null;
    }
}, 60000);

if (!streamKey) {
    console.error("[CRITICAL] Missing STREAM_KEY Environment Variable!");
} else {
    console.log("[VIRU TV] Low-Data / High-Audio Engine Started.");
    startEngine();
}
