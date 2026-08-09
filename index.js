const { spawn } = require('child_process');

// GitHub Secrets වලින් YouTube Stream Key එක ගන්නවා
const STREAM_KEY = process.env.YOUTUBE_STREAM_KEY;

// ඔයා දුන්න MP3 ලින්ක් එක කෙලින්ම කෝඩ් එකට දාලා තියෙන්නේ
const AUDIO_URL = "https://github.com/Viruna2010/viru-radio-test/releases/download/1.0/Gajaga.Wannama.EDM.Remix._320k.mp3";

if (!STREAM_KEY) {
    console.error("Error: YOUTUBE_STREAM_KEY එක දීලා නැහැ!");
    process.exit(1);
}

const YOUTUBE_RTMP = `rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}`;
const FONT_FILE = './font.ttf'; 

// යටින් යන සිංහල text එක
const scrollingText = "අපත් සමග රැඳී සිටින්න. මේක testing එකක්, ළඟදීම දෙන්නම්...";

// FFmpeg කමාන්ඩ් එක
const ffmpegArgs = [
    '-re',
    
    // 1. Audio එක loop කරනවා
    '-stream_loop', '-1', 
    '-i', AUDIO_URL,
    
    // 2. YouTube එකට වීඩියෝ ඕනේ නිසා කළු පාට Background එකක් හදනවා (1280x720, 30fps)
    '-f', 'lavfi',
    '-i', 'color=c=black:s=1280x720:r=30',
    
    // 3. ලෝගෝ එකයි අකුරු ටිකයි දානවා
    '-vf', `drawbox=y=ih-50:color=black@0.7:width=iw:height=50:t=fill,drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO':fontcolor=white:fontsize=45:x=30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='TEST TRANSMISSION':fontcolor=red:fontsize=30:x=w-tw-30:y=30:box=1:boxcolor=black@0.6:boxborderw=10,drawtext=fontfile=${FONT_FILE}:text='${scrollingText}':fontcolor=yellow:fontsize=35:y=h-40:x=w-mod(max(t\\,0)*150\\,w+tw)`,
    
    // 4. Video සහ Audio Settings
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
    '-shortest', // Audio එකට අනුව වීඩියෝ එක පාලනය කරන්න
    
    // 5. YouTube Live Format එක
    '-f', 'flv',
    YOUTUBE_RTMP
];

console.log("Starting Viru Radio Test Transmission with Gajaga Wannama EDM...");

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ffmpeg.stderr.on('data', (data) => {
    // එරර් මොනවා හරි ආවොත් බලාගන්න මේක comment කරලා තියෙන්නේ. ඕනේ නම් අයින් කරන්න.
    // console.log(`FFmpeg: ${data}`); 
});

ffmpeg.on('close', (code) => {
    console.log(`Stream ended with code ${code}`);
});

// පැය 6න් පස්සේ auto stop වෙන Kill switch එක
setTimeout(() => {
    console.log("6 Hours completed! Stopping stream safely...");
    ffmpeg.kill('SIGINT');
    process.exit(0);
}, 6 * 60 * 60 * 1000); // පැය 6 (මිලි තත්පර වලින්)
