const fs = require('fs');
const path = require('path');

const INTERN_DIR = 'd:/Project/Company_Portfolio/intern/frontend/src';
const ADMIN_DIR = 'd:/Project/Company_Portfolio/admin_pannel/src';

function processFile(filePath, dir) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("import { API_URL } from './config';") && filePath !== path.join(dir, 'App.jsx') && filePath !== path.join(dir, 'InternshipForm.jsx')) {
     content = content.replace("import { API_URL } from './config';", '');
  }
  
  if (content.includes("import { API_URL } from '../config';") || content.includes("import { API_URL } from '../../config';") || (content.includes("import { API_URL } from './config';") && (filePath === path.join(dir, 'App.jsx') || filePath === path.join(dir, 'InternshipForm.jsx')))) {
     // Already has the correct import
  } else if (content.includes('API_URL')) {
      let relativePath = path.relative(path.dirname(filePath), dir).replace(/\\/g, '/');
      let importPath = '';
      if (relativePath === '') importPath = './config';
      else importPath = relativePath + '/config';
      
      const importStr = `import { API_URL } from '${importPath}';\n`;
      content = importStr + content;
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Processed', filePath);
}

function walkDir(dir, baseDir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, baseDir);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      if (file !== 'config.js') {
        processFile(fullPath, baseDir);
      }
    }
  }
}

walkDir(INTERN_DIR, INTERN_DIR);
walkDir(ADMIN_DIR, ADMIN_DIR);
