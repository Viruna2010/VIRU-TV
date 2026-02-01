const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: YouTube Engine Fixed! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const ytLink = "https://www.youtube.com/watch?v=m9TZXiK2Yu4";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

const startStream = () => {
    // 16:9 Aspect Ratio and Branding Filter
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-15:15,drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    // Data Saver Settings (Monthly 90GB)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    // YT-DLP පාවිච්චි කරන ලේසිම ක්‍රමය (System FFmpeg එකට Direct Feed කරනවා)
    console.log(`[SL Time] Extracting & Streaming YouTube: ${ytLink}`);
    
    // මෙන්න මේ Command එකෙන් තමයි වැඩේ කරන්නේ
    const cmd = `yt-dlp -f "best[height<=480][ext=mp4]/best[height<=480]" --get-url "${ytLink}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error || !stdout) {
            console.log("Error fetching YT URL. Playing Fallback...");
            const fallbackCmd = `ffmpeg -re -stream_loop -1 -i "${banaLink}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
            runFFmpeg(fallbackCmd);
            return;
        }

        const directUrl = stdout.trim();
        const finalCmd = `ffmpeg -re -i "${directUrl}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
        runFFmpeg(finalCmd);
    });
};

function runFFmpeg(cmd) {
    const proc = exec(cmd);
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
        else if (data.includes("Error")) console.log("FFmpeg Log: " + data);
    });
    proc.on('close', (code) => {
        console.log(`Stream process closed (${code}). Restarting in 5s...`);
        setTimeout(startStream, 5000);
    });
}

startStream();
