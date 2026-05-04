const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  // Backgrounds
  ['bg-white', 'bg-white dark:bg-[#0D1421]'],
  ['bg-gray-50', 'bg-gray-50 dark:bg-[#060B14]'],
  ['bg-gray-100', 'bg-gray-100 dark:bg-white/5'],
  
  // Borders
  ['border-gray-100', 'border-gray-100 dark:border-white/10'],
  ['border-gray-200', 'border-gray-200 dark:border-white/10'],
  ['border-white', 'border-white dark:border-[#0D1421]'],

  // Text
  ['text-gray-900', 'text-gray-900 dark:text-white'],
  ['text-gray-700', 'text-gray-700 dark:text-gray-200'],
  ['text-gray-600', 'text-gray-600 dark:text-gray-300'],
  ['text-gray-500', 'text-gray-500 dark:text-gray-400'],
  
  // Avoid duplicates:
  ['bg-white dark:bg-[#0D1421] dark:bg-[#0D1421]', 'bg-white dark:bg-[#0D1421]'],
  ['bg-gray-50 dark:bg-[#060B14] dark:bg-[#060B14]', 'bg-gray-50 dark:bg-[#060B14]'],
  ['bg-gray-100 dark:bg-white/5 dark:bg-white/5', 'bg-gray-100 dark:bg-white/5'],
  ['border-gray-100 dark:border-white/10 dark:border-white/10', 'border-gray-100 dark:border-white/10'],
  ['border-gray-200 dark:border-white/10 dark:border-white/10', 'border-gray-200 dark:border-white/10'],
  ['border-white dark:border-[#0D1421] dark:border-[#0D1421]', 'border-white dark:border-[#0D1421]'],
  ['text-gray-900 dark:text-white dark:text-white', 'text-gray-900 dark:text-white'],
  ['text-gray-700 dark:text-gray-200 dark:text-gray-200', 'text-gray-700 dark:text-gray-200'],
  ['text-gray-600 dark:text-gray-300 dark:text-gray-300', 'text-gray-600 dark:text-gray-300'],
  ['text-gray-500 dark:text-gray-400 dark:text-gray-400', 'text-gray-500 dark:text-gray-400'],
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(([search, replace]) => {
    // using split join to replace all occurrences
    content = content.split(search).join(replace);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  }
});
