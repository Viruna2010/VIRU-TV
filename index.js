const { exec } = require('child_process');
const express = require('express');
const fs = require('fs'); 
const app = express();

const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Viru TV V56.4: Fully Shuffled Cartoons! 👶📺⚡'));
app.listen(PORT, () => console.log(`Viru TV running on port ${PORT}`));

const streamURL = "rtmp://a.rtmp.youtube.com/live2/";
const streamKey = process.env.STREAM_KEY;
let currentProcess = null;
let currentlyPlayingCategory = ""; 
let isAdPlaying = false;
let isSwitching = false; 
let isStarting = false;

const PLAYLISTS = {
    PIRYTH: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v1.0/Most.Powerful.Seth.Pirith.in.7.hours.-.7.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v2.0/Seth.pirith._._.mp4"
    ],
    DESHABIMANI: "https://github.com/Viruna2010/VIRU-TV/releases/download/v3.0/Uda.Gee._.Sinhala.Morning.Songs.Volume.01._.Sinhala.Song._.SinduManager.mp4",
    NATURE: "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4",
    TRENDING: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v5.0/New.Trending.Sinhala.Remix.Collection.Trending.Sinhala.Songs.PlayList.-.Oshana.Alahakoon.240p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v6.0/videoplayback.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v7.0/YTDown.com_YouTube_Media_C18ClAT_aQ4_002_240p.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v8.0/Trending.Sinhala.Band.Nonstop.Sinhala.Sindu.Best.New.Sinhala.Songs.Collection.Shaa.Beats.240p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v9.0/YTDown.com_YouTube_Media_CB7wj-jy0o0_004_240p.mp4"
    ],
    MORNING: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v10.0/I.am.grateful._.Morning.Affirmation._.Jayspot.Productions._.432.Hertz.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v11.0/Laziness.-.Sinhala.Motivational.Video.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v12.0/Sinhala.Motivation.-.Exam.Addiction.Motivation.-.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v13.0/FOCUS._._.Sinhala.Motivational.Video._.Jayspot.mp4"
    ],
    BANA: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v14.0/videoplayback.2.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v39.0/videoplayback.1.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v40.0/_._.Venerable.Welimada.Saddaseela.Thero.mp4"
    ],
    CARTOONS: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v46.0/Nee-Naw.Nee-Naw.Don.t.Play.with.Fire.+.More.Fire.Truck.Special.Pinkfong.Super.Rescue.Team.-.Pinkfong.Super.Rescue.Team.-.Kids.Songs.Cartoons.360p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v47.0/Nee-Naw.Nee-Naw.Fire.Truck.Songs.for.Kids.Pinkfong.Super.Rescue.Team.-.Pinkfong.Super.Rescue.Team.-.Kids.Songs.Cartoons.360p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v48.0/Hogi.and.Dinosaur.s.Colorful.Bike.Race.Colors.Song.15.min.Compilation.Hogi.Colors.Hogi.Pinkfong.-.Hogi.Pinkfong.-.Learn.Play.360p.h264.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v49.0/Little.Heroes.to.the.Rescue.Song.ver.+.More.Fun.Car.Song.for.kids.Pinkfong.Super.Rescue.Team.-.Pinkfong.Super.Rescue.Team.-.Kids.Songs.Cartoons.360p.h264.mp4"
    ],
    COMEDY: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v26.0/1.Hour.Extreme.Try.Not.To.Laughing.Compilation.memecompilation.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v27.0/1.Hour.Funniest.Animals.2023.Funny.Dog.Videos.Compilation.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v28.0/Funny.Animals.Videos.-.Funny.Pets.Videos.2021.-.Funniest.Animals.Video.Compilation.of.2021.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v29.0/Funny.dog.videos.Funny.dogs.fails.Cute.dogs.Funny.dogs.compilation.Best.dog.vines.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v30.0/ONE.HOUR_.TRY.NOT.TO.LAUGH.CHALLENGE.Funny.Pranks.Videos.and.Scare.Cam.Fails.for.2023.mp4"
    ],
    REVIEWS: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v31.0/Spider.man.2.in.Sinhala.review.full.movie.DOCTOR.OCTOPUS.MineVoice.MAX.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v32.0/videoplayback.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v33.0/_.DEAD.SILENCE._.DEAD.SILENCE.MOVIE.EXPLAINED.IN.SINHALA.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v35.0/full.Movie.review.in.Sinhala._.films.in.Sinhala_.Adventure.Thrilling.Horror.Movie.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v36.0/_.HORROR.MOVIE.SINHALA.REVIEW.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v37.0/_._.English.vinglish._Hiccup.Sinhala.Cinema_.Sinhala.movie.review.mp4"
    ],
    KIDS_SONGS: "https://github.com/Viruna2010/VIRU-TV/releases/download/v38.0/01._.Sinhala.Kids.Songs._.Sinhala.Lama.Geetha.Ekathuwa._.Kids.Song.Collection.mp4",
    INSTRUMENTAL: "https://github.com/Viruna2010/VIRU-TV/releases/download/v4.0/1.Hour.Long.No.Copyright.video.__.Nature.and.music.mp4",
    SPACE: [
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v41.0/Copyright.Free.Video_._Earth.In.Space_.4K.UHD.60fps.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v42.0/videoplayback.5.mp4",
        "https://github.com/Viruna2010/VIRU-TV/releases/download/v43.0/Moon.Stock.Footage._.Full.Moon._.Eclipse._.Night._.Free.HD.Videos.-.no.copyright.mp4"
    ],
    CUBE: "https://github.com/Viruna2010/VIRU-TV/releases/download/v44.0/one.hour.cube.with.me.-.real.time.with.background.music.-.Java.Cuber.360p.h264.mp4"
};

const getSLTime = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const slTime = new Date(utc + (3600000 * 5.5));
    const full = slTime.getHours().toString().padStart(2, '0') + ":" + slTime.getMinutes().toString().padStart(2, '0');
    return { hr: slTime.getHours(), min: slTime.getMinutes(), full: full };
};

const getRequiredCategory = (hr) => {
    if (hr >= 0 && hr < 8) return "PIRYTH";
    if (hr >= 8 && hr < 10) return "MORNING";
    if (hr >= 10 && hr < 12) return "TRENDING";
    if (hr >= 12 && hr < 14) return "COMEDY";
    if (hr === 14) return "REVIEWS";
    if (hr === 15) return "KIDS_SONGS";
    if (hr === 16) return "CARTOONS"; // 4 PM - 5 PM CARTOONS
    if (hr === 17) return "INSTRUMENTAL"; 
    if (hr === 18) return "BANA";
    if (hr === 19) return "TRENDING";
    if (hr === 20) return "SPACE";   // රෑ 8 - 9 SPACE වීඩියෝ ලූපය
    if (hr === 21) return "CUBE";    // රෑ 9 - 10 CUBE SOLVING පැය
    if (hr === 22) return "NATURE";
    if (hr === 23) return "DESHABIMANI";
    return "PIRYTH";
};

const startEngine = (adUrl = null) => {
    if (isStarting) return;
    isStarting = true;

    exec('pkill -9 ffmpeg');

    setTimeout(() => {
        const { hr, min } = getSLTime();
        let videoToPlay;

        if (adUrl) {
            videoToPlay = adUrl;
            isAdPlaying = true;
            currentlyPlayingCategory = "AD_BREAK";
        } else {
            isAdPlaying = false;
            const category = getRequiredCategory(hr);
            currentlyPlayingCategory = category;
            const list = PLAYLISTS[category];
            videoToPlay = typeof list === 'string' ? list : list[Math.floor(Math.random() * list.length)];
        }

        console.log(`[${hr}:${min}] 🎬 NOW STREAMING: ${currentlyPlayingCategory}`);

        const ffmpegCmd = `ffmpeg -re -reconnect 1 -reconnect_at_eof 1 -reconnect_streamed 1 -reconnect_delay_max 5 -i "${videoToPlay}" -vf "scale=640:360,setpts=0.98*PTS" -vcodec libx264 -preset ultrafast -tune zerolatency -threads 2 -g 36 -b:v 280k -maxrate 280k -bufsize 2000k -r 18 -acodec aac -af "atempo=1.02" -b:a 128k -f flv "${streamURL}${streamKey}"`;
        
        currentProcess = exec(ffmpegCmd);
        isStarting = false;
        isSwitching = false;

        currentProcess.on('close', () => {
            currentProcess = null;
            if (!isSwitching) setTimeout(() => startEngine(), 2000);
        });
    }, 1500);
};

const checkScheduledAd = () => {
    try {
        if (!fs.existsSync('./ads.json')) return null;
        const adsData = JSON.parse(fs.readFileSync('./ads.json', 'utf8'));
        const { full } = getSLTime();
        return adsData.active_ads.find(ad => ad.time === full && ad.status === "on");
    } catch (e) { return null; }
};

setInterval(() => {
    const { hr } = getSLTime();
    const ad = checkScheduledAd();
    
    if (ad && !isAdPlaying && !isSwitching && !isStarting) {
        isSwitching = true;
        console.log("⚡ [AD] Switching...");
        if (currentProcess) currentProcess.kill('SIGKILL');
        setTimeout(() => startEngine(ad.url), 1000);
        return;
    }
    
    const shouldBe = getRequiredCategory(hr);
    if (!isAdPlaying && currentlyPlayingCategory !== shouldBe && !isSwitching && !isStarting) {
        isSwitching = true; 
        console.log(`⚡ [SCHEDULE] Switching to ${shouldBe}`);
        if (currentProcess) currentProcess.kill('SIGKILL');
        setTimeout(() => startEngine(), 1000);
    }
}, 8000);

if (streamKey) startEngine();
