import React, { useState, useCallback, useEffect } from 'react';
import { RPMForm } from './components/RPMForm';
import { RPMOutput } from './components/RPMOutput';
import { Spinner } from './components/Spinner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { RPMInput } from './types';
import { generateRPM, MISSING_API_KEY_ERROR } from './services/geminiService';

const loadingMessages = [
  'Menganalisis tujuan pembelajaran...',
  'Merancang kegiatan inti yang menarik...',
  'Mengintegrasikan nilai-nilai KBC...',
  'Menyiapkan asesmen dan lampiran...',
  'Menyelesaikan dokumen akhir...',
];

const Placeholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-teal-50/50 rounded-lg p-8 border-2 border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-teal-700">Selamat Datang di RPM KBC Generator</h3>
        <p className="mt-2">Output Rencana Pembelajaran Mendalam (RPM) Anda akan muncul di sini.</p>
        <p className="mt-1 text-sm">Isi formulir di sebelah kiri, atau gunakan data contoh untuk memulai.</p>
    </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="text-red-600 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p>{message}</p>
        </div>
    </div>
);

const ConfigErrorDisplay = ({ message }: { message: string }) => (
    <div className="text-orange-800 bg-orange-100 p-4 rounded-lg border border-orange-300 flex items-start space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
            <p className="font-semibold">Konfigurasi Dibutuhkan</p>
            <p>{message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRpm, setGeneratedRpm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setCurrentLoadingMessage(loadingMessages[0]);
      interval = window.setInterval(() => {
        setCurrentLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);


  const handleFormSubmit = useCallback(async (data: RPMInput) => {
    setIsLoading(true);
    setGeneratedRpm('');
    setError(null);
    setIsConfigError(false);
    try {
      const result = await generateRPM(data);
      setGeneratedRpm(result);
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
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Formulir Input Rencana Pembelajaran</h2>
            <p className="mb-6 text-gray-600">Isi semua kolom di bawah ini untuk menghasilkan Rencana Pembelajaran Mendalam (RPM) secara otomatis.</p>
            <RPMForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
             <h2 className="text-2xl font-bold text-teal-700 mb-4">Hasil Rencana Pembelajaran (RPM)</h2>
            {isLoading && <Spinner message={currentLoadingMessage} />}
            {error && isConfigError && <ConfigErrorDisplay message={error} />}
            {error && !isConfigError && <ErrorDisplay message={error} />}
            {!isLoading && !generatedRpm && !error && <Placeholder />}
            {generatedRpm && <RPMOutput htmlContent={generatedRpm} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;