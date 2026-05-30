const fs = require('fs');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}
const files = walk('./src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Fix LanguageContext
    if (f.includes('LanguageContext.tsx')) {
        content = content.replace(/import \{ translations, Language \} from '\.\.\/lib\/translations';/, "import { translations, type Language } from '../lib/translations';");
    }
    
    // Fix types imports
    content = content.replace(/import \{([^}]+UserProfile[^}]+)\} from '([^']+types)';/g, "import type {$1} from '$2';");
    content = content.replace(/import \{([^}]+AuditReport[^}]+)\} from '([^']+types)';/g, "import type {$1} from '$2';");
    content = content.replace(/import \{([^}]+JournalismArticle[^}]+)\} from '([^']+types)';/g, "import type {$1} from '$2';");
    content = content.replace(/import \{([^}]+AuditType[^}]+)\} from '([^']+types)';/g, "import type {$1} from '$2';");
    
    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log('Fixed', f);
    }
});
