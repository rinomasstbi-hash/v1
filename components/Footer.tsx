
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-8 py-4 border-t">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} MTsN 4 Jombang. Didukung oleh Teknologi AI Generatif.</p>
            </div>
        </footer>
    );
};
