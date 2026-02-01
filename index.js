const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Fast Deploy & Anti-Bot Active! 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE;
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // කලින් තිබ්බ වෙලාවල් සහ ලොජික් ඒ විදිහටමයි
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw";
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; 
    }
    if (hour === 18) return "https://www.youtube.com/live/opd7CAQmtzM";
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const day = new Date().getDate();
    
    // Account A/B Logic (වෙනස් කළේ නැත)
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        console.log(`Account ${accountType} on Standby Mode...`);
        return setTimeout(startStream, 60000);
    }

    const source = getSource();
    console.log(`[Account ${accountType}] Streaming: ${source}`);

    // YT-DLP එකේ Bot Error එක නැති කරන්න node runtime එක පාවිච්චි කරනවා
    // සහ cookies.txt එක හරියටම පාවිච්චි කරනවා
    let ytFlags = `--cookies cookies.txt --js-runtime node -f 18 -g`;
    
    if (source.includes("KDCartoons")) {
        ytFlags = `--cookies cookies.txt --js-runtime node -f 18 -g --playlist-random --playlist-items 1-20`;
    }

    // මෙතන ./ffmpeg වෙනුවට ffmpeg (Render එකේ path එකේ තියෙන එක) පාවිච්චි කරමු
    const cmd = `yt-dlp ${ytFlags} "${source}" | head -n 1 | xargs -I {} ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
        else console.log("System Log: " + data);
    });

    proc.on('close', (code) => {
        console.log(`\nStream Process Stopped. Restarting in 5s...`);
        if (source.includes("gbsPl62m3Vw") && code === 0) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
