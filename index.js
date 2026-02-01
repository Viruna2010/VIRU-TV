const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Smart Failover Engine Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// වීඩියෝ දෙකේ ලින්ක්
const primaryVideo = "https://drive.google.com/uc?export=download&id=1jpYBazllc4TR9yz6GO8M3Sj1VO6kJXyg"; // සූටින් මාටින්
const fallbackVideo = "https://files.catbox.moe/tfnrj1.mp4"; // පිරිත් / බණ

const startStream = (videoUrl) => {
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-15:15,drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    console.log(`[SL Time] Trying to stream: ${videoUrl === primaryVideo ? "Sutin Martin" : "Fallback Pirith"}`);

    const cmd = `ffmpeg -re -stream_loop -1 -i "${videoUrl}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    proc.on('close', (code) => {
        // මොකක් හරි අවුලක් වුණොත් (code 0 නෙවෙයි නම්) පිරිත් ප්ලේ කරනවා
        if (code !== 0 && videoUrl === primaryVideo) {
            console.log(`\n[Error] Primary video failed. Switching to Fallback Pirith...`);
            setTimeout(() => startStream(fallbackVideo), 5000);
        } else {
            console.log(`\nStream ended. Restarting Primary...`);
            setTimeout(() => startStream(primaryVideo), 5000);
        }
    });
};

// මුලින්ම සූටින් මාටින් පටන් ගන්නවා
startStream(primaryVideo);
