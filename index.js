const { exec } = require('child_process');
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Live Now! 📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

const startStream = async () => {
    const videoUrl = "https://www.youtube.com/watch?v=DZhT5oOflOw";
    
    console.log(`[LOG] Getting video link for Viru TV...`);

    try {
        // YouTube එකෙන් Ads නැතුව ලින්ක් එක ගන්න විදිහ
        const info = await ytdl.getInfo(videoUrl);
        const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p (Data ඉතුරු වෙනවා)
        const directLink = format.url;

        console.log("[SUCCESS] Link Received. Starting FFmpeg...");

        // FFmpeg command එක
        const ffmpegCmd = `${ffmpegPath} -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directLink}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

        const proc = exec(ffmpegCmd);

        proc.stderr.on('data', (data) => {
            if (data.includes("frame=")) {
                process.stdout.write("."); // වැඩ කරන බව පෙන්වීමට
            }
        });

        proc.on('close', (code) => {
            console.log(`\n[LOG] Stream ended (${code}). Restarting...`);
            setTimeout(startStream, 5000);
        });

    } catch (err) {
        console.error(`[ERROR] ${err.message}`);
        setTimeout(startStream, 10000);
    }
};

if (!streamKey) {
    console.error("[CRITICAL] NO STREAM_KEY FOUND!");
} else {
    startStream();
}
