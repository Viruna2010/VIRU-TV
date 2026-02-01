const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Drive Fix Engine Active! 📡💎'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// මෙන්න මේ ලින්ක් එක මම වෙනස් කළා FFmpeg එකට ලේසි වෙන්න
const primaryVideo = "https://www.googleapis.com/drive/v3/files/1jpYBazllc4TR9yz6GO8M3Sj1VO6kJXyg?alt=media&key=YOUR_API_KEY"; 
// හැබැයි API Key නැතුව කරන ලේසිම විදිහ තමයි මේක:
const directDriveUrl = "https://docs.google.com/uc?export=download&id=1jpYBazllc4TR9yz6GO8M3Sj1VO6kJXyg";

const fallbackVideo = "https://files.catbox.moe/tfnrj1.mp4"; 

const startStream = (videoUrl) => {
    const videoFilter = `scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2,setsar=1`;
    const brandingFilter = `[1:v]colorkey=0xFFFFFF:0.1:0.1,scale=100:-1[logo];[0:v]${videoFilter}[main];[main][logo]overlay=main_w-overlay_w-15:15,drawtext=text='VIRU TV':fontcolor=gold:fontsize=22:x=w-tw-25:y=120:shadowcolor=black:shadowx=2:shadowy=2`;
    
    const videoParams = `-vcodec libx264 -preset ultrafast -b:v 200k -maxrate 250k -bufsize 500k -r 20 -g 40 -keyint_min 40 -sc_threshold 0`;
    const audioParams = `-acodec aac -b:a 128k -ar 44100 -ac 2`;

    console.log(`[SL Time] Attempting: ${videoUrl === directDriveUrl ? "Sutin Martin" : "Fallback Pirith"}`);

    // Google Drive වලට අමතර 'User-Agent' එකක් ඕන වෙන්න පුළුවන්
    const cmd = `ffmpeg -re -stream_loop -1 -user_agent "Mozilla/5.0" -i "${videoUrl}" -i "${logoPath}" -filter_complex "${brandingFilter}" ${videoParams} ${audioParams} -f flv ${streamURL}${streamKey}`;
    
    const proc = exec(cmd);
    proc.stderr.on('data', (data) => { if (data.includes("frame=")) process.stdout.write("."); });

    proc.on('close', (code) => {
        if (code !== 0 && videoUrl === directDriveUrl) {
            console.log(`\n[Error] Drive Link Failed. Switching to Fallback...`);
            setTimeout(() => startStream(fallbackVideo), 5000);
        } else {
            setTimeout(() => startStream(directDriveUrl), 5000);
        }
    });
};

startStream(directDriveUrl);
