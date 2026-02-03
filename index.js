const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Nature & Music Test is LIVE! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// --- Viru TV Media Inventory ---
const BANA_VIDEO = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const MORNING_SHOW = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";

let currentProcess = null;
let isFirstRun = true; // පටන් ගන්න කොටම අලුත් එක ටෙස්ට් කරන්න

const getSLTime = () => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return slTime.getHours();
};

const startEngine = () => {
    let videoToPlay = "";
    const hour = getSLTime();

    // මුලින්ම ටෙස්ට් කරන අවස්ථාව
    if (isFirstRun) {
        console.log(`[TEST-MODE] Verifying New Link: ${NATURE_MUSIC}`);
        videoToPlay = NATURE_MUSIC;
        isFirstRun = false; 
    } else {
        // කාලසටහන (Final Schedule Logic)
        if (hour >= 0 && hour < 7) videoToPlay = BANA_VIDEO;
        else if (hour >= 7 && hour < 10) videoToPlay = MORNING_SHOW;
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC; // රෑ 10 - 11
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI;  // රෑ 11 - 12
        else videoToPlay = NATURE_MUSIC; // වෙනත් වෙලාවලට Nature එක දුවමු
    }

    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 1000k -maxrate 1200k -bufsize 2400k -g 60 -keyint_min 60 -sc_threshold 0 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    currentProcess.on('close', () => {
        console.log(`\n[SYSTEM] Reloading next segment...`);
        setTimeout(startEngine, 5000);
    });
};

// Auto-Switch every hour
setInterval(() => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    if (slTime.getMinutes() === 0 && currentProcess) {
        console.log(`[AUTO-SWITCH] Switching for hour: ${slTime.getHours()}:00`);
        currentProcess.kill();
        currentProcess = null;
    }
}, 60000);

if (!streamKey) {
    console.error("[ERROR] No STREAM_KEY!");
} else {
    console.log("[SYSTEM] Viru TV Engine with Nature Segment Started.");
    startEngine();
}
