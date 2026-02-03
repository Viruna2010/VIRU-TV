const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Global Streaming Active 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

const startStream = () => {
    // මේක තමයි වැදගත්ම දේ: අපි YouTube Proxy එකක් හරහා ලින්ක් එක ගන්නවා
    const videoId = "DZhT5oOflOw";
    const directUrl = `https://invidious.asir.dev/latest_version?id=${videoId}&itag=22`;

    console.log(`[LOG] Connecting to Stream for ID: ${videoId}`);

    // කිසිම module එකක් නැතුව කෙලින්ම FFmpeg විතරක් පාවිච්චි කරනවා
    // Render එකේ FFmpeg නිකන්ම තියෙනවා
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directUrl}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

    const proc = exec(ffmpegCmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) {
            process.stdout.write("."); 
        } else if (data.includes("Error")) {
            console.log("\n[FFmpeg] Status: " + data.trim());
        }
    });

    proc.on('close', (code) => {
        console.log(`\n[LOG] Stream ended. Code: ${code}. Restarting...`);
        setTimeout(startStream, 5000);
    });
};

if (!streamKey) {
    console.error("[CRITICAL] NO STREAM_KEY FOUND IN RENDER!");
} else {
    startStream();
}
