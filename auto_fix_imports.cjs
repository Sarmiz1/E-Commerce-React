const fs = require('fs');
const path = require('path');

const glob = (dir) => {
    let res = [];
    const list = fs.readdirSync(dir);
    list.forEach(f => {
        const p = path.join(dir, f);
        if(fs.statSync(p).isDirectory()) res.push(...glob(p));
        else if(p.endsWith('.js') || p.endsWith('.jsx')) res.push(p);
    });
    return res;
};

const dirsToCheck = ['src/Features/HomePage', 'src/Features/Marketting', 'src/Router', 'src/Layout', 'src/Components'];

let files = [];
dirsToCheck.forEach(dir => {
    if (fs.existsSync(dir)) files.push(...glob(dir));
});

let changedFiles = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let lines = content.split('\n');
    let changed = false;
    
    lines.forEach((line, i) => {
        const match = line.match(/(import.*?from\s+['"])([.]{2,}\/.*?)(['"])/) || line.match(/(import\(['"])([.]{2,}\/.*?)(['"])/);
        if(match) {
            const prefix = match[1];
            const impPath = match[2];
            const suffix = match[3];
            
            const full = path.resolve(path.dirname(f), impPath);
            
            const check = (p) => {
                if (fs.existsSync(p)) return true;
                if (fs.existsSync(p + '.js')) return true;
                if (fs.existsSync(p + '.jsx')) return true;
                if (fs.existsSync(path.join(p, 'index.js'))) return true;
                if (fs.existsSync(path.join(p, 'index.jsx'))) return true;
                return false;
            };
            
            if(!check(full)) {
                // Try removing one `../`
                let fixed = impPath.replace(/^\.\.\//, '');
                let newFull = path.resolve(path.dirname(f), fixed);
                if(check(newFull)) {
                    lines[i] = line.replace(match[0], prefix + fixed + suffix);
                    changed = true;
                } else {
                    // Try adding one `../`
                    fixed = '../' + impPath;
                    newFull = path.resolve(path.dirname(f), fixed);
                    if(check(newFull)) {
                        lines[i] = line.replace(match[0], prefix + fixed + suffix);
                        changed = true;
                    }
                }
            }
        }
    });
    
    if(changed) {
        fs.writeFileSync(f, lines.join('\n'));
        changedFiles++;
        console.log('Fixed imports in', f);
    }
});

console.log('Total files fixed:', changedFiles);
