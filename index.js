const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Live Start! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// උඹේ වීඩියෝ දෙක මෙන්න
const VIDEOS = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v10.0/I.am.grateful._.Morning.Affirmation._.Jayspot.Productions._.432.Hertz.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v11.0/Laziness.-.Sinhala.Motivational.Video.mp4"
];

const startLive = () => {
    // වීඩියෝ දෙකෙන් එකක් අහඹු ලෙස තෝරා ගනී
    const videoToPlay = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
    
    console.log(`[Viru TV] Starting Live: ${videoToPlay}`);

    // FFmpeg එකෙන් ලයිව් එක දෙනවා (V10 Master Engine Settings)
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 400k -maxrate 450k -bufsize 900k -r 20 -s 640x360 -g 40 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    const process = exec(ffmpegCmd);
    process.on('close', () => {
        console.log("Video finished, restarting...");
        setTimeout(startLive, 1000);
    });
};

if (!streamKey) {
    console.error("STREAM_KEY එක දාලා නැහැ මචං!");
} else {
    startLive();
}
