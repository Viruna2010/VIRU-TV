const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Live & Streaming Now! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// --- Main Assets ---
const BANA_VIDEO = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const MORNING_SHOW = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const NATURE_MUSIC = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

// --- 🎼 SONGS PLAYLIST (සින්දු 3ක ලිස්ට් එක) ---
const SONG_LINKS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4", 
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4" // 3 වැනි සින්දුව (දැන් ප්ලේ වෙන එක)
];

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

    // Shuffle Logic
    const validSongs = SONG_LINKS.filter(link => link.startsWith("http"));
    const randomSong = validSongs[Math.floor(Math.random() * validSongs.length)];

    if (isFirstRun) {
        console.log("[SYSTEM] Deploy Success! Playing the LATEST v7.0 Video First...");
        // මෙන්න මෙතනට අලුත්ම වීඩියෝ ලින්ක් එක දැම්මා
        videoToPlay = "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4"; 
        isFirstRun = false; 
    } else {
        // Daily Schedule
        if (hour >= 0 && hour < 7) videoToPlay = BANA_VIDEO;
        else if (hour >= 7 && hour < 10) videoToPlay = MORNING_SHOW;
        else if (hour >= 10 && hour < 12) videoToPlay = randomSong; 
        else if (hour >= 22 && hour < 23) videoToPlay = NATURE_MUSIC;
        else if (hour >= 23 && hour < 24) videoToPlay = DESHABIMANI; 
        else videoToPlay = NATURE_MUSIC;
    }

    console.log(`[STREAMING] Now Playing: ${videoToPlay}`);

    // High performance ffmpeg command
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 300k -maxrate 350k -bufsize 700k -r 15 -s 640x360 -g 30 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);
    currentProcess.on('close', () => {
        setTimeout(startEngine, 1000); 
    });
};

// Hourly Auto-Switch
setInterval(() => {
    const min = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"})).getMinutes();
    if (min === 0 && currentProcess) {
        currentProcess.kill('SIGKILL');
        currentProcess = null;
    }
}, 60000);

if (!streamKey) console.error("STREAM_KEY MISSING!");
else startEngine();
