const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV Pro Engine: Online 🚀'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

// කාලසටහන අනුව වීඩියෝ ලින්ක්ස් (දැනට ඔයා දුන්න ලින්ක් එක හැම එකටම දාලා තියෙන්නේ)
const getProgramUrl = () => {
    const now = new Date();
    const slTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    console.log(`[SYSTEM] SL Time: ${hour}:00`);

    // ඔයාට පස්සේ මේ ලින්ක්ස් වෙනස් කරගන්න පුළුවන්
    const testUrl = "https://www.youtube.com/watch?v=DZhT5oOflOw";
    
    return testUrl; 
};

const startStream = () => {
    const videoUrl = getProgramUrl();
    
    console.log(`[LOG] Fetching stream for: ${videoUrl}`);

    // npx හරහා yt-dlp පාවිච්චි කරලා FFmpeg එකට ලින්ක් එක දෙනවා
    // මෙතනදී Render එකේ තියෙන FFmpeg එකම පාවිච්චි වෙනවා
    const command = `npx yt-dlp -f "best[height<=480]" -g ${videoUrl} | xargs -I {} ffmpeg -re -i "{}" -vcodec libx264 -preset ultrafast -b:v 800k -maxrate 1000k -bufsize 2000k -acodec aac -b:a 96k -f flv ${streamURL}${streamKey}`;

    const proc = exec(command);

    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) {
            process.stdout.write("."); // Stream එක දුවන බව පෙන්වීමට
        }
    });

    proc.on('close', (code) => {
        console.log(`\n[LOG] Process exited (${code}). Restarting in 5s...`);
        setTimeout(startStream, 5000);
    });
};

if (!streamKey) {
    console.error("[ERROR] No STREAM_KEY found in Environment Variables!");
} else {
    console.log("[SYSTEM] Viru TV Engine Starting...");
    startStream();
}
