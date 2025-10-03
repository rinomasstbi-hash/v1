import React, { useCallback } from 'react';

interface RPMOutputProps {
  htmlContent: string;
}

export const RPMOutput: React.FC<RPMOutputProps> = ({ htmlContent }) => {
  const handleCopyToGoogleDocs = useCallback(() => {
    const outputElement = document.getElementById('rpm-output-content');
    if (outputElement) {
      // Make a copy of the innerHTML to modify for the clipboard
      let contentForClipboard = outputElement.innerHTML;
      
      // Replace light borders and backgrounds with darker versions for better document/print visibility
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
      
      // Using the Clipboard API for rich text
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });

      navigator.clipboard.write([clipboardItem]).then(() => {
        alert('Konten berhasil disalin! Buka Google Dokumen dan tempel (Ctrl+V/Cmd+V).');
        window.open('https://docs.google.com/document/create', '_blank');
      }).catch(err => {
        console.error('Gagal menyalin konten HTML: ', err);
        // Fallback to plain text if rich text fails
        const plainText = outputElement.innerText;
        navigator.clipboard.writeText(plainText).then(() => {
            alert('Konten disalin sebagai teks biasa. Buka Google Dokumen dan tempel.');
            window.open('https://docs.google.com/document/create', '_blank');
        }).catch(err2 => {
            console.error('Gagal menyalin teks biasa: ', err2);
            alert('Gagal menyalin konten. Silakan coba salin manual.');
        });
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={handleCopyToGoogleDocs}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
        </svg>
        Salin & Buka di Google Dokumen
      </button>
      <div 
        id="rpm-output-content"
        className="border border-gray-300 rounded-md p-4 bg-white overflow-auto h-[70vh]"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};