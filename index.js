const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Cookies & A/B Logic Loaded! 🍪📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE; // 'A' or 'B' (Render Env එකෙන්)
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // 00:00 - 07:00 : පිරිත්
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    
    // 10:00 - 12:00 : සින්දු Live
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    
    // 15:00 - 18:00 : කාටූන් Time
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw"; // Garfield
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // Channel
    }
    
    // 18:00 - 19:00 : බණ (බණ ලින්ක් එක නැතිනම් සින්දු එකම යයි)
    if (hour === 18) return "https://www.youtube.com/live/opd7CAQmtzM";

    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    // 1. මුලින්ම බලන්නේ එකවුන්ට් එක වැඩ කරන්න ඕන දවසද කියලා
    const day = new Date().getDate();
    
    // දවස් 1-15: Account A විතරයි වැඩ. Account B නිදාගන්නවා.
    // දවස් 16-31: Account B විතරයි වැඩ. Account A නිදාගන්නවා.
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        console.log(`Account ${accountType} is on Standby Mode (Day: ${day})...`);
        return setTimeout(startStream, 60000); // විනාඩියකින් ආයේ චෙක් කරනවා
    }

    // 2. ඊට පස්සේ වීඩියෝ එක තෝරගන්නවා
    const source = getSource();
    console.log(`Account ${accountType} Starting Source: ${source}`);

    let ytFlags = "-f 18 -g";
    if (source.includes("KDCartoons")) {
        ytFlags = "-f 18 -g --playlist-random --playlist-items 1-20";
    }

    // 3. Cookies පාවිච්චි කරලා ස්ට්‍රීම් කරනවා
    const cmd = `yt-dlp --cookies cookies.txt ${ytFlags} "${source}" | head -n 1 | xargs -I {} ./ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);

    proc.stdout.on('data', (data) => console.log(data));
    proc.stderr.on('data', (data) => console.log(data));

    proc.on('close', (code) => {
        console.log(`Stream stopped. Restarting in 5s...`);
        if (source.includes("gbsPl62m3Vw") && code === 0) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
