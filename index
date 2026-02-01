const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: No-Stop Engine Active! 🛡️💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // බණ වෙලාවන්
    if ((hour >= 0 && hour < 8) || (hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }

    // Music ෆෝල්ඩර් එක චෙක් කරමු
    const musicPath = './Music/';
    if (fs.existsSync(musicPath)) {
        const files = fs.readdirSync(musicPath).filter(f => f.endsWith('.mp4'));
        if (files.length > 0) return { type: 'local', path: 'Music' };
    }

    // Music ෆෝල්ඩර් එකේ වීඩියෝ නැත්නම් ආයේ බණ ලින්ක් එකටම යමු (Safe fallback)
    return { type: 'link', path: banaLink };
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];` +
                           `[0:v]${videoFilter}[main];` +
                           `[main][logo]overlay=main_w-overlay_w-15:15,` +
                           `drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    // Video: 200k, Audio: 128k (Stable settings)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    if (target.type === 'link') {
        console.log(`[SL Time] Playing Link: ${target.path}`);
        cmd = `ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        console.log(`[SL Time] Playing Music: ${files[0]}`);
        cmd = `ffmpeg -re -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    proc.on('close', (code) => {
        console.log(`Stream closed (${code}). Restarting...`);
        setTimeout(startStream, 5000);
    });
};

startStream();
