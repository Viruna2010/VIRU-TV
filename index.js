const { exec } = require('child_process');
const express = require('express');
const app = express();

// Render සර්වර් එක දිගටම පණගන්වා තැබීමට (Ping purposes)
app.get('/', (req, res) => res.send('Viru TV: Playlist Engine is LIVE! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;

/**
 * PLAYLIST සැකසුම:
 * 1. මුලින්ම ප්ලේ වෙන්නේ පැය බාගයේ වීඩියෝ එකයි (Seth.pirith._._.mp4).
 * 2. දෙවනුව පැය 7 වීඩියෝ එක ප්ලේ වේ.
 */
const playlist = [
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4",
    "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4"
];

let currentIndex = 0;

const startStream = () => {
    const currentVideo = playlist[currentIndex];
    console.log(`\n[LOG] Now Playing Video ${currentIndex + 1} of ${playlist.length}`);
    console.log(`[LOG] File: ${currentVideo}`);

    /**
     * FFmpeg ප්‍රශස්තකරණය:
     * -g 60 සහ -keyint_min 60 මගින් අර Keyframe error එක නැති කරයි.
     * -b:v 1000k මගින් සාමාන්‍ය හොඳ quality එකක් ලබා දෙයි.
     */
    const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${currentVideo}" -vcodec libx264 -preset ultrafast -b:v 1000k -maxrate 1200k -bufsize 2400k -g 60 -keyint_min 60 -sc_threshold 0 -acodec aac -b:a 128k -ar 44100 -f flv "${streamURL}${streamKey}"`;

    const proc = exec(ffmpegCmd);

    // ලොග් එකේ දත්ත පෙන්වීම
    proc.stderr.on('data', (data) => {
        if (data.includes("frame=")) {
            process.stdout.write("."); 
        }
    });

    // වීඩියෝ එකක් අවසන් වූ විට මීළඟ එකට යාම
    proc.on('close', (code) => {
        currentIndex = (currentIndex + 1) % playlist.length;
        console.log(`\n[LOG] Switching to next video in 3 seconds...`);
        setTimeout(startStream, 3000);
    });
};

// පද්ධතිය ආරම්භ කිරීම
if (!streamKey) {
    console.error("[CRITICAL ERROR] STREAM_KEY is not defined in Render Env Variables!");
} else {
    console.log("[SYSTEM] Viru TV Engine Initialized. Starting Playlist...");
    startStream();
}
