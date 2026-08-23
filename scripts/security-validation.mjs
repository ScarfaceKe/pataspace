import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const ignored = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache']);
const suspicious = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /(?:const|let|var)\s+\w*password\w*\s*=\s*['"][^'"]{8,}['"]/i,
  /(?:const|let|var)\s+\w*(?:api[_-]?key|secret|token)\w*\s*=\s*['"][^'"]{12,}['"]/i
];
const findings = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(ts|tsx|js|jsx|mjs|json|md|css)$/.test(path)) {
      const text = readFileSync(path, 'utf8');
      suspicious.forEach((pattern) => {
        if (pattern.test(text)) findings.push(`${path.replace(root + '/', '')}: possible secret pattern ${pattern}`);
      });
    }
  }
}
walk(root);
if (findings.length) {
  console.error('Security validation failed:');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}
console.log('Security validation passed: no high-confidence hardcoded secret patterns found.');
