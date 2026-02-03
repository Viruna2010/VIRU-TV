const { exec } = require('child_process');
const express = require('express');
const app = express();

// Render එක සක්‍රීයව තබා ගැනීමට පොඩි වෙබ් පිටුවක්
app.get('/', (req, res) => res.send('Viru TV Pro: Streaming Engine is 100% Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// ඔයාගේ GitHub Release එකේ තියෙන වීඩියෝ ලින්ක් එක
const videoUrl = "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4";

const startStream = () => {
    console.log(`[LOG] Starting Optimized Stream with Keyframe Fix...`);

    /**
     * FFmpeg විස්තරය:
     * -re: වීඩියෝ එකේ නියම වේගයෙන්ම stream කිරීම
     * -stream_loop -1: වීඩියෝ එක සදහටම loop කිරීම
     * -g 60: YouTube එක ඉල්ලපු Keyframe frequency එක (2 seconds)
     * -preset ultrafast: Render එකේ CPU භාවිතය අඩු කිරීමට
     */
    const ffmpegCmd = `ffmpeg -re -stream_loop -1 -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoUrl}" -vcodec libx264 -preset ultrafast -b:v 1000k -maxrate 1200k -bufsize 2400k -g 60 -keyint_min 60 -sc_threshold 0 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    const proc = exec(ffmpegCmd);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) {
            process.stdout.write("."); // Stream එක යන බව පෙන්වීමට
        }
    });

    proc.on('close', (code) => {
        console.log(`\n[LOG] Stream Process closed (Code: ${code}). Restarting in 5s...`);
        setTimeout(startStream, 5000);
    });
};

// Error Checking
if (!streamKey) {
    console.error("[CRITICAL] STREAM_KEY missing! Add it in Render Environment Variables.");
} else {
    console.log("[SYSTEM] Viru TV Engine Initialized. Connecting to YouTube...");
    startStream();
}
