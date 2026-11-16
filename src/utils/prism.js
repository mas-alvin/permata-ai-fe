import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-docker.js';
import 'prism-themes/themes/prism-vsc-dark-plus.css';

const LANGUAGE_ALIASES = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  py: 'python',
  yml: 'yaml',
  golang: 'go',
  rs: 'rust',
  cs: 'csharp',
  'c++': 'cpp',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  md: 'markdown',
  docker: 'dockerfile',
  dockerfile: 'docker',
};

export function highlightCode(code, lang) {
  if (!code) return '';
  const normalizedLang = (lang || '').toLowerCase().trim();
  const targetLang = LANGUAGE_ALIASES[normalizedLang] || normalizedLang;

  const grammar = Prism.languages[targetLang];
  if (grammar) {
    try {
      return Prism.highlight(code, grammar, targetLang);
    } catch (err) {
      console.warn('Prism highlighting error for language:', targetLang, err);
    }
  }

  // Fallback jika bahasa tidak dikenali: escape HTML karakter agar tetap aman
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

