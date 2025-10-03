import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- types.ts ---
enum PedagogicalPractice {
  INQUIRY_DISCOVERY = 'Inkuiri-Discovery',
  PJBL = 'PjBL',
  PROBLEM_SOLVING = 'Problem Solving',
  GAME_BASED = 'Game Based Learning',
  STATION_LEARNING = 'Station Learning',
}

enum GraduateDimension {
  FAITH = 'Keimanan & Ketakwaan',
  CITIZENSHIP = 'Kewargaan',
  CRITICAL_REASONING = 'Penalaran Kritis',
  CREATIVITY = 'Kreativitas',
  COLLABORATION = 'Kolaborasi',
  INDEPENDENCE = 'Kemandirian',
  HEALTH = 'Kesehatan',
  COMMUNICATION = 'Komunikasi',
}

interface RPMInput {
  teacherName: string;
  teacherNip: string;
  className: string;
  subject: string;
  learningObjectives: string;
  subjectMatter: string;
  language: 'Bahasa Inggris' | 'Bahasa Arab';
  meetings: number;
  pedagogicalPractices: PedagogicalPractice[];
  graduateDimensions: GraduateDimension[];
}

// --- constants.ts ---
const PEDAGOGICAL_PRACTICES: PedagogicalPractice[] = [
  PedagogicalPractice.INQUIRY_DISCOVERY,
  PedagogicalPractice.PJBL,
  PedagogicalPractice.PROBLEM_SOLVING,
  PedagogicalPractice.GAME_BASED,
  PedagogicalPractice.STATION_LEARNING,
];

const GRADUATE_DIMENSIONS: GraduateDimension[] = [
  GraduateDimension.FAITH,
  GraduateDimension.CITIZENSHIP,
  GraduateDimension.CRITICAL_REASONING,
  GraduateDimension.CREATIVITY,
  GraduateDimension.COLLABORATION,
  GraduateDimension.INDEPENDENCE,
  GraduateDimension.HEALTH,
  GraduateDimension.COMMUNICATION,
];


// --- services/geminiService.ts ---
const SYSTEM_INSTRUCTION = `Anda adalah asisten ahli dalam pembuatan Rencana Pembelajaran Mendalam (RPM) untuk kurikulum madrasah di Indonesia, khususnya untuk MTsN 4 Jombang. Tugas Anda adalah membuat dokumen RPM yang lengkap, terstruktur, dan siap pakai dalam format HTML. Ikuti struktur dan instruksi di bawah ini dengan SANGAT TELITI menggunakan Ejaan Bahasa Indonesia yang baik dan benar. Pastikan semua teks berwarna hitam atau sangat gelap agar kontrasnya tinggi dan mudah dibaca. Jangan gunakan sintaks Markdown seperti **teks tebal** di dalam output HTML Anda; sebagai gantinya, gunakan tag HTML yang sesuai seperti \`<b>\` atau \`<strong>\`.`;

function createPrompt(data: RPMInput): string {
  const {
    teacherName,
    teacherNip,
    className,
    subject,
    learningObjectives,
    subjectMatter,
    language,
    meetings,
    pedagogicalPractices,
    graduateDimensions
  } = data;

  const practicesText = pedagogicalPractices
    .map((practice, index) => `Pertemuan ${index + 1}: ${practice}`)
    .join(', ');

  return `
    Berdasarkan input berikut:
    - Nama Guru: ${teacherName}
    - NIP Guru: ${teacherNip}
    - Kelas: ${className}
    - Mata Pelajaran: ${subject}
    - Tujuan Pembelajaran: ${learningObjectives}
    - Materi Pelajaran: ${subjectMatter}
    - Bahasa Pembuka/Penutup: ${language}
    - Jumlah Pertemuan: ${meetings}
    - Praktik Pedagogis per Pertemuan: ${practicesText}
    - Dimensi Lulusan: ${graduateDimensions.join(', ')}

    **STRUKTUR OUTPUT HTML UTAMA:**

    Gunakan sebuah div kontainer utama dengan gaya \`style="color: #000;"\`. Di dalamnya, buatlah struktur berikut:

    1.  **Tabel RPM (Dua Kolom):** Buat sebuah tabel HTML (\`<table>\`) dengan kelas 'w-full border-collapse'. Kolom pertama adalah "Komponen" dan kedua "Isi". 
        - Gunakan \`<thead>\` untuk header.
        - Gunakan \`<tbody>\` untuk konten.
        - Untuk setiap baris komponen, gunakan \`<tr>\`.
        - Kolom "Komponen" (\`<td>\`) harus bold dan rata atas (\`style="font-weight: bold; vertical-align: top; width: 30%; padding: 8px; border: 1px solid #ddd;"\`).
        - Kolom "Isi" (\`<td>\`) harus rata kanan-kiri (\`style="text-align: justify; padding: 8px; border: 1px solid #ddd;"\`).
        - Untuk header seksi seperti "IDENTITAS", gunakan \`<tr style="background-color: #f2f2f2;"><td colspan="2" style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">NAMA SEKSI</td></tr>\`.

    **Isi Tabel RPM:**

    a. **IDENTITAS**
       - Nama Madrasah: MTsN 4 Jombang
       - Mata Pelajaran: ${subject}
       - Kelas/Semester: ${className} / [Generate semester ganjil/genap secara logis]
       - Durasi Pertemuan: ${meetings} x (2 x 40 menit)

    b. **IDENTIFIKASI**
       - Siswa: Generate deskripsi singkat karakteristik umum siswa kelas ${className} di madrasah tsaniyah.
       - Materi Pelajaran: ${subjectMatter}
       - Capaian Dimensi Lulusan: ${graduateDimensions.join(', ')}
       - Topik Panca Cinta: Pilih 2-3 dimensi Kurikulum Berbasis Cinta (KBC) yang paling relevan dari [Cinta Allah dan Rasul-Nya, Cinta Ilmu, Cinta Lingkungan, Cinta Diri dan Sesama, Cinta Tanah Air] berdasarkan materi pelajaran.
       - Materi Insersi: Untuk setiap Topik Panca Cinta yang dipilih, tuliskan satu kalimat singkat yang menggambarkan nilai cinta yang diintegrasikan dalam pembelajaran.

    c. **DESAIN PEMBELAJARAN**
       - Lintas Disiplin Ilmu: Generate 1-2 disiplin ilmu lain yang relevan dengan materi.
       - Tujuan Pembelajaran: ${learningObjectives}
       - Topik Pembelajaran: Buat judul topik yang lebih spesifik dan menarik dari input 'Materi Pelajaran'.
       - Praktik Pedagogis per Pertemuan: ${practicesText}
       - Kemitraan Pembelajaran: Generate saran kemitraan yang relevan (misal: orang tua, perpustakaan sekolah).
       - Lingkungan Pembelajaran: Generate saran lingkungan belajar yang sesuai (misal: di dalam kelas, di luar kelas, laboratorium).
       - Pemanfaatan Digital: Generate saran tools digital relevan beserta tautan (contoh: Quizizz, Canva, YouTube).

    d. **PENGALAMAN BELAJAR**
       - Memahami (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan awal. **Mulai kegiatan awal ini dengan salam pembuka yang sesuai dalam ${language}.** Setelah menjelaskan tujuan, tambahkan satu paragraf singkat untuk membangun koneksi emosional siswa dengan mengaitkan materi pada salah satu nilai KBC.
       - Mengaplikasi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan inti detail sesuai sintaks dari praktik pedagogis (${practicesText}). Tambahkan instruksi spesifik untuk mendorong refleksi nilai KBC dalam aktivitas.
       - Refleksi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan penutup. **Akhiri kegiatan penutup ini dengan salam penutup yang sesuai dalam ${language}.**

    e. **ASESMEN PEMBELAJARAN**
       - Asesmen Awal (diagnostik/apersepsi): Jelaskan metode asesmen awal (misal: pertanyaan pemantik lisan).
       - Asesmen Formatif (for/as learning): Jelaskan metode asesmen formatif (misal: observasi, penilaian LKPD).
       - Asesmen Sumatif (of learning): Jelaskan metode asesmen sumatif (misal: tes tulis, penilaian proyek).

    2.  **Tanda Tangan:** Setelah tabel utama, buatlah sebuah tabel baru untuk bagian tanda tangan dengan gaya \`<table style="width: 100%; margin-top: 40px; border: none;">\`. Tabel ini harus memiliki satu baris (\`<tr>\`) dan dua kolom (\`<td>\`). 
        - Kolom kanan: \`<td style="width: 50%; vertical-align: top; border: none; line-height: 1;">Jombang, [Generate tanggal hari ini format DD MMMM YYYY]<br/>Guru Mata Pelajaran<div style="height: 60px;"></div><b>${teacherName}</b><br/>NIP. ${teacherNip}</td>\`

    3.  **LAMPIRAN:** Gunakan \`<div style="page-break-before: always;">\` untuk memulai di halaman baru.
        - \`<h2>Lampiran</h2>\`
        - **Lampiran 1: Lembar Kerja Peserta Didik (LKPD)** (Buat LKPD yang LENGKAP)
          - \`<h3>A. Identitas</h3>\` (Nama, Kelas, No. Absen, dll.)
          - \`<h3>B. Petunjuk Penggunaan</h3>\`
          - \`<h3>C. Kegiatan Pembelajaran</h3>\` (Integrasikan sintaks dan pengalaman belajar tanpa tabel)
            - \`<h4>1. Memahami</h4>\` (Sajikan materi singkat + 3 pertanyaan pemahaman)
            - \`<h4>2. Mengaplikasikan</h4>\` (1 tugas studi kasus nyata + instruksi)
            - \`<h4>3. Merefleksikan</h4>\` (2-3 pertanyaan refleksi)
          - \`<h3>D. Penutup</h3>\` (Kata penyemangat + checklist pemahaman diri)
        - **Lampiran 2: Instrumen Asesmen**
          - \`<h4>Asesmen Awal</h4>\` (Buat 5 soal [pilih tipe soal yang sesuai] beserta kunci jawabannya)
          - \`<h4>Rubrik Penilaian Sikap</h4>\` (Buat tabel HTML 4x5 untuk menilai sikap)
          - \`<h4>Rubrik Penilaian Pengetahuan</h4>\` (Buat tabel HTML 4x5 untuk menilai pengetahuan)
          - \`<h4>Rubrik Penilaian Keterampilan</h4>\` (Buat tabel HTML 4x5 untuk menilai keterampilan)

    Pastikan seluruh output adalah satu blok kode HTML yang valid dan rapi.
    `;
}

const MISSING_API_KEY_ERROR = "Kunci API Gemini tidak ditemukan. Harap konfigurasikan variabel lingkungan `API_KEY` di pengaturan deployment Anda (misalnya, di Netlify: Site settings > Build & deploy > Environment).";

const generateRPM = async (data: RPMInput): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(data);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    // Clean the response from markdown fences
    let cleanedText = response.text.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    // Replace markdown bold with HTML bold tags to ensure proper rendering
    cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    return cleanedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error with a more user-friendly message, guiding them on how to fix it.
    if (error instanceof Error) {
        throw new Error(`Terjadi masalah saat berkomunikasi dengan layanan AI. Pastikan kunci API Anda valid. (Detail: ${error.message})`);
    }
    throw new Error("Gagal berkomunikasi dengan layanan AI. Terjadi kesalahan yang tidak diketahui.");
  }
};


// --- components/Spinner.tsx ---
const Spinner: React.FC<{ message: string; }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600 font-medium">AI sedang bekerja...</p>
    <p className="mt-2 text-sm text-gray-500 text-center transition-opacity duration-500">{message}</p>
  </div>
);

// --- components/Header.tsx ---
const Header: React.FC = () => {
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

// --- components/Footer.tsx ---
const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-8 py-4 border-t">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} MTsN 4 Jombang. Didukung oleh Teknologi AI Generatif.</p>
            </div>
        </footer>
    );
};


// --- components/RPMForm.tsx ---
interface RPMFormProps {
  onSubmit: (data: RPMInput) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean }> = ({ id, label, type = "text", value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);

const TextareaField: React.FC<{ id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number }> = ({ id, label, value, onChange, rows = 3 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);

const RPMForm: React.FC<RPMFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RPMInput>({
    teacherName: '',
    teacherNip: '',
    className: 'VII',
    subject: '',
    learningObjectives: '',
    subjectMatter: '',
    language: 'Bahasa Arab',
    meetings: 1,
    pedagogicalPractices: [PEDAGOGICAL_PRACTICES[0]],
    graduateDimensions: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RPMInput, string>>>({});

  useEffect(() => {
    const numMeetings = formData.meetings > 0 ? formData.meetings : 1;
    setFormData(prev => ({
      ...prev,
      pedagogicalPractices: Array.from({ length: numMeetings }, (_, i) => prev.pedagogicalPractices[i] || PEDAGOGICAL_PRACTICES[0])
    }));
  }, [formData.meetings]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'meetings' ? parseInt(value, 10) || 1 : value }));
  }, []);

  const handlePracticeChange = useCallback((index: number, value: PedagogicalPractice) => {
    setFormData(prev => {
      const newPractices = [...prev.pedagogicalPractices];
      newPractices[index] = value;
      return { ...prev, pedagogicalPractices: newPractices };
    });
  }, []);

  const handleDimensionChange = useCallback((dimension: GraduateDimension) => {
    setFormData(prev => {
      const newDimensions = prev.graduateDimensions.includes(dimension)
        ? prev.graduateDimensions.filter(d => d !== dimension)
        : [...prev.graduateDimensions, dimension];
      return { ...prev, graduateDimensions: newDimensions };
    });
  }, []);
  
  const handleFillExample = useCallback(() => {
    setFormData({
        teacherName: 'Ahmad Fauzi, S.Pd.',
        teacherNip: '198503152010011001',
        className: 'VIII',
        subject: 'Ilmu Pengetahuan Alam (IPA)',
        learningObjectives: 'Siswa mampu mengidentifikasi organ-organ sistem pencernaan manusia dan menjelaskan fungsi masing-masing organ dengan benar.',
        subjectMatter: 'Sistem Pencernaan Manusia',
        language: 'Bahasa Inggris',
        meetings: 2,
        pedagogicalPractices: [PedagogicalPractice.INQUIRY_DISCOVERY, PedagogicalPractice.PJBL],
        graduateDimensions: [GraduateDimension.CRITICAL_REASONING, GraduateDimension.COLLABORATION, GraduateDimension.CREATIVITY],
    });
  }, []);

  const validateForm = () => {
      const newErrors: Partial<Record<keyof RPMInput, string>> = {};
      if (!formData.teacherName.trim()) newErrors.teacherName = "Nama Guru wajib diisi.";
      if (!formData.teacherNip.trim()) newErrors.teacherNip = "NIP Guru wajib diisi.";
      if (!formData.subject.trim()) newErrors.subject = "Mata Pelajaran wajib diisi.";
      if (!formData.learningObjectives.trim()) newErrors.learningObjectives = "Tujuan Pembelajaran wajib diisi.";
      if (!formData.subjectMatter.trim()) newErrors.subjectMatter = "Materi Pelajaran wajib diisi.";
      if (formData.meetings < 1) newErrors.meetings = "Jumlah Pertemuan minimal 1.";
      if (formData.graduateDimensions.length === 0) newErrors.graduateDimensions = "Pilih minimal satu Dimensi Lulusan.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="teacherName" label="Nama Guru" value={formData.teacherName} onChange={handleChange} />
      {errors.teacherName && <p className="text-red-500 text-sm -mt-4">{errors.teacherName}</p>}
      <InputField id="teacherNip" label="NIP Guru" type="text" value={formData.teacherNip} onChange={handleChange} />
      {errors.teacherNip && <p className="text-red-500 text-sm -mt-4">{errors.teacherNip}</p>}
      
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
        <select id="className" name="className" value={formData.className} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>VII</option>
          <option>VIII</option>
          <option>IX</option>
        </select>
      </div>

      <InputField id="subject" label="Mata Pelajaran" value={formData.subject} onChange={handleChange} />
      {errors.subject && <p className="text-red-500 text-sm -mt-4">{errors.subject}</p>}
      <TextareaField id="learningObjectives" label="Tujuan Pembelajaran" value={formData.learningObjectives} onChange={handleChange} />
      {errors.learningObjectives && <p className="text-red-500 text-sm -mt-4">{errors.learningObjectives}</p>}
      <TextareaField id="subjectMatter" label="Materi Pelajaran" value={formData.subjectMatter} onChange={handleChange} />
      {errors.subjectMatter && <p className="text-red-500 text-sm -mt-4">{errors.subjectMatter}</p>}

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Bahasa Pembuka/Penutup</label>
        <select id="language" name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>Bahasa Arab</option>
          <option>Bahasa Inggris</option>
        </select>
      </div>
      
      <InputField id="meetings" label="Jumlah Pertemuan" type="number" value={formData.meetings.toString()} onChange={handleChange} />
       {errors.meetings && <p className="text-red-500 text-sm -mt-4">{errors.meetings}</p>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Praktik Pedagogis per Pertemuan</label>
        <div className="space-y-2">
        {Array.from({ length: formData.meetings > 0 ? formData.meetings : 1 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 w-24">Pertemuan {index + 1}:</span>
                <select 
                    value={formData.pedagogicalPractices[index] || ''}
                    onChange={(e) => handlePracticeChange(index, e.target.value as PedagogicalPractice)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                >
                    {PEDAGOGICAL_PRACTICES.map(practice => <option key={practice} value={practice}>{practice}</option>)}
                </select>
            </div>
        ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensi Lulusan (Pilih beberapa)</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {GRADUATE_DIMENSIONS.map(dim => (
            <label key={dim} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.graduateDimensions.includes(dim)}
                onChange={() => handleDimensionChange(dim)}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">{dim}</span>
            </label>
          ))}
        </div>
         {errors.graduateDimensions && <p className="text-red-500 text-sm mt-2">{errors.graduateDimensions}</p>}
      </div>

      <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? 'Memproses...' : 'Generate RPM'}
        </button>
        <button
          type="button"
          onClick={handleFillExample}
          disabled={isLoading}
          className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          Isi Contoh
        </button>
      </div>
    </form>
  );
};

// --- components/RPMOutput.tsx ---
interface RPMOutputProps {
  htmlContent: string;
}

const RPMOutput: React.FC<RPMOutputProps> = ({ htmlContent }) => {
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


// --- App.tsx ---
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

// --- main.tsx ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
