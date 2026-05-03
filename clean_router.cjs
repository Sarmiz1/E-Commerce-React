const fs = require('fs');
const path = 'C:/Users/hp/Documents/web tuts/Tuts/html/Testing/Projects Test/Other Projects/React project/E-Commerce/src/Router/router.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/element=\{\s*<>\s*<Navbar \/>\s*<([A-Za-z0-9_]+) \/>\s*<\/>\s*\}/g, 'element={<$1 />}');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacement');
