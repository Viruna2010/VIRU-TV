const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core'); // මෙන්න මේ පේළිය වෙනස් කළා
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Fixed YouTube Engine! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";
const ytLink = "https://www.youtube.com/watch?v=m9TZXiK2Yu4";
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

const startStream = async () => {
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-15:15,drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    console.log(`[SL Time] Attempting to Fetch YouTube Stream (Distube Fix)...`);

    try {
        let info = await ytdl.getInfo(ytLink);
        // යූටියුබ් බ්ලොක් එක අයින් කරන්න මේක දාන්න ඕනේ
        let format = ytdl.chooseFormat(info.formats, { quality: '18' });
        
        if (format && format.url) {
            console.log(`[SL Time] Successfully Extracted YouTube Stream!`);
            const finalCmd = `ffmpeg -re -i "${format.url}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
            runFFmpeg(finalCmd);
        } else {
            throw new Error("Format not found");
        }
    } catch (e) {
        console.log("YTDL Error: " + e.message + ". Playing Fallback...");
        const fallbackCmd = `ffmpeg -re -stream_loop -1 -i "${banaLink}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
        runFFmpeg(fallbackCmd);
    }
};

function runFFmpeg(cmd) {
    const proc = exec(cmd);
    proc.stderr.on('data', (data) => { if (data.includes("frame=")) process.stdout.write("."); });
    proc.on('close', (code) => {
        console.log(`Stream closed (${code}). Restarting...`);
        setTimeout(startStream, 5000);
    });
}

startStream();
