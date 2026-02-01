const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

// Render එක පණපිටින් තියාගන්න පොඩි Web Server එකක්
app.get('/', (req, res) => res.send('Viru TV: System FFmpeg Engine Active! 📡💎'));
app.listen(process.env.PORT || 3000);

// යූටියුබ් විස්තර (Environment Variables වලින් ගනී)
const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// Catbox බණ වීඩියෝ ලින්ක් එක
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // බණ වෙලාවන් (දැන් වෙලාව හවස 7 නිසා මේක වැඩ කරයි)
    // 19-20 (7-8 PM), 0-8 (12-8 AM), 13-14 (1-2 PM), 18-19 (6-7 PM)
    if ((hour >= 19 && hour < 20) || (hour >= 0 && hour < 8) || (hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }

    // අනෙකුත් වෙලාවන් ෆෝල්ඩර් වලින්
    if (hour >= 8 && hour < 10) return { type: 'local', path: 'Morning' };
    if (hour >= 10 && hour < 12) return { type: 'local', path: 'Music' };
    if ((hour >= 12 && hour < 13) || (hour >= 14 && hour < 15)) return { type: 'local', path: 'Cinema' };
    if (hour >= 15 && hour < 18) return { type: 'local', path: 'Cartoons' };
    
    return { type: 'local', path: 'Music' }; 
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    // පද්ධතියේ (System) තියෙන ffmpeg පාවිච්චි කිරීම
    if (target.type === 'link') {
        console.log(`[SL Time] System Streaming Link: ${target.path}`);
        cmd = `ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -vcodec libx264 -preset ultrafast -b:v 250k -maxrate 300k -bufsize 600k -s 480x360 -acodec aac -b:a 64k -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        if (!fs.existsSync(folderPath)) return setTimeout(startStream, 5000);
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        if (files.length === 0) return setTimeout(startStream, 5000);
        
        console.log(`[SL Time] Playing Folder: ${target.path}/${files[0]}`);
        cmd = `ffmpeg -re -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -vcodec libx264 -preset ultrafast -b:v 250k -maxrate 300k -bufsize 600k -s 480x360 -acodec aac -b:a 64k -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);

    proc.stderr.on('data', (data) => {
        // වැඩ කරනවා නම් තිත් වැටෙයි
        if (data.includes("frame=")) {
            process.stdout.write(".");
        } else {
            console.log("FFmpeg Log: " + data);
        }
    });

    proc.on('close', (code) => {
        console.log(`Stream process closed with code ${code}. Restarting in 5s...`);
        setTimeout(startStream, 5000);
    });
};

startStream();
