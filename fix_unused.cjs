const fs = require('fs');

const report = JSON.parse(fs.readFileSync('./eslint_report.json', 'utf8'));
let filesChanged = 0;

report.forEach(fileReport => {
    if (fileReport.messages.length === 0) return;
    
    let filePath = fileReport.filePath;
    let contentLines = fs.readFileSync(filePath, 'utf8').split('\n');
    let originalLines = [...contentLines];
    let modified = false;

    let messagesByLine = {};
    fileReport.messages.forEach(msg => {
        if (msg.ruleId === 'no-unused-vars') {
            const match = msg.message.match(/'([^']+)'/);
            if (match) {
                let varName = match[1];
                if (varName === 'motion' || varName === 'isDark') return;
                
                if (!messagesByLine[msg.line]) messagesByLine[msg.line] = [];
                messagesByLine[msg.line].push(varName);
            }
        }
    });

    for (let lineNum in messagesByLine) {
        let idx = parseInt(lineNum) - 1;
        let line = contentLines[idx];
        let varsToRemove = messagesByLine[lineNum];
        
        varsToRemove.forEach(v => {
            if (line.includes(`const ${v} =`) || line.includes(`let ${v} =`)) {
                line = ''; // remove entire line for animRef
            } else if (line.match(new RegExp(`import\\s+${v}\\s+from`))) {
                line = ''; // remove default import like `import gsap from "gsap"`
            } else {
                // remove from destructuring: `import { v } from` or `const { v } =`
                let regex1 = new RegExp(`\\b${v}\\b\\s*,?\\s*`);
                line = line.replace(regex1, '');
                
                // cleanup
                line = line.replace(/,\s*\}/g, ' }').replace(/\{\s*,/g, '{ ');
                
                // if it became empty destructuring: `import { } from`
                if (/import\s*\{\s*\}\s*from/.test(line)) {
                    line = '';
                } else if (/import\s+React\s*,\s*\{\s*\}\s*from/.test(line)) {
                    line = line.replace(/,\s*\{\s*\}/, '');
                } else if (/(const|let)\s*\{\s*\}\s*=/.test(line)) {
                    line = '';
                }
            }
        });
        
        contentLines[idx] = line;
        modified = true;
    }

    if (modified) {
        let newContent = contentLines.filter((l, i) => !(l === '' && originalLines[i] !== '')).join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        filesChanged++;
    }
});

console.log('Fixed', filesChanged, 'files.');
