const fs = require('fs');
const path = require('path');

const INTERN_DIR = 'd:/Project/Company_Portfolio/intern/frontend/src';
const ADMIN_DIR = 'd:/Project/Company_Portfolio/admin_pannel/src';

function processFile(filePath, configImportStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('https://api.mirafuturetechvision.com')) {
    return;
  }
  
  // add import if not there
  if (!content.includes('API_URL')) {
    // find the last import
    const importRegex = /import .* from ['"].*['"];?\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = importRegex.lastIndex;
    }
    
    content = content.slice(0, lastIndex) + configImportStr + '\n' + content.slice(lastIndex);
  }
  
  content = content.replace(/['"]https:\/\/api\.mirafuturetechvision\.com(.*?)['"]/g, '`${API_URL}$1`');
  content = content.replace(/https:\/\/api\.mirafuturetechvision\.com/g, '${API_URL}'); // just in case it's inside template literals
  
  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

function walkDir(dir, configImportStr) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, configImportStr);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      if (file !== 'config.js') {
        let relativePath = path.relative(path.dirname(fullPath), dir).replace(/\\/g, '/');
        if (relativePath === '') relativePath = '.';
        
        // calculate correct relative path to config.js
        let levels = path.relative(path.dirname(fullPath), dir).split(path.sep).length;
        if (path.relative(path.dirname(fullPath), dir) === '') levels = 0;
        
        let importPath = '';
        if (levels === 0) importPath = './config';
        else importPath = '../'.repeat(levels) + 'config';

        const importStr = `import { API_URL } from '${importPath}';`;
        processFile(fullPath, importStr);
      }
    }
  }
}

walkDir(INTERN_DIR, '');
walkDir(ADMIN_DIR, '');
