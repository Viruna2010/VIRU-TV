const { exec } = require('child_process');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Viru TV: Live Stream Active! 🔴'));
app.listen(process.env.PORT || 3000);

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY; 
const logoPath = "https://i.ibb.co/jk3cgWMC/logo.png"; 

// Garfield ගියාද කියලා බලන ස්විච් එක
let isGarfieldDone = false;

function getSource() {
    const hour = new Date().getHours();
    
    // 00:00 - 07:00 : පිරිත්
    if (hour >= 0 && hour < 7) return "https://www.youtube.com/watch?v=99xfucKXKQo";
    
    // 10:00 - 12:00 : සින්දු Live
    if (hour >= 10 && hour < 12) return "https://www.youtube.com/live/opd7CAQmtzM";
    
    // 15:00 - 18:00 : කාටූන් Time
    if (hour >= 15 && hour < 18) {
        if (!isGarfieldDone) return "https://youtu.be/gbsPl62m3Vw"; // Garfield
        return "https://www.youtube.com/@KDCartoons-dh4mr/videos"; // Channel
    }
    
    // 18:00 - 19:00 : බණ (ලින්ක් එක දාන්න)
    if (hour === 18) return "https://www.youtube.com/live/opd7CAQmtzM";

    // Default: සින්දු
    return "https://www.youtube.com/live/opd7CAQmtzM"; 
}

const startStream = () => {
    const source = getSource();
    console.log(`Current Source: ${source}`);

    // yt-dlp එකෙන් ලින්ක් එක ගන්න කමාන්ඩ් එක (Warnings අයින් කරලා, 360p Force කරලා)
    // Channel එකක් නම් random වීඩියෝ එකක් ගන්නවා
    let ytFlags = "-f 18 -g";
    if (source.includes("KDCartoons")) {
        ytFlags = "-f 18 -g --playlist-random --playlist-items 1-20";
    }

    // මෙන්න වෙනස් කරපු තැන: ./ffmpeg (ඩොට් එක සහ ඉර ඇල ඉර) අනිවාර්යයි
    const cmd = `yt-dlp ${ytFlags} "${source}" | head -n 1 | xargs -I {} ./ffmpeg -re -i {} -i ${logoPath} -filter_complex "[1:v]colorkey=0xFFFFFF:0.1:0.1[logo];[0:v][logo]overlay=W-w-10:10" -c:v libx264 -preset ultrafast -b:v 450k -maxrate 500k -bufsize 1000k -s 480x360 -c:a aac -b:a 96k -ar 44100 -f flv ${streamURL}${streamKey}`;
    
    console.log("Starting Stream Process...");
    
    const proc = exec(cmd);

    // ලොග් බලාගන්න (ඇත්තටම මොකද වෙන්නේ කියලා)
    proc.stdout.on('data', (data) => console.log(data));
    proc.stderr.on('data', (data) => console.log(data));

    proc.on('close', (code) => {
        console.log(`Stream stopped (Exit Code: ${code}). Restarting in 5s...`);
        if (source.includes("gbsPl62m3Vw")) isGarfieldDone = true;
        setTimeout(startStream, 5000);
    });
};

startStream();
