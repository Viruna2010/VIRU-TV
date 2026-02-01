const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Branding Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // බණ වෙලාවන් (දැන් රෑ 8 නිසා මේක Music වලට මාරු වෙයි)
    if ((hour >= 0 && hour < 8) || (hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }
    return { type: 'local', path: 'Music' }; 
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    // 1. Video Scaling (16:9 Fix)
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    
    // 2. Logo and Text Branding (Logo clear කරලා යටින් VIRU TV නම දැම්මා)
    // ලෝගෝ එක දකුණේ (main_w-130), නම ලෝගෝ එකට යටින් (main_h/10 + 110)
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];` +
                           `[0:v]${videoFilter}[main];` +
                           `[main][logo]overlay=main_w-overlay_w-15:15,` +
                           `drawtext=text='VIRU TV':fontcolor=gold:fontsize=24:x=w-tw-25:y=125:shadowcolor=black:shadowx=2:shadowy=2`;
    
    // Data Saver Params (Monthly 90GB Target)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 300k -maxrate 400k -bufsize 800k -r 24 -g 48 -keyint_min 48 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    if (target.type === 'link') {
        console.log(`[SL Time] Branding Mode - Link: ${target.path}`);
        cmd = `ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        if (!fs.existsSync(folderPath)) return setTimeout(startStream, 5000);
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        if (files.length === 0) return setTimeout(startStream, 5000);
        
        console.log(`[SL Time] Playing Music: ${files[0]}`);
        cmd = `ffmpeg -re -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
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
