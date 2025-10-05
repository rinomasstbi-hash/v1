import { GoogleGenAI } from "@google/genai";
import type { RPMInput } from '../types';

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
    
  let lkpdInstructions = '';
  for (let i = 0; i < meetings; i++) {
    const meetingNumber = i + 1;
    const practice = pedagogicalPractices[i];
    lkpdInstructions += `
        <div style="page-break-before: always;">
        <h3><b>Lampiran ${meetingNumber}: Lembar Kerja Peserta Didik (Pertemuan Ke-${meetingNumber})</b></h3>
          <p><b>PENTING:</b> Desain LKPD ini secara spesifik untuk mendukung praktik pedagogis <b>${practice}</b>.</p>
          <h4><b>A. Identitas</b></h4>
          <p>Nama: _______________________<br>
             Kelas: ${className}<br>
             No. Absen: _______________________<br>
             Pertemuan Ke: ${meetingNumber}</p>
          <h4><b>B. Petunjuk Penggunaan</b></h4>
          <p>Jelaskan cara mengerjakan LKPD yang disesuaikan dengan sintaks dari <b>${practice}</b>.</p>
          <h4><b>C. Kegiatan Pembelajaran (Sintaks: ${practice})</b></h4>
          <p>Integrasikan sintaks dan pengalaman belajar tanpa menggunakan tabel. Buat kegiatan yang relevan dengan sintaks <b>${practice}</b>. Misalnya, jika PjBL, fokus pada langkah-langkah proyek. Jika Inquiry-Discovery, fokus pada pertanyaan penuntun dan observasi.</p>
            <h5><b>1. Memahami</b></h5>
            <p>Sajikan ringkasan materi singkat yang relevan untuk pertemuan ini + 2-3 pertanyaan pemahaman kunci.</p>
            <h5><b>2. Mengaplikasikan</b></h5>
            <p>Berikan 1 tugas inti atau studi kasus yang mencerminkan sintaks <b>${practice}</b> secara nyata, dengan instruksi yang jelas.</p>
            <h5><b>3. Merefleksikan</b></h5>
            <p>Berikan 2-3 pertanyaan refleksi yang mendalam terkait pengalaman belajar siswa menggunakan metode <b>${practice}</b> pada pertemuan ini.</p>
          <h4><b>D. Penutup</b></h4>
          <p>Berikan sebuah kalimat penyemangat dan checklist pemahaman diri sederhana.</p>
        </div>
    `;
  }

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
       - Mengaplikasi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan inti detail untuk setiap pertemuan sesuai sintaks dari praktik pedagogis masing-masing (${practicesText}). Tambahkan instruksi spesifik untuk mendorong refleksi nilai KBC dalam aktivitas.
       - Refleksi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan penutup. **Akhiri kegiatan penutup ini dengan salam penutup yang sesuai dalam ${language}.**

    e. **ASESMEN PEMBELAJARAN**
       - Asesmen Awal (diagnostik/apersepsi): Jelaskan metode asesmen awal (misal: pertanyaan pemantik lisan, kuis singkat).
       - Asesmen Formatif (for/as learning): Jelaskan metode asesmen formatif (misal: observasi partisipasi, penilaian LKPD, penilaian antar teman).
       - Asesmen Sumatif (of learning): Jelaskan metode asesmen sumatif (misal: tes tulis di akhir bab, penilaian proyek, presentasi).

    2.  **Tanda Tangan:** Setelah tabel utama, buatlah sebuah tabel baru untuk bagian tanda tangan dengan gaya \`<table style="width: 100%; margin-top: 40px; border: none; text-align: center;">\`. Tabel ini harus memiliki satu baris (\`<tr>\`) dan dua kolom (\`<td>\`).
        - Kolom kiri: \`<td style="width: 50%; border: none; line-height: 1.2;">Mengetahui,<br/>Kepala MTsN 4 Jombang<div style="height: 60px;"></div><b>Sulthon Sulaiman, M.Pd.I.</b><br/>NIP. 19810616 2005011003</td>\`
        - Kolom kanan: \`<td style="width: 50%; border: none; line-height: 1.2;">Jombang, [Generate tanggal hari ini format DD MMMM YYYY]<br/>Guru Mata Pelajaran<div style="height: 60px;"></div><b>${teacherName}</b><br/>NIP. ${teacherNip}</td>\`

    3.  **LAMPIRAN:** Gunakan \`<div style="page-break-before: always;"><h2>Lampiran</h2></div>\` untuk memulai di halaman baru.
        ${lkpdInstructions}
        <div style="page-break-before: always;">
        <h3><b>Lampiran ${meetings + 1}: Instrumen Asesmen</b></h3>
          <h4><b>A. Asesmen Diagnostik (Awal)</b></h4>
          <p>Buat 5 soal pertanyaan pemantik atau kuis singkat yang relevan dengan materi, beserta kunci jawabannya, untuk mengukur pemahaman awal siswa.</p>
          
          <h4><b>B. Instrumen Asesmen Formatif</b></h4>
          <p><b>PENTING:</b> Buat instrumen yang relevan dengan metode asesmen formatif yang Anda jelaskan di bagian E.2. Misalnya: Jika penilaian LKPD, buat rubrik penilaian detail untuk setiap LKPD. Jika observasi, buat lembar ceklis observasi partisipasi siswa.</p>
          
          <h4><b>C. Instrumen Asesmen Sumatif</b></h4>
          <p><b>PENTING:</b> Buat instrumen yang relevan dengan metode asesmen sumatif yang Anda jelaskan di bagian E.3. Misalnya: Jika tes tulis, buat 5-10 soal pilihan ganda atau esai lengkap dengan kunci jawaban dan pedoman penskoran. Jika penilaian proyek/produk, buat rubrik penilaian yang komprehensif.</p>
          
          <h4><b>D. Rubrik Penilaian Sikap</b></h4>
          <p>Buat satu tabel rubrik HTML untuk menilai sikap siswa yang mencakup dimensi lulusan yang dipilih (misalnya: Bernalar Kritis, Kreatif, Gotong Royong, dll.).</p>
        </div>

    Pastikan seluruh output adalah satu blok kode HTML yang valid dan rapi.
    `;
}

export const MISSING_API_KEY_ERROR = "Kunci API Gemini tidak ditemukan. Harap konfigurasikan variabel lingkungan `API_KEY` di pengaturan deployment Anda (misalnya, di Netlify: Site settings > Build & deploy > Environment).";

export const generateRPM = async (data: RPMInput): Promise<string> => {
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
