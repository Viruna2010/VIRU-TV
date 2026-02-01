const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Stable & Final Mode Active! 📺💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE; // 'A' or 'B'
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // (1) 00:00 - 07:00 : පිරිත්
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    
    // (2) 10:00 - 12:00 : සින්දු Live
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    
    // (3) 15:00 - 18:00 : කාටූන් Time
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw"; // Garfield මුලින්ම
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // ඊට පස්සේ චැනල් එක
    }
    
    // (4) 18:00 - 19:00 : බණ (බණ ලින්ක් එක දානකම් සින්දු යයි)
    if (hour === 18) return "https://www.youtube.com/live/opd7CAQmtzM"; 

    // (5) ඉතිරි හැම වෙලාවකම සින්දු
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const day = new Date().getDate();
    
    // Account A/B Logic: දින 15න් 15ට මාරු වීම
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        console.log(`Account ${accountType} is on Standby (Day: ${day})...`);
        return setTimeout(startStream, 60000);
    }

    const source = getSource();
    console.log(`[Account ${accountType}] Starting Stream: ${source}`);

    // YT-DLP Flags (Cookies සහ Node Runtime සමඟ)
    let ytFlags = `--cookies cookies.txt --js-runtime node -f 18 -g --no-warnings`;
    if (source.includes("KDCartoons")) {
        ytFlags = `--cookies cookies.txt --js-runtime node -f 18 -g --playlist-random --playlist-items 1-20 --no-warnings`;
    }

    // FFmpeg Command ( ./ffmpeg භාවිතා කරයි)
    const cmd = `yt-dlp ${ytFlags} "${source}" | head -n 1 | xargs -I {} ./ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write("."); // Streaming යන බව පෙන්වීමට
        else console.log("System Log: " + data);
    });

    proc.on('close', (code) => {
        console.log(`\nStream Process Ended (Code: ${code}). Restarting in 5s...`);
        // Garfield එක ඉවර වුණාම විතරක් true කරනවා
        if (source.includes("gbsPl62m3Vw") && code === 0) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
