const fs = require('fs');

const ID = {
    nav: {
      news: 'Lensa News',
      audits: 'Arsip Audit',
      dashboard: 'Dashboard',
      newAudit: 'Audit Baru',
      admin: 'Super Admin',
      login: 'Masuk Audit',
      logout: 'Keluar System'
    },
    landing: {
      tagline: 'STRATEGIC INTELLIGENCE SYSTEM',
      heroTitle: 'AUDIT PERATURAN & KEBIJAKAN PEMERINTAH',
      heroSub: 'PERPU | PERPRES | PERMEN | PERDA',
      heroDesc: 'AKP adalah Sistem Audit Kebijakan Nasional yang mencermati Integritas Kebijakan Publik dan Pengadaan Pemerintah berdasarkan Marwah UUD 1945.',
      ctaAudit: 'Audit Kebijakan',
      ctaNews: 'Lihat Temuan',
      philosophy: 'MARWAH KONSTITUSIONAL',
      quote: '"KEADILAN ADALAH MAHKOTA DARI SETIAP KEBIJAKAN PUBLIK YANG BERADAB."',
      ecosystem: 'EKOSISTEM INTELEJEN AKP',
      mandate: 'MANDAT KONSTITUSI UNTUK TRANSPARANSI DAN AKUNTABILITAS NASIONAL.',
      features: {
        auditTitle: 'AUDIT KEBIJAKAN',
        auditDesc: 'Analisis mendalam terhadap naskah peraturan menggunakan basis data hukum dan UUD 1945.',
        apbnTitle: 'TRACKING APBN',
        apbnDesc: 'Pemantauan alokasi anggaran negara terhadap efektivitas kebijakan di lapangan.',
        portalTitle: 'LENSA NEWS',
        portalDesc: 'Portal berita investigasi yang menyajikan temuan dari hasil audit AI.',
        justiceTitle: 'GLOBAL INTEGRITY',
        justiceDesc: 'Standarisasi integritas kebijakan publik berdasarkan parameter transparansi global.'
      },
      warningTitle: 'PERINGATAN KONSTITUSIONAL',
      warningDesc: 'SISTEM INI BERJALAN SECARA INDEPENDEN. SEGALA HASIL AUDIT BERDASARKAN ANALISIS DATA OBJEKTIF DAN SUMBER HUKUM YANG BERLAKU DI REPUBLIK INDONESIA.',
      footer: {
        system: 'SYSTEM AUDIT NASIONAL',
        copy: '© 2024 AKP INTELLIGENCE - BI NEWS NETWORK'
      }
    }
};

function getNested(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace {t('some.key')} with "string" or some.key
    content = content.replace(/\{t\('([^']+)'\)\}/g, (match, p1) => {
        const val = getNested(ID, p1);
        return val ? val : match;
    });

    // Replace t('some.key') with "string"
    content = content.replace(/t\('([^']+)'\)/g, (match, p1) => {
        const val = getNested(ID, p1);
        return val ? `"${val}"` : match;
    });
    
    // Remove imports
    content = content.replace(/import\s+\{[^}]*useLanguage[^}]*\}\s+from\s+['"].*LanguageContext['"];?\n?/g, '');
    
    // Remove useLanguage call
    content = content.replace(/\s*const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);\n?/g, '');
    
    // Nav.tsx specific
    if (filePath.includes('Nav.tsx')) {
        content = content.replace(/\s*const\s+\{\s*language,\s*setLanguage,\s*t\s*\}\s*=\s*useLanguage\(\);\n?/g, '');
        // Remove the select dropdown for language
        content = content.replace(/<select[\s\S]*?<\/select>/, '');
    }

    fs.writeFileSync(filePath, content);
}

const filesToProcess = [
    './src/pages/LandingPage.tsx',
    './src/components/Nav.tsx',
    './src/components/ConstitutionalWarning.tsx',
    './src/components/AuthPage.tsx'
];

filesToProcess.forEach(processFile);

// Process App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');
appContent = appContent.replace(/import\s+\{\s*LanguageProvider\s*\}\s+from\s+['"].*LanguageContext['"];?\n?/g, '');
appContent = appContent.replace(/<LanguageProvider>\s*/g, '');
appContent = appContent.replace(/\s*<\/LanguageProvider>/g, '');
fs.writeFileSync('./src/App.tsx', appContent);

console.log("Done");
