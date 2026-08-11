const { spawn } = require('child_process');

process.env.TZ = 'Asia/Colombo';

const STREAM_KEY = process.env.YOUTUBE_STREAM_KEY;
const AUDIO_URL = "https://github.com/Viruna2010/viru-radio-test/releases/download/1.0/Gajaga.Wannama.EDM.Remix._320k.mp3";

if (!STREAM_KEY) {
    console.error("Error: YOUTUBE_STREAM_KEY is not set!");
    process.exit(1);
}

const YOUTUBE_RTMP = `rtmp://a.rtmp.youtube.com/live2/${STREAM_KEY}`;
const FONT_FILE = './font.ttf'; 

// NCS Style Circle Visualizer එක සහ අකුරු
const filterComplex = [
    // 1. Audio එකෙන් Circle Visualizer එකක් හදනවා
    '[0:a]showcqt=s=600x600:count=5:axis=0:text=0:bar_h=100[cqt]',
    '[cqt]format=rgba,geq=r=r(X\\,Y):g=g(X\\,Y):b=b(X\\,Y):a=\'if(gt(pow(X-300\\,2)+pow(Y-300\\,2)\\,pow(300\\,2))\\,0\\,255)\'[circle_vis]',

    // 2. ඒ රවුම Dark Background එකක් උඩට දානවා (මැදට)
    '[1:v][circle_vis]overlay=(W-w)/2:(H-h)/2[bg]',

    // 3. උඩින් VIRU RADIO COMING SOON
    `[bg]drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO COMING SOON':fontcolor=white:fontsize=50:x=(w-tw)/2:y=100:shadowcolor=black:shadowx=3:shadowy=3[t1]`,

    // 4. වම් පැත්තේ TEST TRANSMISSION
    `[t1]drawtext=fontfile=${FONT_FILE}:text='TEST TRANSMISSION':fontcolor=red:fontsize=35:x=50:y=(h-th)/2+sin(t*3)*20:shadowcolor=black:shadowx=2:shadowy=2[t2]`,

    // 5. දකුණු පැත්තේ VIRU RADIO
    `[t2]drawtext=fontfile=${FONT_FILE}:text='VIRU RADIO':fontcolor=yellow:fontsize=35:x=w-tw-50:y=(h-th)/2+cos(t*3)*20:shadowcolor=black:shadowx=2:shadowy=2[t3]`,

    // 6. දකුණු පැත්තේ යටින් ලංකාවේ වෙලාව (දැන් අකුරු/ඉලක්කම් හරියට පෙනෙයි)
    `[t3]drawtext=fontfile=${FONT_FILE}:text='Time\\: %{localtime\\:%I\\\\:%M\\\\:%S %p}':fontcolor=green:fontsize=35:x=w-tw-50:y=h-th-50:box=1:boxcolor=black@0.7:boxborderw=5[out]`
].join(';');

const ffmpegArgs = [
    '-re',
    '-stream_loop', '-1', 
    '-i', AUDIO_URL,
    '-f', 'lavfi',
    '-i', 'color=c=#0b0b0b:s=1280x720:r=30', // Dark grey background
    '-filter_complex', filterComplex,
    '-map', '[out]',
    '-map', '0:a',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
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

console.log("Starting NCS Style Viru Radio Stream...");

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

ffmpeg.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`); // Optional: keep it silent if too much text
});

ffmpeg.stderr.on('data', (data) => {
    // console.log(`FFmpeg: ${data}`);
});

ffmpeg.on('close', (code) => {
    console.log(`Stream ended with code ${code}`);
});

setTimeout(() => {
    console.log("6 Hours completed! Stopping stream safely...");
    ffmpeg.kill('SIGINT');
    process.exit(0);
}, 6 * 60 * 60 * 1000);
