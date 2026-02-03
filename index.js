const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Testing New Content! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// ලින්ක්ස්
const BANA_VIDEO = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";
const MORNING_SHOW = "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4";
const DESHABIMANI_SONGS = "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4";

let currentProcess = null;
let isTesting = true; // මුලින්ම ටෙස්ට් කරන්න ඕන නිසා මේක true කළා

const getSLTime = () => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return slTime.getHours();
};

const startEngine = () => {
    let videoToPlay = "";

    // මුලින්ම ලින්ක් එක ටෙස්ට් කරන්න දුවන කොටස
    if (isTesting) {
        console.log(`[TEST-MODE] Playing New Content to Verify: ${DESHABIMANI_SONGS}`);
        videoToPlay = DESHABIMANI_SONGS;
        isTesting = false; // එක පාරක් ටෙස්ට් වුණාම ආයේ schedule එකට යන්න
    } else {
        const hour = getSLTime();
        if (hour >= 0 && hour < 7) {
            videoToPlay = BANA_VIDEO;
        } else if (hour >= 7 && hour < 10) {
            videoToPlay = MORNING_SHOW;
        } else {
            videoToPlay = DESHABIMANI_SONGS; // වෙනත් වෙලාවලටත් මේකම දුවමු
        }
    }

    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vcodec libx264 -preset ultrafast -b:v 1000k -maxrate 1200k -bufsize 2400k -g 60 -keyint_min 60 -sc_threshold 0 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.stderr.on('data', (data) => {
        if (data.includes("frame=")) process.stdout.write(".");
    });

    currentProcess.on('close', () => {
        console.log(`\n[SYSTEM] Segment finished. Moving to next...`);
        setTimeout(startEngine, 5000);
    });
};

// පැය මාරු වන විට ස්වයංක්‍රීයව මාරු වීම
setInterval(() => {
    const now = new Date();
    const slTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    if (slTime.getMinutes() === 0 && currentProcess) {
        console.log("[AUTO-SWITCH] Changing program for the new hour.");
        currentProcess.kill();
        currentProcess = null;
    }
}, 60000);

if (!streamKey) {
    console.error("[ERROR] No STREAM_KEY!");
} else {
    console.log("[SYSTEM] Viru TV Test Engine Ready.");
    startEngine();
}
