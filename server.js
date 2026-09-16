const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5144;
const PROJECT_DIR = __dirname;
const MEDIA_DIR = path.join('C:', 'Users', 'Adeleke Kehinde.B', 'Downloads', 'Tumi');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mov': 'video/mp4',  // Serve MOV as mp4 for broader browser compat
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    // Parse URL (remove query string)
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    let filePath;

    if (urlPath.startsWith('/media/')) {
        const mediaFile = urlPath.slice(7); // remove '/media/'
        filePath = path.join(MEDIA_DIR, mediaFile);
    } else if (urlPath === '/' || urlPath === '') {
        filePath = path.join(PROJECT_DIR, 'index.html');
    } else {
        filePath = path.join(PROJECT_DIR, urlPath);
    }

    // Security: prevent directory traversal
    const resolvedProject = path.resolve(PROJECT_DIR);
    const resolvedMedia = path.resolve(MEDIA_DIR);
    const resolvedFile = path.resolve(filePath);

    if (!resolvedFile.startsWith(resolvedProject) && !resolvedFile.startsWith(resolvedMedia)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found: ' + urlPath);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Server Error');
            }
            return;
        }

        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
            fs.stat(filePath, (err2) => {
                if (err2) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                serveFile(filePath, contentType, stats, req, res);
            });
            return;
        }

        serveFile(filePath, contentType, stats, req, res);
    });
});

function serveFile(filePath, contentType, stats, req, res) {
    const headers = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
    };

    // Handle range requests (crucial for video seeking)
    if (req.headers.range) {
        const parts = req.headers.range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunkSize = (end - start) + 1;

        headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
        headers['Content-Length'] = chunkSize;

        res.writeHead(206, headers);
        fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
        headers['Content-Length'] = stats.size;
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    }
}

server.listen(PORT, () => {
    console.log(`\n  ✦ Tumi Portfolio Server`);
    console.log(`  ✦ Running at http://localhost:${PORT}/`);
    console.log(`  ✦ Serving media from: ${MEDIA_DIR}`);
    console.log(`  ✦ Press Ctrl+C to stop\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other process or use a different port.`);
    } else {
        console.error('Server error:', err);
    }
});
