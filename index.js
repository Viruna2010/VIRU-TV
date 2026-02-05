const { exec } = require('child_process');
const express = require('express');
const app = express();

// Render එක Active එකේ තියාගන්න උදව් වන වෙබ් පිටුව
app.get('/', (req, res) => res.send('Viru TV Pro: 360p + 128k Audio is Running! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// --- Viru TV Media Inventory ---
const BANA_VIDEO = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const MORNING_SHOW = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";

let currentProcess = null;
let isFirstRun = true; 

// ලංකාවේ වේලාව ලබාගැනීම
const getSLTime = () => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return slTime.getHours();
};

const startEngine = () => {
    let videoToPlay = "";
    const hour = getSLTime();

    // පළමු වරට පණගැන්වීමේදී Nature Music ප්ලේ කරයි
    if (isFirstRun) {
        console.log("[SYSTEM] Starting First Run with Nature Music...");
        videoToPlay = NATURE_MUSIC;
        isFirstRun = false; 
    } else {
        // කාලසටහන (Schedule)
        if (hour >= 0 && hour < 7) videoToPlay = BANA_VIDEO;
        else if (hour >= 7 && hour < 10) videoToPlay = MORNING_SHOW;
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC;
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI; 
        else videoToPlay = NATURE_MUSIC;
    }

    console.log(`[STREAM] Now Playing: ${videoToPlay}`);

    // --- Optimized FFmpeg Settings for 0.1 CPU / 512MB RAM ---
    // -s 640x360 : 360p (ඩේටා ඉතුරුයි, CPU එකට ලෙහෙසියි)
    // -b:v 300k  : වීඩියෝවට හොඳ මට්ටමේ Bitrate එකක්
    // -b:a 128k  : මියුසික් වලට සුපිරි කොලිටියක්
    // -preset ultrafast : CPU භාවිතය අවම කරයි
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 300k -maxrate 350k -bufsize 700k -r 15 -s 640x360 -g 30 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    currentProcess.on('close', (code) => {
        console.log(`\n[SYSTEM] Stream Segment Finished. Reloading in 5s...`);
        setTimeout(startEngine, 5000);
    });
};

// සෑම පැයකම ආරම්භයේදී වීඩියෝව මාරු කිරීම (Auto-Switch)
setInterval(() => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    if (slTime.getMinutes() === 0 && currentProcess) {
        console.log(`[AUTO-SWITCH] Switching to next hour's content...`);
        currentProcess.kill('SIGKILL');
        currentProcess = null;
    }
}, 60000);

if (!streamKey) {
    console.error("[CRITICAL ERROR] STREAM_KEY is missing in Environment Variables!");
} else {
    console.log("[VIRU TV] Engine Initialized. Data-Safe Mode Active.");
    startEngine();
}
