const { exec } = require('child_process');
const express = require('express');
const fs = require('fs'); 
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Optimized 24/7 Live Stream is Active! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
const MEMORY_FILE = '/tmp/tv_state.json'; 

// --- Video Assets (GB Optimized) ---
const PIRYTH_V1 = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const PIRYTH_V2 = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

const SONG_LINKS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4", 
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4"
];

// --- මතකය කියවීම සහ ලිවීම ---
const saveState = (data) => fs.writeFileSync(MEMORY_FILE, JSON.stringify(data));
const getState = () => {
    try {
        return fs.existsSync(MEMORY_FILE) ? JSON.parse(fs.readFileSync(MEMORY_FILE)) : { isFirstRun: true, lastPlayedPirithV1: false };
    } catch (e) {
        return { isFirstRun: true, lastPlayedPirithV1: false };
    }
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
    
    // Shuffle Songs
    const randomSong = SONG_LINKS[Math.floor(Math.random() * SONG_LINKS.length)];

    if (state.isFirstRun) {
        console.log("[SYSTEM] Initializing... Playing v7.0 First.");
        videoToPlay = "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4"; 
        state.isFirstRun = false;
        saveState(state);
    } else {
        // --- Smart Scheduling Logic ---
        if (hour >= 0 && hour < 8) {
            // පිරිත් Sequential Playback (v1 -> v2)
            if (!state.lastPlayedPirithV1) {
                videoToPlay = PIRYTH_V1;
                state.lastPlayedPirithV1 = true;
            } else {
                videoToPlay = PIRYTH_V2;
                state.lastPlayedPirithV1 = false;
            }
            saveState(state);
        } 
        else if (hour >= 10 && hour < 12) videoToPlay = randomSong;
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC;
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI;
        else videoToPlay = NATURE_MUSIC;
    }

    console.log(`[STREAM] Time: ${hour}:00 | Asset: ${videoToPlay}`);

    // GB & Data Optimized FFmpeg Command
    // Bitrate: 300k (Video) + 128k (Audio) = Low Data Usage
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 300k -maxrate 350k -bufsize 600k -r 15 -s 640x360 -g 30 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);
    
    currentProcess.stderr.on('data', (data) => {
        if (data.includes("error")) console.log(`[FFMPEG LOG] ${data}`);
    });

    currentProcess.on('close', (code) => {
        console.log(`[SYSTEM] Stream closed (Code ${code}). Restarting...`);
        setTimeout(startEngine, 1000); 
    });
};

// Auto-Switch hourly (Except during Pirith sequence)
setInterval(() => {
    const hour = getSLTime();
    const min = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"})).getMinutes();
    
    if (min === 0 && currentProcess && (hour < 0 || hour >= 8)) {
        console.log("[SCHEDULER] Switching to next hour program...");
        currentProcess.kill('SIGKILL');
        currentProcess = null;
    }
}, 60000);

if (!streamKey) console.error("FATAL ERROR: STREAM_KEY is not defined!");
else startEngine();
