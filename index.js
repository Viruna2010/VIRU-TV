const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: V14 News Engine is ONLINE! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
let currentProcess = null;

// ================= [ VIRU TV MASTER PLAYLIST ] =================

// අලුතින්ම හදපු News Page එක (මෙය විනාඩි 30ක් ප්ලේ කිරීමට සැකසූ සුවිශේෂී ලින්ක් එකකි)
const NEWS_LIVE = "https://viru-news-api.vercel.app/api";

// 1. පිරිත් සහ බණ (00:00 - 08:00)
const PIRYTH = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4"
];

// 2. Morning Show (08:00 - 10:00)
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
    let isNews = false;

    // --- පුවත් විකාශය (ඕනෑම වෙලාවක Deploy කළ සැනින් පුවත් විනාඩි 30ක් ප්ලේ වීමට) ---
    // මෙතන logic එක මම හැදුවේ Deploy වුණාම මුලින්ම පුවත් යන්නයි
    videoToPlay = NEWS_LIVE;
    isNews = true;

    // පුවත් ඉවර වුණාම (විනාඩි 30කට පසු) සාමාන්‍ය කාලසටහනට මාරු වීමට logic එක පහතින්
    // (දැනට මෙය Deploy වුණ සැනින් පුවත් විකාශය ආරම්භ කරයි)

    // FFmpeg Command (News Page එක Stream කිරීමට විශේෂිතයි)
    const ffmpegCmd = isNews 
        ? `ffmpeg -re -f lavfi -i anullsrc -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -r 25 -s 1280x720 -g 50 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`
        : `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 400k -maxrate 450k -bufsize 900k -r 20 -s 640x360 -g 40 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    console.log(`VIRU TV: Playing -> ${isNews ? 'LIVE NEWS' : videoToPlay}`);
    
    currentProcess = exec(ffmpegCmd);
    currentProcess.on('close', () => setTimeout(startEngine, 1000));
};

// කාලසටහන අනුව මාරු වීමේ Logic එක
setInterval(() => {
    const { hr, min } = getSLTime();
    // සෑම පැයකම ආරම්භයේදී පරණ වීඩියෝව නවතා අලුත් වීඩියෝවට (හෝ නිවුස් වලට) මාරු වේ
    if (min === 0 || min === 30) { 
        if (currentProcess) currentProcess.kill('SIGKILL');
    }
}, 60000);

if (streamKey) startEngine();
