const { spawn } = require('child_process');

// GitHub Secrets වලින් YouTube Stream Key එක ගන්නවා
const STREAM_KEY = process.env.YOUTUBE_STREAM_KEY;

// Gajaga Wannama EDM Remix MP3 direct link
const AUDIO_URL = "https://github.com/Viruna2010/viru-radio-test/releases/download/1.0/Gajaga.Wannama.EDM.Remix._320k.mp3";

if (!STREAM_KEY) {
    console.error("Error: YOUTUBE_STREAM_KEY එක දීලා නැහැ!");
    process.exit(1);
}

const YOUTUBE_RTMP = `rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}`;
const FONT_FILE = './font.ttf'; 

// යටින් යන සිංහල Text එක
const scrollingText = "අපත් සමග රැඳී සිටින්න. මේක testing එකක්, ළඟදීම දෙන්නම්...";

// FFmpeg Arguments
const ffmpegArgs = [
    '-re',
    
    // 1. Audio එක නොනවත්වා Loop කරන්න
    '-stream_loop', '-1', 
    '-i', AUDIO_URL,
    
    // 2. YouTube එකට Black Background (1280x720, 30fps) හදන්න
    '-f', 'lavfi',
    '-i', 'color=c=black:s=1280x720:r=30',
    
    // 3. Logo එක, TEST TRANSMISSION එක සහ Scrolling Sinhala text එක
    '-vf', `drawbox=y=ih-50:color=black@0.7:width=iw:height=50:t=fill,drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO':fontcolor=white:fontsize=45:x=30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='TEST TRANSMISSION':fontcolor=red:fontsize=30:x=w-tw-30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='${scrollingText}':fontcolor=yellow:fontsize=35:y=h-40:x=w-mod(max(t\\,0)*150\\,w+tw)`,
    
    // 4. Video/Audio Output Settings
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-b:v', '2500k',
    '-maxrate', '2500k',
    '-bufsize', '5000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60', 
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-shortest',
    
    // 5. YouTube RTMP Format
    '-f', 'flv',
    YOUTUBE_RTMP
];

console.log("Starting Viru Radio Test Transmission with Gajaga Wannama EDM...");

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ffmpeg.stderr.on('data', (data) => {
    // Debug කරගන්න ඕනෙ නම් පහල පේළියේ comment එක අයින් කරන්න
    // console.log(`FFmpeg: ${data}`); 
});

ffmpeg.on('close', (code) => {
    console.log(`Stream ended with code ${code}`);
});

// පැය 6ක් පිරුනම Auto Cut වෙන එක
setTimeout(() => {
    console.log("6 Hours completed! Stopping stream safely...");
    ffmpeg.kill('SIGINT');
    process.exit(0);
}, 6 * 60 * 60 * 1000);
