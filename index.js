const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Full System Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE; // 'A' හෝ 'B'
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // (1) පිරිත් වෙලාව: රෑ 12 - උදේ 7
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    
    // (2) සින්දු වෙලාව: උදේ 10 - දවල් 12
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    
    // (3) කාටූන් වෙලාව: හවස 3 - 6 (15:00 - 18:00)
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw"; // මුලින්ම Garfield
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // ඊට පස්සේ Channel එක
    }
    
    // (4) බණ වෙලාව: හවස 6 - 7 (18:00)
    if (hour === 18) return "https://www.youtube.com/live/opd7CAQmtzM"; // බණ ලින්ක් එක ආවම මෙතනට දාන්න

    // (5) ඉතිරි හැම වෙලාවකම: සින්දු Live
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const day = new Date().getDate();
    
    // Account A/B Logic: දින 15න් 15ට මාරු වීම
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        console.log(`Account ${accountType} is on Standby (Day ${day})...`);
        return setTimeout(startStream, 60000);
    }

    const source = getSource();
    console.log(`Account ${accountType} Streaming: ${source}`);

    // yt-dlp එකට Cookies සහ Deno පාවිච්චි කරන්න කියලා අණ දෙනවා
    let ytFlags = `--cookies cookies.txt --js-runtime deno -f 18 -g`;
    if (source.includes("KDCartoons")) {
        ytFlags = `--cookies cookies.txt --js-runtime deno -f 18 -g --playlist-random --playlist-items 1-20`;
    }

    // FFmpeg කමාන්ඩ් එක (Logo එකත් එක්ක)
    const cmd = `yt-dlp ${ytFlags} "${source}" | head -n 1 | xargs -I {} ./ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);

    // ලොග් බලාගන්න
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) console.log(`[Account ${accountType}] Streaming Live...`);
        else console.log("LOG: " + data);
    });

    proc.on('close', (code) => {
        console.log(`Stream ended (Code: ${code}). Restarting...`);
        if (source.includes("gbsPl62m3Vw") && code === 0) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
