const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Live & Smart Loop Active! 📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png";

// උඹේ Catbox බණ වීඩියෝ ලින්ක් එක
const banaLink = "https://files.catbox.moe/tfnrj1.mp4";

function getTarget() {
    const slTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
    const hour = slTime.getUTCHours();
    
    // 1. දැන් (හවස 7-8) සහ රෑ (12-8) බණ ලින්ක් එක ප්ලේ කරමු
    if ((hour >= 19 && hour < 20) || (hour >= 0 && hour < 8)) {
        return { type: 'link', path: banaLink };
    }

    // 2. දවල් බණ (1-2 සහ 6-7) - මේවත් ලින්ක් එකටම සෙට් කළා
    if ((hour >= 13 && hour < 14) || (hour >= 18 && hour < 19)) {
        return { type: 'link', path: banaLink };
    }

    // 3. අනිත් වෙලාවන් ෆෝල්ඩර් වලින්
    if (hour >= 8 && hour < 10) return { type: 'local', path: 'Morning' };
    if (hour >= 10 && hour < 12) return { type: 'local', path: 'Music' };
    if ((hour >= 12 && hour < 13) || (hour >= 14 && hour < 15)) return { type: 'local', path: 'Cinema' };
    if (hour >= 15 && hour < 18) return { type: 'local', path: 'Cartoons' };
    
    return { type: 'local', path: 'Music' }; // රෑ 8න් පස්සේ
}

const startStream = () => {
    const target = getTarget();
    let cmd = "";

    if (target.type === 'link') {
        console.log(`[SL Time] Playing Link: ${target.path}`);
        // Link එකක් නිසා -stream_loop -1 දාලා තියෙන්නේ නතර නොවී යන්න
        cmd = `./ffmpeg -re -stream_loop -1 -i "${target.path}" -i "${logoPath}" -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -vcodec libx264 -preset ultrafast -b:v 210k -maxrate 250k -bufsize 500k -s 480x360 -acodec aac -b:a 60k -f flv ${streamURL}${streamKey}`;
    } else {
        const folderPath = `./${target.path}/`;
        if (!fs.existsSync(folderPath)) return setTimeout(startStream, 5000);
        let files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4')).sort();
        if (files.length === 0) return setTimeout(startStream, 5000);

        cmd = `./ffmpeg -re -i "${folderPath}${files[0]}" -i "${logoPath}" -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -vcodec libx264 -preset ultrafast -b:v 210k -maxrate 250k -bufsize 500k -s 480x360 -acodec aac -b:a 60k -f flv ${streamURL}${streamKey}`;
    }

    const proc = exec(cmd);
    proc.stderr.on('data', (data) => { if (data.includes("frame=")) process.stdout.write("."); });
    proc.on('close', () => setTimeout(startStream, 2000));
};

startStream();
