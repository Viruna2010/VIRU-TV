const { exec } = require('child_process');
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const app = express();

app.get('/', (req, res) => res.send('Viru TV Ultimate: Engine Running! 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

const programs = {
    pirith: "DZhT5oOflOw",
    morning: "DZhT5oOflOw",
    songs: "DZhT5oOflOw",
    movie: "DZhT5oOflOw",
    cartoon: "DZhT5oOflOw",
    news: "DZhT5oOflOw",
    music: "DZhT5oOflOw"
};

const startStream = async () => {
    const now = new Date();
    const slTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // වෙලාව අනුව ID එක තෝරනවා
    let videoId = programs.music;
    if (hour >= 0 && hour < 7) videoId = programs.pirith;
    else if (hour >= 7 && hour < 10) videoId = programs.morning;
    else if (hour >= 10 && hour < 12) videoId = programs.songs;
    else if (hour >= 12 && hour < 13) videoId = programs.movie;
    else if (hour >= 13 && hour < 14) videoId = programs.pirith;
    else if (hour >= 14 && hour < 15) videoId = programs.movie;
    else if (hour >= 15 && hour < 18) videoId = programs.cartoon;
    else if (hour >= 18 && hour < 19) videoId = programs.pirith;
    else if (hour >= 19 && hour < 20) videoId = programs.news;

    try {
        console.log(`[LOG] Fetching Video: ${videoId}`);
        
        // YouTube එකෙන් කෙලින්ම stream link එක ගන්නවා (Android client විදිහට)
        const info = await ytdl.getInfo(videoId, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0'
                }
            }
        });

        // 360p වීඩියෝව තෝරාගැනීම
        const format = ytdl.chooseFormat(info.formats, { quality: '18' }); 
        const directUrl = format.url;

        console.log("[SUCCESS] Direct Link Secured. Launching FFmpeg...");

        const filter = `drawtext=text='VIRU TV LIVE':fontcolor=gold:fontsize=24:x=20:y=20,drawtext=text='%{localtime\\:%H\\\\:%M\\\\:%S}':fontcolor=white:fontsize=18:x=20:y=50`;

        const ffmpegCmd = `${ffmpegPath} -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directUrl}" -vf "${filter}" -vcodec libx264 -preset ultrafast -b:v 600k -maxrate 800k -bufsize 1500k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

        const proc = exec(ffmpegCmd);
        proc.stderr.on('data', (data) => { if(data.includes("frame=")) process.stdout.write("."); });

        proc.on('close', (code) => {
            console.log(`\n[LOG] Stream closed. Restarting...`);
            setTimeout(startStream, 5000);
        });

    } catch (error) {
        console.error(`[FATAL ERROR] ${error.message}`);
        setTimeout(startStream, 10000);
    }
};

if (!streamKey) {
    console.error("[ERROR] No STREAM_KEY found!");
} else {
    startStream();
}
