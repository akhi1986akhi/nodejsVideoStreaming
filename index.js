const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", (req, res) => {
    const videoPath = "./sample.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const range = req.headers.range;

    if (!range) {
        res.status(400).send("Requires Range Headers");
        return;
    }

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    
    videoStream.on('open', () => {
        videoStream.pipe(res);
    });

    videoStream.on('error', (err) => {
        res.end(err);
    });
});

app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
});