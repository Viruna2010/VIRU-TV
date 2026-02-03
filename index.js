const { exec } = require('child_process');
const express = require('express');
const app = express();

// Render එකට සර්වර් එක Online කියලා පෙන්වන්න
app.get('/', (req, res) => res.send('Viru TV: GitHub Cloud Stream is LIVE! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// ඔයා ලබාදුන් නිවැරදි GitHub Direct Link එක
const videoUrl = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";

const startStream = () => {
    console.log(`[LOG] Initializing Stream from GitHub Cloud...`);

    // FFmpeg settings: -stream_loop -1 නිසා වීඩියෝ එක සදහටම ලූප් වෙනවා.
    // reconnect flags මගින් ඉන්ටර්නෙට් පොඩ්ඩක් ස්ලෝ වුණත් stream එක කැඩෙන්න නොදී තියාගන්නවා.
    const ffmpegCmd = `ffmpeg -re -stream_loop -1 -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoUrl}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -acodec aac -b:a 128k -f flv "${streamURL}${streamKey}"`;

    const proc = exec(ffmpegCmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) {
            // Logs පිරෙන්නේ නැතිවෙන්න ලොග් එකේ '.' විතරක් පෙන්වනවා
            process.stdout.write("."); 
        }
    });

    proc.on('close', (code) => {
        console.log(`\n[LOG] Stream Process closed (Code: ${code}). Restarting...`);
        setTimeout(startStream, 5000);
    });
};

if (!streamKey) {
    console.error("[CRITICAL ERROR] STREAM_KEY is missing! Please check Render Environment Variables.");
} else {
    console.log("[SYSTEM] Viru TV Engine Started Successfully.");
    startStream();
}
