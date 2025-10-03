import React from 'react';

interface SpinnerProps {
    message: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600 font-medium">AI sedang bekerja...</p>
    <p className="mt-2 text-sm text-gray-500 text-center transition-opacity duration-500">{message}</p>
  </div>
);