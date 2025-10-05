import React, { useCallback, useState } from 'react';

interface RPMOutputProps {
  htmlContent: string;
  isGenerating: boolean;
}

export const RPMOutput: React.FC<RPMOutputProps> = ({ htmlContent, isGenerating }) => {
  const [copyButtonText, setCopyButtonText] = useState('Salin & Buka di Google Dokumen');
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyToGoogleDocs = useCallback(() => {
    if (isCopying || isGenerating) return;

    const outputElement = document.getElementById('rpm-output-content');
    if (outputElement) {
      setIsCopying(true);
      let contentForClipboard = outputElement.innerHTML;
      
      contentForClipboard = contentForClipboard.replace(/border: 1px solid #ddd/g, 'border: 1px solid #000');
      contentForClipboard = contentForClipboard.replace(/background-color: #f2f2f2/g, 'background-color: #e0e0e0');

      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000 !important; }
                table { border-collapse: collapse; width: 100%; }
                td, th { vertical-align: top; padding: 8px; }
                .page-break { page-break-before: always; }
            </style>
          </head>
          <body>${contentForClipboard}</body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });

      navigator.clipboard.write([clipboardItem]).then(() => {
        setCopyButtonText('Berhasil disalin!');
        window.open('https://docs.google.com/document/create', '_blank');
        setTimeout(() => setCopyButtonText('Salin & Buka di Google Dokumen'), 3000);
      }).catch(err => {
        console.error('Gagal menyalin konten HTML: ', err);
        const plainText = outputElement.innerText;
        navigator.clipboard.writeText(plainText).then(() => {
            setCopyButtonText('Disalin sebagai teks biasa!');
            window.open('https://docs.google.com/document/create', '_blank');
            setTimeout(() => setCopyButtonText('Salin & Buka di Google Dokumen'), 3000);
        }).catch(err2 => {
            console.error('Gagal menyalin teks biasa: ', err2);
            setCopyButtonText('Gagal menyalin, coba manual');
            setTimeout(() => setCopyButtonText('Salin & Buka di Google Dokumen'), 3000);
        });
      }).finally(() => {
        setIsCopying(false);
      });
    }
  }, [isCopying, isGenerating]);

  const getButtonClass = () => {
    if (copyButtonText === 'Berhasil disalin!') {
      return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    }
    if (copyButtonText.includes('Gagal')) {
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCopyToGoogleDocs}
        disabled={isCopying || isGenerating}
        className={`w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-wait ${getButtonClass()}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2-2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
        </svg>
        {isGenerating ? 'Menunggu proses 100%...' : copyButtonText}
      </button>
      <div 
        id="rpm-output-content"
        className="border border-gray-300 rounded-md p-4 bg-white overflow-auto h-[70vh]"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};