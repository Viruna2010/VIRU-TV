const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: V13 Final Engine is ONLINE! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
let currentProcess = null;

// ================= [ VIRU TV MASTER PLAYLIST ] =================

// 1. පිරිත් සහ බණ (00:00 - 08:00)
const PIRYTH = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4"
];

// 2. Morning Show (08:00 - 10:00) - හරියටම පැය 2 පිරී ඇත!
const MORNING_SHOW = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v10.0/I.am.grateful._.Morning.Affirmation._.Jayspot.Productions._.432.Hertz.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v11.0/Laziness.-.Sinhala.Motivational.Video.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v12.0/Sinhala.Motivation.-.Exam.Addiction.Motivation.-.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v13.0/FOCUS._._.Sinhala.Motivational.Video._.Jayspot.mp4"
];

// 3. Trending Remix (10:00 - 12:00)
const TRENDING_SONGS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4", 
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v8.0/Trending.Sinhala.Band.Nonstop.Sinhala.Sindu.Best.New.Sinhala.Songs.Collection.Shaa.Beats.-.Shaa.Beats.240p.h264.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4"
];

// 4. අමතර සහ රාත්‍රී කාලසටහන
const NATURE = "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4";
const DESHABIMANI = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

// ===============================================================

const getSLTime = () => {
    const slTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return { hr: slTime.getHours(), min: slTime.getMinutes() };
};

const startEngine = () => {
    const { hr, min } = getSLTime();
    let videoToPlay = NATURE;

    if (hr >= 0 && hr < 8) {
        videoToPlay = (hr < 7 || (hr === 7 && min < 30)) ? PIRYTH[0] : PIRYTH[1];
    } 
    else if (hr >= 8 && hr < 10) {
        videoToPlay = MORNING_SHOW[Math.floor(Math.random() * MORNING_SHOW.length)];
    }
    else if (hr >= 10 && hr < 12) {
        videoToPlay = TRENDING_SONGS[Math.floor(Math.random() * TRENDING_SONGS.length)];
    }
    else if (hr >= 22 && hr < 23) {
        videoToPlay = NATURE;
    }
    else if (hr >= 23 && hr < 24) {
        videoToPlay = DESHABIMANI;
    }
    else {
        videoToPlay = NATURE; // 12:00 - 22:00 දක්වා දැනට ලින්ක් නැත (Nature Music ප්ලේ වේ)
    }

    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 400k -maxrate 450k -bufsize 900k -r 20 -s 640x360 -g 40 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);
    currentProcess.on('close', () => setTimeout(startEngine, 1000));
};

// Auto-restart logic
setInterval(() => {
    const { hr, min } = getSLTime();
    if (min === 0 && [0, 8, 10, 12, 22, 23].includes(hr)) {
        if (currentProcess) currentProcess.kill('SIGKILL');
    }
}, 60000);

if (streamKey) startEngine();
