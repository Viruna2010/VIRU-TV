const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Pro Engine Active! 💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // බණ වෙලාවන් (7-8 PM, 12-8 AM, 1-2 PM, 6-7 PM)
    if ((hour >= 19 && hour < 20) || (hour >= 0 && hour < 8) || (hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }
    return { type: 'local', path: 'Music' }; 
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    // FFmpeg Settings for 16:9 Aspect Ratio and Keyframes
    const baseFFmpeg = `ffmpeg -re`;
    // සයිස් එක 1280:720 කරලා 16:9 වලට හදනවා
    const videoScale = `scale=1280:720,setdar=16/9`;
    // ලෝගෝ එකේ සුදු බැක්ග්‍රවුන්ඩ් එක අයින් කරලා දකුණු පැත්තේ උඩටම දානවා (W-w-10:10)
    const logoFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=150:-1[logo];[0:v]${videoScale}[main];[main][logo]overlay=main_w-overlay_w-10:10`;
    
    const videoParams = `-vcodec libx264 -preset veryfast -b:v 1500k -maxrate 2000k -bufsize 3000k -g 60 -keyint_min 60 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100`;

    if (target.type === 'link') {
        console.log(`[SL Time] Optimized Loop: ${target.path}`);
        cmd = `${baseFFmpeg} -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "${logoFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        if (!fs.existsSync(folderPath)) return setTimeout(startStream, 5000);
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        if (files.length === 0) return setTimeout(startStream, 5000);
        cmd = `${baseFFmpeg} -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "${logoFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
        else console.log("Log: " + data);
    });

    proc.on('close', (code) => {
        console.log(`Stream closed (${code}). Restarting...`);
        setTimeout(startStream, 5000);
    });
};

startStream();
