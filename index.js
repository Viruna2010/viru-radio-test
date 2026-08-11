const { spawn } = require('child_process');

// Script එක ඇතුලෙත් ලංකාවේ Timezone එක සෙට් කරනවා
process.env.TZ = 'Asia/Colombo';

const STREAM_KEY = process.env.YOUTUBE_STREAM_KEY;
const AUDIO_URL = "https://github.com/Viruna2010/viru-radio-test/releases/download/1.0/Gajaga.Wannama.EDM.Remix._320k.mp3";

if (!STREAM_KEY) {
    console.error("Error: YOUTUBE_STREAM_KEY එක දීලා නැහැ!");
    process.exit(1);
}

const YOUTUBE_RTMP = `rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}`;
const FONT_FILE = './font.ttf'; 

// මෙතනින් තමයි ඔයාගේ Screen එකේ Design එක හැදෙන්නේ
const filterComplex = [
    // 1. සිංදුවට වැඩ කරන Cyan පාට Audio Wave එක
    '[0:a]showwaves=s=1280x250:colors=0x00ffff:mode=line[wave]', 
    
    // 2. ඒක Deep Purple Background එක උඩට දානවා
    '[1:v][wave]overlay=0:h-h/2+50[bg]', 
    
    // 3. මැද "VIRU RADIO COMING SOON"
    `[bg]drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO COMING SOON':fontcolor=white:fontsize=75:x=(w-tw)/2:y=(h-th)/2-80:shadowcolor=black:shadowx=5:shadowy=5[t1]`,
    
    // 4. වම් පැත්තේ Moving "TEST TRANSMISSION" (උඩට පල්ලෙහාට bounce වෙනවා)
    `[t1]drawtext=fontfile=${FONT_FILE}:text='TEST TRANSMISSION':fontcolor=red:fontsize=40:x=40:y=60+sin(t*3)*20:shadowcolor=black:shadowx=3:shadowy=3[t2]`,
    
    // 5. දකුණු පැත්තේ Moving "VIRU RADIO" (උඩට පල්ලෙහාට bounce වෙනවා)
    `[t2]drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO':fontcolor=yellow:fontsize=40:x=w-tw-40:y=60+cos(t*3)*20:shadowcolor=black:shadowx=3:shadowy=3[t3]`,
    
    // 6. දකුණු පැත්තේ යටින් ලංකාවේ Live Time එක (උදා: 02:30:45 PM)
    `[t3]drawtext=fontfile=${FONT_FILE}:text='Sri Lanka Time  %{localtime\\:%I\\\\:%M\\\\:%S %p}':fontcolor=0x00FF00:fontsize=40:x=w-tw-40:y=h-th-40:box=1:boxcolor=black@0.7:boxborderw=10[out]`
].join(';');

const ffmpegArgs = [
    '-re',
    '-stream_loop', '-1', 
    '-i', AUDIO_URL,
    
    // කළු පාට වෙනුවට Dark Purple (#0b001a) Background එකක් දැම්මා
    '-f', 'lavfi',
    '-i', 'color=c=#0b001a:s=1280x720:r=30', 
    
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-map', '0:a',
    
    // Video Encoder Settings 
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    
    // === BITRATE WARNING FIX ===
    // Constant Bitrate (CBR) Force කරලා තියෙන්නේ. මේකෙන් YouTube error එක එන්නේ නෑ.
    '-b:v', '2500k',
    '-minrate', '2500k',
    '-maxrate', '2500k',
    '-bufsize', '5000k',
    '-x264opts', 'nal-hrd=cbr:force-cfr=1', 
    
    '-pix_fmt', 'yuv420p',
    '-g', '60', 
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-shortest',
    '-f', 'flv',
    YOUTUBE_RTMP
];

console.log("Starting Viru Radio Stream with Audio Visualizer & CBR Fix...");

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ffmpeg.stderr.on('data', (data) => {
    // console.log(`FFmpeg: ${data}`);
});

ffmpeg.on('close', (code) => {
    console.log(`Stream ended with code ${code}`);
});

// පැය 6න් Auto Cut
setTimeout(() => {
    console.log("6 Hours completed! Stopping stream safely...");
    ffmpeg.kill('SIGINT');
    process.exit(0);
}, 6 * 60 * 60 * 1000);
