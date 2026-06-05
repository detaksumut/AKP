const fs = require('fs');
let data = fs.readFileSync('src/pages/ArticleDetail.tsx', 'utf8');

// We want to replace everything from the tab selector to the end of the academic branch with just the article text area.
const replacement = `{article.type === 'academic' ? (
            <div className="space-y-8">
              {/* Artikel Versi Perbaikan (Academic Editor AI) */}
              <div className="bg-gray-50/50 border border-gray-150 p-6 md:p-12 shadow-inner">
                <div className="max-w-none font-serif text-justify text-gray-900 leading-relaxed select-text">
                  {isEditing ? (
                    <textarea
                      value={editContent || ''}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[500px] p-6 bg-white border border-gray-200 outline-none font-serif text-base leading-relaxed"
                    />
                  ) : (
                    <div className="prose prose-red max-w-none">
                      <ReactMarkdown>{ensureString(article.content)}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Exports */}
              <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center no-print">
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">Export Naskah Jurnal</h4>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">Unduh hasil rewrite Academic Editor AI siap submit.</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto select-none">
                  <button
                    onClick={handleDownloadArticleDOC}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-zinc-950 border border-zinc-800 text-white hover:bg-black px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>Export DOCX</span>
                  </button>
                  <button
                    onClick={handlePrintArticle}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-red-600 text-white hover:bg-red-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <Printer size={12} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (`;

const pattern = /\{article\.type === 'academic' \? \([\s\S]*?\}\s*<\/div>\s*\)\s*:\s*\(/;

data = data.replace(pattern, replacement);
fs.writeFileSync('src/pages/ArticleDetail.tsx', data);
console.log("Done");
