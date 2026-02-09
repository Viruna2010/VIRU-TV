const { exec } = require('child_process');
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: V16 Snapshot Engine is ONLINE! 🚀📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
const NEWS_URL = "https://viru-news-api.vercel.app/api";

let currentProcess = null;
const snapshotPath = path.join(__dirname, 'news.png');

// 1. Screenshot එකක් ගන්න Function එක
const takeSnapshot = async () => {
    console.log("📸 Taking News Snapshot...");
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // පේජ් එකට ගිහින් නිවුස් ටික ලෝඩ් වෙනකම් ඉන්නවා
        await page.goto(NEWS_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 5000)); // ඇනිමේෂන් වලට වෙලාව දෙනවා
        
        await page.screenshot({ path: snapshotPath });
        console.log("✅ Snapshot Updated!");
    } catch (e) {
        console.error("❌ Snapshot Error:", e.message);
    } finally {
        if (browser) await browser.close();
    }
};

// 2. Stream එක පටන් ගන්න Function එක
const startEngine = async () => {
    // පළමු Screenshot එක ගන්නවා
    await takeSnapshot();

    // විනාඩි 5කට සැරයක් නිවුස් අප්ඩේට් කරනවා (Free Plan නිසා කාලය වැඩි කළා)
    setInterval(takeSnapshot, 300000);

    console.log("📡 Starting YouTube Stream...");

    // FFmpeg Logic:
    // පින්තූරය (news.png) Loop කරනවා
    // අර පරණ SoundHelix මියුසික් එක බැක්ග්‍රවුන්ඩ් එකට ගන්නවා
    const ffmpegCmd = `ffmpeg -re -loop 1 -i "${snapshotPath}" -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -b:v 800k -maxrate 1000k -bufsize 2000k -r 25 -g 50 -c:a aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    currentProcess = exec(ffmpegCmd);

    currentProcess.stdout.on('data', (data) => console.log(data));
    currentProcess.stderr.on('data', (data) => console.error(data));

    currentProcess.on('close', (code) => {
        console.log(`⚠️ Stream closed (Code: ${code}). Restarting in 5s...`);
        setTimeout(startEngine, 5000);
    });
};

if (streamKey) {
    startEngine();
} else {
    console.error("❌ Error: STREAM_KEY is missing in Environment Variables!");
}
