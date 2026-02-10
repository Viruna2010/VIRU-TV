const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: V16.6 Stable (3 Cartoons Slot) is ONLINE! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
let currentProcess = null;
let isAdPlaying = false;

// ================= [ VIRU TV MASTER PLAYLIST ] =================

const PIRYTH = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4"
];

const MORNING_SHOW = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v10.0/I.am.grateful._.Morning.Affirmation._.Jayspot.Productions._.432.Hertz.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v11.0/Laziness.-.Sinhala.Motivational.Video.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v12.0/Sinhala.Motivation.-.Exam.Addiction.Motivation.-.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v13.0/FOCUS._._.Sinhala.Motivational.Video._.Jayspot.mp4"
];

const TRENDING_SONGS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4", 
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v8.0/Trending.Sinhala.Band.Nonstop.Sinhala.Sindu.Best.New.Sinhala.Songs.Collection.Shaa.Beats.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4"
];

// --- උඹේ අලුත් කාටූන් ලිස්ට් එක මෙන්න ---
const CARTOONS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v15.0/Chuttai.Chutti.Sinhala.Cartoon.__.__.The.Disables.__.sinhalacartoon.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v16.0/Dangharawaliga.__.__.Marsupilamiyai.__.sinhalacartoon.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v17/garfield.3.stories.Sinhala.Dubed._._.Garfield.Sinhala.Cartoon.Dubed.Ep-1.mp4"
];

const EVENING_BANA = "https://github.com/Viruna2010/VIRU-TV/releases/download/v14.0/videoplayback.2.mp4";
const NATURE = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

// ================= [ LOGIC FUNCTIONS ] =================

const getSLTime = () => {
    const slTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return { hr: slTime.getHours(), min: slTime.getMinutes() };
};

const getAdNow = () => {
    try {
        const { hr, min } = getSLTime();
        const currentTime = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        if (fs.existsSync('./ads.json')) {
            const adData = JSON.parse(fs.readFileSync('./ads.json', 'utf8'));
            const currentAd = adData.active_ads.find(ad => ad.time === currentTime && ad.status === "on");
            return currentAd ? currentAd.url : null;
        }
    } catch (e) { return null; }
    return null;
};

const startEngine = () => {
    const { hr, min } = getSLTime();
    const adUrl = getAdNow();
    let videoToPlay;

    if (adUrl && !isAdPlaying) {
        console.log(`[${hr}:${min}] 📢 AD BREAK: ${adUrl}`);
        videoToPlay = adUrl;
        isAdPlaying = true;
    } else {
        isAdPlaying = false;
        
        if (hr >= 0 && hr < 8) {
            videoToPlay = (hr < 7 || (hr === 7 && min < 30)) ? PIRYTH[0] : PIRYTH[1];
        } 
        else if (hr >= 8 && hr < 10) {
            videoToPlay = MORNING_SHOW[Math.floor(Math.random() * MORNING_SHOW.length)];
        }
        else if (hr >= 10 && hr < 16) {
            videoToPlay = TRENDING_SONGS[Math.floor(Math.random() * TRENDING_SONGS.length)];
        }
        else if (hr >= 16 && hr < 18) { // හවස 4 - 6 කාටූන් වෙලාව
            console.log("📺 Playing Cartoon...");
            videoToPlay = CARTOONS[Math.floor(Math.random() * CARTOONS.length)];
        }
        else if (hr === 18) {
            videoToPlay = EVENING_BANA;
        }
        else if (hr >= 19 && hr < 22) {
            videoToPlay = TRENDING_SONGS[Math.floor(Math.random() * TRENDING_SONGS.length)];
        }
        else if (hr >= 22 && hr < 23) {
            videoToPlay = NATURE;
        }
        else {
            videoToPlay = DESHABIMANI;
        }
    }

    console.log(`[${hr}:${min}] Playing: ${videoToPlay}`);

    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v 280k -maxrate 320k -bufsize 600k -r 18 -s 640x360 -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);
    
    currentProcess.on('close', (code) => {
        console.log(`Stream closed (${code}). Restarting in 3s...`);
        setTimeout(startEngine, 3000);
    });
};

setInterval(() => {
    const { min } = getSLTime();
    const adUrl = getAdNow();
    if (min === 0 || (adUrl && !isAdPlaying)) {
        if (currentProcess) {
            console.log("Slot Switching...");
            currentProcess.kill('SIGKILL');
        }
    }
}, 30000);

setInterval(() => {
    axios.get('https://viru-tv.onrender.com/').catch(() => {});
}, 600000);

if (streamKey) startEngine();
