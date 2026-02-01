const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Final Stable Mode Active! 📺💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE; // 'A' or 'B'
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // දින 15න් 15ට Account මාරු කරන Logic එක (වෙනස් කළේ නැහැ)
    const day = new Date().getDate();
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        return null; // මේ එකවුන්ට් එක වැඩ කරන වෙලාව නෙවෙයි නම්
    }

    // 00:00 - 07:00 : පිරිත්
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    
    // 10:00 - 12:00 : සින්දු Live
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    
    // 15:00 - 18:00 : කාටූන් වෙලාව
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw"; // Garfield First
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // Then Channel
    }
    
    // 18:00 - 19:00 : බණ පැය (උඹේ බණ ලින්ක් එක මෙතනට දාන්න)
    if (hour === 18) return "https://www.youtube.com/watch?v=YOUR_BANA_LINK"; 

    // ඉතුරු හැම වෙලාවකම සින්දු
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const source = getSource();
    
    if (!source) {
        console.log(`Account ${accountType} is on Standby...`);
        return setTimeout(startStream, 60000);
    }

    console.log(`Starting Stream Source: ${source}`);

    // Stable Streaming Logic (360p Force & Head -n 1)
    let ytDlpCmd = `yt-dlp -f 18 -g "${source}"`;
    if (source.includes("KDCartoons")) {
        ytDlpCmd = `yt-dlp -f 18 -g --playlist-random --playlist-items 1-20 "${source}"`;
    }

    // මෙන්න FFmpeg කමාන්ඩ් එක (Path එකත් එක්කම)
    const cmd = `${ytDlpCmd} | head -n 1 | xargs -I {} ./ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);
    
    // Error Logs බලාගන්න
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) console.log("Streaming Active...");
    });

    proc.on('close', () => {
        if (source.includes("gbsPl62m3Vw")) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
