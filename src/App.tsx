import React, { useState, useCallback } from 'react';
import { RPMForm } from './components/RPMForm';
import { RPMOutput } from './components/RPMOutput';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { RPMInput } from './types';
import { generateRPM, MISSING_API_KEY_ERROR } from './services/geminiService';
import { Notification } from './components/Notification';

const loadingMessages = [
  'Menganalisis tujuan pembelajaran...',
  'Merancang kegiatan inti yang menarik...',
  'Menyiapkan placeholder untuk visual...',
  'Mengintegrasikan nilai-nilai KBC...',
  'Menyiapkan asesmen dan lampiran...',
  'Menyelesaikan dokumen akhir...',
];

const spinnerColors = [
  'text-cyan-500',
  'text-indigo-500',
  'text-purple-500',
  'text-pink-500',
  'text-orange-500',
  'text-teal-500',
];

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-50 text-red-800 p-4 rounded-lg border-l-4 border-red-500 flex items-start space-x-3" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
            <p className="font-bold">Terjadi Kesalahan</p>
            <p className="text-sm">{message}</p>
        </div>
    </div>
);

const ConfigErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-amber-50 text-amber-900 p-4 rounded-lg border-l-4 border-amber-500 flex items-start space-x-3" role="alert">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
           <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
       </svg>
        <div>
            <p className="font-bold">Konfigurasi Dibutuhkan</p>
            <p className="text-sm">{message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRpm, setGeneratedRpm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [view, setView] = useState<'form' | 'output'>('form');
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [colorIndex, setColorIndex] = useState<number>(0);

  const handleFormSubmit = useCallback(async (data: RPMInput) => {
    setView('output');
    setIsLoading(true);
    setGeneratedRpm('');
    setError(null);
    setIsConfigError(false);
    setLoadingProgress(0);
    setCurrentLoadingMessage(loadingMessages[0]);
    setColorIndex(0);

    try {
      const stream = await generateRPM(data);
      let chunkCount = 0;
      // Change message every N chunks to show progress through stages
      const messageChangeChunkInterval = 10; 
      
      // Give an initial small progress bump to show instant feedback
      setTimeout(() => setLoadingProgress(5), 100);

      for await (const chunk of stream) {
        setGeneratedRpm(prev => prev + chunk.text);
        
        // Update progress with a non-linear curve for a more natural feel
        // It moves faster at the start and slows down as it approaches 95%
        setLoadingProgress(prev => Math.min(95, prev + (95 - prev) * 0.05));

        chunkCount++;
        // Update loading message and color based on the number of chunks processed
        const nextMessageIndex = Math.min(loadingMessages.length - 1, Math.floor(chunkCount / messageChangeChunkInterval));
        setCurrentLoadingMessage(loadingMessages[nextMessageIndex]);
        setColorIndex(nextMessageIndex);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        if (e.message === MISSING_API_KEY_ERROR) {
            setIsConfigError(true);
        }
        setError(e.message);
      } else {
        setError('Gagal menghasilkan RPM. Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, []);

  const handleBackToForm = useCallback(() => {
    setView('form');
  }, []);

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 lg:p-12">
        {view === 'form' ? (
          <div className="bg-white p-8 rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 no-print">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Formulir Input <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-600">RPM</span></h2>
            <p className="mb-8 text-slate-500">Isi semua kolom di bawah ini untuk menghasilkan Rencana Pembelajaran Mendalam (RPM) secara otomatis.</p>
            <RPMForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 print-container">
             <h2 className="text-3xl font-bold text-slate-800 mb-6 no-print">Hasil <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-600">RPM</span> Anda</h2>
            
            {isLoading && <LoadingScreen message={currentLoadingMessage} progress={loadingProgress} color={spinnerColors[colorIndex]} />}

            {error && (isConfigError ? <ConfigErrorDisplay message={error} /> : <ErrorDisplay message={error} />)}

            {!isLoading && !error && generatedRpm && (
                <RPMOutput 
                    htmlContent={generatedRpm} 
                    isGenerating={isLoading} 
                    onBack={handleBackToForm}
                    showBackButton={!isLoading}
                />
            )}
            
            {!isLoading && error && (
                 <div className="mt-6 no-print">
                    <button
                        onClick={handleBackToForm}
                        className="w-full sm:w-auto bg-white text-slate-700 font-bold py-3 px-6 rounded-lg border-2 border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Kembali ke Formulir
                    </button>
                </div>
            )}
          </div>
        )}
      </main>
      <Footer />
      {showNotification && (
        <Notification onClose={() => setShowNotification(false)} />
      )}
    </div>
  );
};

export default App;