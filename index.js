const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const ytdl = require('ytdl-core'); // YouTube එකෙන් ලින්ක් එක ගන්න
const app = express();

// Render එක Alive තියාගන්න පොඩි Web Server එකක්
app.get('/', (req, res) => res.send('Viru TV: YouTube Engine is LIVE! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// උඹ දීපු සූටින් මාටින් වීඩියෝ ලින්ක් එක
const ytLink = "https://www.youtube.com/watch?v=m9TZXiK2Yu4";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4"; // මොකක් හරි අවුලක් වුණොත් ප්ලේ වෙන්න

const startStream = async () => {
    // 16:9 Aspect Ratio සහ Branding (Logo + Text)
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];` +
                           `[0:v]${videoFilter}[main];` +
                           `[main][logo]overlay=main_w-overlay_w-15:15,` +
                           `drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    // 90GB Data Saver Settings (Monthly 90GB Target)
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 250k -maxrate 300k -bufsize 600k -r 24 -g 48 -keyint_min 48 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    console.log(`[SL Time] Fetching YouTube Stream URL...`);

    try {
        // ytdl-core එකෙන් වීඩියෝ එකේ ඩිරෙක්ට් URL එක ගන්නවා
        let info = await ytdl.getInfo(ytLink);
        let format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p (MP4)
        
        if (format && format.url) {
            console.log(`[SL Time] Successfully Extracted. Starting Stream...`);
            const finalCmd = `ffmpeg -re -i "${format.url}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
            runFFmpeg(finalCmd);
        } else {
            throw new Error("No suitable format found");
        }
    } catch (e) {
        console.log("YTDL Error: " + e.message + ". Playing Fallback Bana...");
        const fallbackCmd = `ffmpeg -re -stream_loop -1 -i "${banaLink}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
        runFFmpeg(fallbackCmd);
    }
};

function runFFmpeg(cmd) {
    const proc = exec(cmd);

    proc.stderr.on('data', (data) => {
        // වැඩ කරනවා නම් තිත් විතරක් පෙන්වයි
        if (data.includes("frame=")) {
            process.stdout.write(".");
        }
    });

    proc.on('close', (code) => {
        console.log(`\nStream closed (${code}). Restarting in 5s...`);
        setTimeout(startStream, 5000);
    });
}

// මුලින්ම ස්ට්‍රීම් එක පටන් ගමු
startStream();
