import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-teal-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Kementerian_Agama_new_logo.png/330px-Kementerian_Agama_new_logo.png" alt="Logo Kemenag" className="h-12 w-12 mr-4" />
                <div>
                    <h1 className="text-2xl font-bold text-white">RPM KBC Generator</h1>
                    <p className="text-md text-teal-200">MTsN 4 Jombang</p>
                </div>
            </div>
        </header>
    );
};