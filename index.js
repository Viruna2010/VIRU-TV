const { exec } = require('child_process');
const express = require('express');
const fs = require('fs'); 
const app = express();

app.get('/', (req, res) => res.send('Viru TV: V9 is LIVE and Reconnecting! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
const MEMORY_FILE = '/tmp/tv_state.json'; 

// --- වැඩසටහන් ලින්ක් ---
const PIRYTH_V1 = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const PIRYTH_V2 = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

// --- සින්දු ලිස්ට් එක (දැන් වීඩියෝ 5ක් තියෙනවා) ---
const SONG_LINKS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4", 
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v8.0/Trending.Sinhala.Band.Nonstop.Sinhala.Sindu.Best.New.Sinhala.Songs.Collection.Shaa.Beats.-.Shaa.Beats.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4" // අලුත් v9.0
];

const saveState = (data) => fs.writeFileSync(MEMORY_FILE, JSON.stringify(data));
const getState = () => {
    try {
        return fs.existsSync(MEMORY_FILE) ? JSON.parse(fs.readFileSync(MEMORY_FILE)) : { isFirstRun: true, lastPlayedPirithV1: false };
    } catch (e) { return { isFirstRun: true, lastPlayedPirithV1: false }; }
};

const getSLTime = () => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return slTime.getHours();
};

const startEngine = () => {
    const state = getState();
    let videoToPlay = "";
    const hour = getSLTime();
    const randomSong = SONG_LINKS[Math.floor(Math.random() * SONG_LINKS.length)];

    if (state.isFirstRun) {
        console.log("[SYSTEM] Deploy Success! Playing v9.0 First as requested...");
        // අලුත්ම වීඩියෝ එක (v9.0) මුලින්ම ප්ලේ වෙන්න සෙට් කළා
        videoToPlay = "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4"; 
        state.isFirstRun = false;
        saveState(state);
    } else {
        if (hour >= 0 && hour < 8) {
            if (!state.lastPlayedPirithV1) { videoToPlay = PIRYTH_V1; state.lastPlayedPirithV1 = true; }
            else { videoToPlay = PIRYTH_V2; state.lastPlayedPirithV1 = false; }
            saveState(state);
        } 
        else if (hour >= 10 && hour < 12) videoToPlay = randomSong;
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC;
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI;
        else videoToPlay = NATURE_MUSIC;
    }

    console.log(`[LIVE TV] SL Time: ${hour}:00 | Streaming: ${videoToPlay}`);

    // FFmpeg settings with optimized reconnects to fix "Connection reset"
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 300k -maxrate 350k -bufsize 600k -r 15 -s 640x360 -g 30 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.on('close', (code) => {
        console.log(`[SYSTEM] Connection lost (Code ${code}). Restarting engine...`);
        setTimeout(startEngine, 1000); 
    });
};

setInterval(() => {
    const hour = getSLTime();
    const min = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"})).getMinutes();
    if (min === 0 && currentProcess && (hour < 0 || hour >= 8)) {
        currentProcess.kill('SIGKILL');
        currentProcess = null;
    }
}, 60000);

if (!streamKey) console.error("STREAM_KEY MISSING!");
else startEngine();
