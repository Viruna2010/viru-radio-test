const { spawn } = require('child_process');

const STREAM_KEY = process.env.YOUTUBE_STREAM_KEY;
const AUDIO_URL = "https://github.com/Viruna2010/viru-radio-test/releases/download/1.0/Gajaga.Wannama.EDM.Remix._320k.mp3";

if (!STREAM_KEY) {
    console.error("Error: YOUTUBE_STREAM_KEY එක දීලා නැහැ!");
    process.exit(1);
}

const YOUTUBE_RTMP = `rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}`;
const FONT_FILE = './font.ttf'; 

const scrollingText = "අපත් සමග රැඳී සිටින්න. මේක testing එකක්, ළඟදීම දෙන්නම්...";

// FFmpeg arguments - text_shaping=1 දැම්මාම සිංහල අකුරු කැඩෙන්නේ නැතුව හරියටම එකතු වෙනවා
const ffmpegArgs = [
    '-re',
    '-stream_loop', '-1', 
    '-i', AUDIO_URL,
    '-f', 'lavfi',
    '-i', 'color=c=black:s=1280x720:r=30',
    '-vf', `drawbox=y=ih-50:color=black@0.7:width=iw:height=50:t=fill,drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO':fontcolor=white:fontsize=45:x=30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='TEST TRANSMISSION':fontcolor=red:fontsize=30:x=w-tw-30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='${scrollingText}':fontcolor=yellow:fontsize=35:y=h-40:x=w-mod(max(t\\,0)*150\\,w+tw):text_shaping=1`,
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
    '-f', 'flv',
    YOUTUBE_RTMP
];

console.log("Starting Viru Radio Stream with Clean Sinhala Text Rendering...");

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

// පැය 6න් Auto Kill වෙන එක
setTimeout(() => {
    console.log("6 Hours completed! Stopping stream safely...");
    ffmpeg.kill('SIGINT');
    process.exit(0);
}, 6 * 60 * 60 * 1000);
