const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Optimized 360p Data Saver! 📉'));
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

    // 360p (640x360) is the best for data saving while keeping 16:9
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    // ලෝගෝ එක 100px කළා පැහැදිලිව පේන්න (scale=100:-1)
    const logoFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-15:15`;
    
    // Bitrate 250k = 100MB per hour (Approx 2.4GB per day)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 250k -maxrate 300k -bufsize 600k -r 24 -g 48 -keyint_min 48 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 48k -ar 44100 -ac 2`;

    if (target.type === 'link') {
        console.log(`[SL Time] Data Saver Mode - Link: ${target.path}`);
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
