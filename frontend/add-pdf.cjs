const fs = require('fs');
let content = fs.readFileSync('src/services/api.service.ts', 'utf8');

// Add imports if not present
if (!content.includes('pdfjs-dist')) {
  const imports = `import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
`;
  content = imports + '\n' + content;
}

// Replace extractPdf
const oldExtractPdf = `extractPdf(file: File) {
    return { content: \`Fitur ekstrak PDF tidak tersedia di versi Lite tanpa server. Silakan *copy-paste* teks dokumennya secara manual.\` };
  }`;

const newExtractPdf = `async extractPdf(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\\n\\n';
      }
      
      return { content: fullText.trim() };
    } catch (e: any) {
      console.error('PDF Extraction Error:', e);
      throw new Error('Gagal membaca PDF: ' + e.message);
    }
  }`;

content = content.replace(oldExtractPdf, newExtractPdf);
fs.writeFileSync('src/services/api.service.ts', content);
