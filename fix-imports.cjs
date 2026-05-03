const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Calculate relative path from this file's directory to src/store
    const fileDir = path.dirname(file);
    const storeDir = path.resolve('./src/store');
    let relPath = path.relative(fileDir, storeDir).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    
    const regexes = [
        { test: /from\s*['"]\/useThemeStore['"]/g, replace: `from "${relPath}/useThemeStore"` },
        { test: /from\s*['"]\/useAuthStore['"]/g, replace: `from "${relPath}/useAuthStore"` },
        { test: /from\s*['"]\/useToastStore['"]/g, replace: `from "${relPath}/useToastStore"` }
    ];
    
    regexes.forEach(r => {
        if (content.match(r.test)) {
            content = content.replace(r.test, r.replace);
            changed = true;
        }
    });
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});
console.log('Fixed imports in ' + count + ' files.');
