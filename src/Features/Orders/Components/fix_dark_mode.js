const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.split('dark:border-white dark:border-[#0D1421]/10').join('dark:border-white/10');
  content = content.split('dark:bg-white dark:bg-[#0D1421]/5').join('dark:bg-white/5');
  
  // also fix rgba background in OrderDrawer
  if (file === 'OrderDrawer.jsx') {
    content = content.replace('background: "rgba(255,255,255,0.98)"', '/* background removed via css classes */');
    content = content.replace(
      'className="fixed top-0 right-0 bottom-0 z-[81] or-scroll overflow-y-auto flex flex-col"',
      'className="fixed top-0 right-0 bottom-0 z-[81] or-scroll overflow-y-auto flex flex-col bg-white/98 dark:bg-[#060B14]/98 backdrop-blur-xl"'
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
  }
});
