import { access, readFile } from 'node:fs/promises';
const required = ['index.html','de/index.html','en/index.html','assets/styles.css','assets/app.js','assets/wao-logo.png','assets/WAO-Investor-Expose-DE.pdf','api/contact.js','vercel.json'];
let failed = false;
for (const file of required) {
  try { await access(file); console.log('✓', file); }
  catch { console.error('✗ Missing', file); failed = true; }
}
for (const file of ['de/index.html','en/index.html']) {
  const html = await readFile(file, 'utf8');
  for (const token of ['<title>','meta name="description"','class="hero"','data-contact-form','data-lightbox']) {
    if (!html.includes(token)) { console.error(`✗ ${file}: missing ${token}`); failed = true; }
  }
}
if (failed) process.exit(1);
console.log('\nStatic project checks passed.');
