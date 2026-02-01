const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Garfield First Mode Active! 🐈‍⬛📡'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const accountType = process.env.ACCOUNT_TYPE; // 'A' or 'B'
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; // උඹේ ලෝගෝ එක

// Garfield වීඩියෝ එක ප්ලේ වුණාද කියලා මතක තියාගන්න කෑල්ල
let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // රෑ 12 සිට උදේ 7 : පිරිත්
    if (hour >= 0 && hour < 7) {
        return "https://www.youtube.com/watch?v=99xfucKXKQo";
    }
    
    // උදේ 10 සිට දවල් 12 : සින්දු ලයිව්
    if (hour >= 10 && hour < 12) {
        return "https://www.youtube.com/live/opd7CAQmtzM";
    }
    
    // හවස 3 සිට හවස 6 : කාටූන් වෙලාව
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) {
            console.log("Playing Garfield Special...");
            return "https://youtu.be/gbsPl62m3Vw"; // (1) මුලින්ම මේක
        } else {
            console.log("Garfield finished. Switching to KD Cartoons Channel...");
            return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // (2) ඊට පස්සේ මේක
        }
    }
    
    // හවස 6 සිට 7 : බණ
    if (hour === 18) {
        // බණ ලින්ක් එක නැති නිසා දැනට සින්දු එකම දාමු (නැත්නම් මෙතනට බණ ලින්ක් එක දාන්න)
        return "https://www.youtube.com/live/opd7CAQmtzM"; 
    }

    // දවස පටන් ගන්නකොට (රෑ 12ට කලින්) Garfield මතකය රීසෙට් කරනවා
    if (hour < 15) isGarfieldDone = false;

    // ඉතුරු හැම වෙලාවකම : සින්දු ලයිව්
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const day = new Date().getDate();
    // Account Switching Logic (දවස් 15න් 15ට)
    if ((day <= 15 && accountType !== 'A') || (day > 15 && accountType !== 'B')) {
        console.log(`Account ${accountType} Standing By...`);
        return setTimeout(startStream, 60000);
    }

    const source = getSource();
    
    // yt-dlp Command එක (Channel Mode එකට support කරන විදිහට)
    // --playlist-items 1-20 දාලා තියෙන්නේ චැනල් ලින්ක් එකක් ආවොත් වීඩියෝ 20ක් ගන්න
    const cmd = `yt-dlp -g --playlist-items 1-20 ${source} | xargs -I {} ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    console.log(`Starting stream with source: ${source}`);
    
    const proc = exec(cmd);
    
    proc.on('close', () => {
        console.log("Stream stopped/finished. Restarting...");
        
        // Garfield වීඩියෝ එක ප්ලේ වෙලා ඉවර නම්, අපි කියනවා "හරි ඒක ඉවරයි" කියලා
        if (source.includes("gbsPl62m3Vw")) {
            isGarfieldDone = true;
        }
        
        setTimeout(startStream, 3000); // තත්පර 3කින් ආයේ පටන් ගන්නවා
    });
};

startStream();
