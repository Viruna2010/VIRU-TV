const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: YouTube Live Engine Active! 📺💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// උඹ දීපු සූටින් මාටින් වීඩියෝ ලින්ක් එක
const ytLink = "https://youtu.be/m9TZXiK2Yu4?si=hzyWSgDVMkGqFa_h";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // රෑ 8 සිට උදේ 8 දක්වා යූටියුබ් වීඩියෝ එක ප්ලේ කරනවා
    if (hour >= 20 || hour < 8) {
        return { type: 'youtube', path: ytLink };
    }
    
    return { type: 'link', path: banaLink }; // දවල්ට බණ
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];` +
                           `[0:v]${videoFilter}[main];` +
                           `[main][logo]overlay=main_w-overlay_w-15:15,` +
                           `drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    // ඩේටා බේරගන්න සෙටින්ග්ස් (Monthly 90GB Target)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    if (target.type === 'youtube') {
        console.log(`[SL Time] Extracting & Streaming YT: ${target.path}`);
        // yt-dlp පාවිච්චි කරලා යූටියුබ් එකෙන් කෙලින්ම ස්ට්‍රීම් එක ඇදලා ප්ලේ කරනවා
        cmd = `yt-dlp -f "best[height<=480]" -g "${target.path}" | xargs -I {} ffmpeg -re -i "{}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    } else {
        cmd = `ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);
    proc.stderr.on('data', (data) => { if (data.includes("frame=")) process.stdout.write("."); });
    proc.on('close', (code) => {
        console.log(`Stream closed (${code}). Restarting...`);
        setTimeout(startStream, 5000);
    });
};

startStream();
