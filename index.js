const { exec } = require('child_process');
const express = require('express');
const axios = require('axios');
const ffmpegPath = require('ffmpeg-static');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Pro Engine Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// මෙතනට ඔයාගේ YouTube Video IDs ටික ඇතුළත් කරන්න
const programs = {
    pirith: "DZhT5oOflOw",     // ඔයා දුන්න ලින්ක් එක (දැනට හැම තැනටම මේක වැඩ කරයි)
    morning: "DZhT5oOflOw",
    songs: "DZhT5oOflOw",
    movie: "DZhT5oOflOw",
    cartoon: "DZhT5oOflOw",
    news: "DZhT5oOflOw",
    music: "DZhT5oOflOw"
};

const getProgramByTime = () => {
    // ශ්‍රී ලංකාවේ වෙලාව ලබා ගැනීම (UTC + 5:30)
    const now = new Date();
    const slTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();

    console.log(`Current SL Time: ${hour}:00`);

    if (hour >= 0 && hour < 7) return programs.pirith;       // 00:00 - 07:00
    if (hour >= 7 && hour < 10) return programs.morning;    // 07:00 - 10:00
    if (hour >= 10 && hour < 12) return programs.songs;     // 10:00 - 12:00
    if (hour >= 12 && hour < 13) return programs.movie;     // 12:00 - 13:00
    if (hour >= 13 && hour < 14) return programs.pirith;    // 13:00 - 14:00
    if (hour >= 14 && hour < 15) return programs.movie;     // 14:00 - 15:00
    if (hour >= 15 && hour < 18) return programs.cartoon;   // 15:00 - 18:00
    if (hour >= 18 && hour < 19) return programs.pirith;    // 18:00 - 19:00
    if (hour >= 19 && hour < 20) return programs.news;      // 19:00 - 20:00
    return programs.music;                                   // 20:00 - 00:00
};

const startStream = async () => {
    const videoId = getProgramByTime();
    
    try {
        console.log(`Switching to program ID: ${videoId}`);
        // Invidious API එක හරහා බ්ලොක් නොවී වීඩියෝ ලින්ක් එක ලබා ගැනීම
        const response = await axios.get(`https://invidious.sethforprivacy.com/api/v1/videos/${videoId}`);
        const videoData = response.data.formatStreams.find(s => s.quality === "360p") || response.data.formatStreams[0];
        const directUrl = videoData.url;

        // Overlay text එක (VIRU TV සහ වෙලාව)
        const filter = `drawtext=text='VIRU TV LIVE':fontcolor=gold:fontsize=24:x=20:y=20,drawtext=text='%{localtime\\:%H\\\\:%M\\\\:%S}':fontcolor=white:fontsize=18:x=20:y=50`;

        console.log("Starting FFmpeg...");
        const ffmpegCmd = `${ffmpegPath} -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directUrl}" -vf "${filter}" -vcodec libx264 -preset ultrafast -b:v 600k -maxrate 800k -bufsize 1500k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

        const proc = exec(ffmpegCmd);

        proc.stderr.on('data', (data) => {
            if (data.includes("frame=")) process.stdout.write(".");
        });

        proc.on('close', () => {
            console.log("\nProgram time-slot finished or error. Refreshing...");
            setTimeout(startStream, 5000);
        });

    } catch (error) {
        console.error("Link Fetch Error:", error.message);
        setTimeout(startStream, 10000);
    }
};

startStream();
