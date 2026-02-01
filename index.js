const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Data Saver Active (90GB/Month Mode) 📉'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    if ((hour >= 19 && hour < 20) || (hour >= 0 && hour < 8) || (hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }
    return { type: 'local', path: 'Music' }; 
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    // 16:9 Aspect Ratio Fix with Black Bars
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const logoFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=80:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-10:10`;
    
    // EXTREME DATA SAVER PARAMS: 200k bitrate
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 32k -ar 22050 -ac 1`;

    if (target.type === 'link') {
        cmd = `ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "${logoFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        if (!fs.existsSync(folderPath)) return setTimeout(startStream, 5000);
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        if (files.length === 0) return setTimeout(startStream, 5000);
        cmd = `ffmpeg -re -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "${logoFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    proc.on('close', (code) => {
        setTimeout(startStream, 5000);
    });
};

startStream();
