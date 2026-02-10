const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.get('/', (req, res) => res.send('Viru TV V19.6: Triple Play Mode (Comedy/Songs/Cartoons) is LIVE! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
let currentProcess = null;
let isAdPlaying = false;

// ප්ලේ වෙච්ච වීඩියෝ මතක තියාගන්න (Shuffle History)
let playedHistory = {
    MORNING: [],
    TRENDING: [],
    CARTOONS: [],
    COMEDY: []
};

// ================= [ VIRU TV MASTER PLAYLIST ] =================

const PLAYLISTS = {
    PIRYTH: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4"
    ],
    MORNING: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v10.0/I.am.grateful._.Morning.Affirmation._.Jayspot.Productions._.432.Hertz.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v11.0/Laziness.-.Sinhala.Motivational.Video.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v12.0/Sinhala.Motivation.-.Exam.Addiction.Motivation.-.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v13.0/FOCUS._._.Sinhala.Motivational.Video._.Jayspot.mp4"
    ],
    TRENDING: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v8.0/Trending.Sinhala.Band.Nonstop.Sinhala.Sindu.Best.New.Sinhala.Songs.Collection.Shaa.Beats.240p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4"
    ],
    CARTOONS: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v15.0/Chuttai.Chutti.Sinhala.Cartoon.__.__.The.Disables.__.sinhalacartoon.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v16.0/Dangharawaliga.__.__.Marsupilamiyai.__.sinhalacartoon.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v17/garfield.3.stories.Sinhala.Dubed._._.Garfield.Sinhala.Cartoon.Dubed.Ep-1.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v18.0/Garfield.Season.2-.7.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v19.0/Sura.Pappa.-.Wada.12.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v20.0/Sutin.Matin.Kung.Fu.Kings.Cartoon.Movie.Full.HD.cartoon.sinhala.derana.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v21.0/tin.tin.singhala.-.sinhala.cartoon.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v22.0/Tintin.and.the.Temple.of.the.Sun.1969._.Sinhala.dubbed._.Full.movie.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v23.0/videoplayback.1.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v24.0/videoplayback.4.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v25.0/-Full.Episode.mp4"
    ],
    COMEDY: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v26.0/1.Hour.Extreme.Try.Not.To.Laughing.Compilation.memecompilation.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v27.0/Noon_Show_2.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v28.0/Noon_Show_3.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v29.0/Noon_Show_4.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v30.0/Noon_Show_5.mp4"
    ],
    BANA: "https://github.com/Viruna2010/VIRU-TV/releases/download/v14.0/videoplayback.2.mp4",
    NATURE: "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4",
    DESHABIMANI: "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4"
};

// ================= [ ENGINE LOGIC ] =================

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

const getNextVideo = (category) => {
    const fullList = PLAYLISTS[category];
    let available = fullList.filter(url => !playedHistory[category].includes(url));
    if (available.length === 0) {
        playedHistory[category] = [];
        available = fullList;
    }
    const selected = available[Math.floor(Math.random() * available.length)];
    playedHistory[category].push(selected);
    return selected;
};

const startEngine = () => {
    const { hr, min } = getSLTime();
    const adUrl = getAdNow();
    let videoToPlay;

    if (adUrl && !isAdPlaying) {
        videoToPlay = adUrl;
        isAdPlaying = true;
    } else {
        isAdPlaying = false;
        
        // --- කාලසටහන ---
        if (hr >= 0 && hr < 8) videoToPlay = (hr < 7 || (hr === 7 && min < 30)) ? PLAYLISTS.PIRYTH[0] : PLAYLISTS.PIRYTH[1];
        else if (hr >= 8 && hr < 10) videoToPlay = getNextVideo('MORNING');
        else if (hr >= 10 && hr < 12) videoToPlay = getNextVideo('TRENDING');
        else if (hr >= 12 && hr < 14) videoToPlay = getNextVideo('COMEDY'); // දවල් 12-2 Comedy Show
        else if (hr >= 14 && hr < 16) videoToPlay = getNextVideo('TRENDING');
        else if (hr >= 16 && hr < 18) videoToPlay = getNextVideo('CARTOONS'); // හවස 4-6 කාටූන්
        else if (hr === 18) videoToPlay = PLAYLISTS.BANA;
        else if (hr >= 19 && hr < 22) videoToPlay = getNextVideo('TRENDING');
        else if (hr >= 22 && hr < 23) videoToPlay = PLAYLISTS.NATURE;
        else videoToPlay = PLAYLISTS.DESHABIMANI;
    }

    console.log(`[${hr}:${min}] 🎬 Playing: ${videoToPlay}`);
    
    // Original Quality Settings
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -tune zerolatency -b:v 280k -maxrate 320k -bufsize 600k -r 18 -s 640x360 -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);
    
    // වීඩියෝ එක ඉවර වුණ සැනින් ඊළඟ එකට යනවා
    currentProcess.on('close', () => {
        setTimeout(startEngine, 1000);
    });
};

// ඇඩ්ස් සහ කාලසටහන් වෙනස්වීම් චෙක් කරන Interval එක
setInterval(() => {
    const { min } = getSLTime();
    const adUrl = getAdNow();
    
    // හැම පැයකම 00 විනාඩියේදී හෝ ඇඩ් එකක් ආවොත් ලයිව් එක ස්විච් කරනවා
    if ((adUrl && !isAdPlaying) || min === 0) {
        console.log("Auto-switching for scheduled program/Ad...");
        if (currentProcess) currentProcess.kill('SIGKILL');
    }
}, 35000);

setInterval(() => { axios.get('https://viru-tv.onrender.com/').catch(() => {}); }, 600000);

if (streamKey) startEngine();
