const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV Pro: Ads Bypassed! 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

const startStream = () => {
    const videoUrl = "https://www.youtube.com/watch?v=DZhT5oOflOw";
    
    console.log(`[LOG] Fetching Clean Stream (No Ads) for: ${videoUrl}`);

    // Ads අයින් කරලා Direct Link එක ගන්න Command එක
    // මෙතන --no-ads සහ player_client=android දාලා තියෙන්නේ Ads වළක්වන්න
    const ytCmd = `npx yt-dlp --no-ads --extractor-args "youtube:player_client=android" -f "best[height<=480]" -g ${videoUrl}`;

    exec(ytCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`[YT-DLP ERROR] ${error.message}`);
            return setTimeout(startStream, 5000);
        }

        const directLink = stdout.trim();
        if (!directLink || directLink.includes("manifest")) {
            console.error(`[ERROR] Direct link invalid or blocked. Retrying...`);
            return setTimeout(startStream, 5000);
        }

        console.log("[SUCCESS] Clean Link found. Starting FFmpeg...");

        // FFmpeg එකට ලින්ක් එක දෙනවා
        const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${directLink}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -acodec aac -b:a 96k -f flv "${streamURL}${streamKey}"`;

        const ffmpegProc = exec(ffmpegCmd);

        ffmpegProc.stderr.on('data', (data) => {
            if (data.includes("frame=")) {
                process.stdout.write("."); 
            }
        });

        ffmpegProc.on('close', (code) => {
            console.log(`\n[LOG] Stream closed (${code}). Restarting...`);
            setTimeout(startStream, 5000);
        });
    });
};

if (!streamKey) {
    console.error("[ERROR] No STREAM_KEY found!");
} else {
    startStream();
}
