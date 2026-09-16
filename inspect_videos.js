const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Adeleke Kehinde.B\\Downloads\\Tumi';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.MOV'));

files.forEach(f => {
    const fullPath = path.join(dir, f);
    const buf = fs.readFileSync(fullPath);
    const str = buf.toString('latin1');
    
    // Check CapCut / Vicut extra meta
    const idx = str.indexOf('extra_info');
    let extra = '';
    if (idx !== -1) {
        extra = str.substring(idx, idx + 400).replace(/[^\x20-\x7E]/g, ' ');
    }
    
    // Find text track fragments or subtitle fragments or music titles
    const textMatches = [];
    const regex = /[\x20-\x7E]{4,50}/g;
    let m;
    let count = 0;
    while ((m = regex.exec(str)) !== null && count < 1000) {
        count++;
        const s = m[0].trim();
        if (/vlog|brand|beauty|hair|grwm|routine|outfit|skincare|review|client|commercial|fashion|haul|unboxing|edit|interview|founder/i.test(s)) {
            textMatches.push(s);
        }
    }
    
    console.log(`\n=== File: ${f} (Size: ${(buf.length / (1024*1024)).toFixed(1)} MB) ===`);
    if (extra) console.log('Extra:', extra.substring(0, 150));
    console.log('Keywords:', [...new Set(textMatches)].slice(0, 8));
});
