import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { RPMInput, IntegrationOption } from '../types';

const SYSTEM_INSTRUCTION = `Anda adalah asisten ahli dalam pembuatan Rencana Pembelajaran Mendalam (RPM) untuk kurikulum madrasah di Indonesia, khususnya untuk MTsN 4 Jombang. Tugas Anda adalah membuat dokumen RPM yang lengkap, terstruktur, dan siap pakai dalam format HTML. Ikuti struktur dan instruksi di bawah ini dengan SANGAT TELITI menggunakan Ejaan Bahasa Indonesia yang baik dan benar. Pastikan semua teks berwarna hitam atau sangat gelap agar kontrasnya tinggi dan mudah dibaca. Jangan gunakan sintaks Markdown seperti **teks tebal** di dalam output HTML Anda; sebagai gantinya, gunakan tag HTML yang sesuai seperti \`<b>\` atau \`<strong>\`.

**INSTRUKSI UNTUK VISUAL DAN SUMBER DAYA EKSTERNAL:**
Jika materi pelajaran dapat diperkaya dengan visual (gambar, diagram, video) atau sumber daya online (simulasi, artikel), Anda HARUS menyediakan tautan langsung ke sumber daya tersebut menggunakan format placeholder berikut. JANGAN memberikan deskripsi atau saran visual jika tautan tidak tersedia; lewati saja.

1.  **Untuk Tautan Visual/Sumber Daya:** Gunakan format \`[Visual: https://contoh.link/sumberdaya]\`. Sistem akan mengubah ini menjadi tautan yang dapat diklik. Contoh: \`[Visual: https://www.youtube.com/watch?v=some_video]\`.

2.  **Untuk Kode QR (Akses Cepat):** Gunakan format \`[QR Code: https://contoh.link/sumberdaya]\` HANYA jika Anda ingin menyediakan akses cepat melalui pemindaian (misalnya untuk LKPD cetak). Sistem akan membuat kode QR dari tautan tersebut.`;

function createPrompt(data: RPMInput): string {
  const {
    teacherName,
    teacherNip,
    className,
    semester,
    subject,
    learningObjectives,
    subjectMatter,
    language,
    meetings,
    pedagogicalPractices,
    graduateDimensions,
    integrationOption
  } = data;

  const practicesText = pedagogicalPractices
    .map((practice, index) => `Pertemuan ${index + 1}: ${practice}`)
    .join(', ');

  const kbcInstruction = `
    **INSTRUKSI INTEGRASI KBC (PENTING DAN SELALU DITERAPKAN):**
    Setiap kali Anda mengintegrasikan nilai dari "Topik Panca Cinta" (Kurikulum Berbasis Cinta/KBC) ke dalam aktivitas atau penjelasan, Anda HARUS:
    1. Membungkus teks yang relevan dengan tag \`<span style="background-color: #FDB5EE;">\`.
    2. Mengakhiri teks yang disorot dengan label tebal: \`<b>(KBC)</b>\`.
  `;

  let integrationPrompt = '';
  if (integrationOption === IntegrationOption.SRA) {
    integrationPrompt = `
      **INSTRUKSI TAMBAHAN (SRA):**
      Integrasikan prinsip-prinsip Satuan Pendidikan Ramah Anak (SRA) berikut ke dalam aktivitas pembelajaran:
      - **Inklusif & Non-Diskriminatif:** Pastikan semua siswa merasa diterima dan dihargai tanpa memandang latar belakang.
      - **Partisipatif:** Rancang kegiatan yang mendorong siswa untuk aktif menyuarakan pendapat dan terlibat dalam pengambilan keputusan.
      - **Disiplin Positif:** Terapkan pendekatan disiplin tanpa kekerasan fisik/psikis dan tidak merendahkan martabat siswa dalam skenario interaksi guru-siswa.
      - **Penanda dan Pewarnaan (PENTING):**
        - Untuk setiap bagian yang secara eksplisit mengintegrasikan nilai SRA, bungkus teks yang relevan dalam tag \`<span style="background-color: #37E69A;">\`.
        - AKHIRI teks yang disorot dengan penanda tebal yang spesifik, yang menjelaskan prinsip SRA yang sedang diintegrasikan. Contoh: \`<b>(Prinsip Partisipasi Anak)</b>\`, \`<b>(Pendekatan Disiplin Positif)</b>\`, atau \`<b>(Prinsip Inklusivitas)</b>\`. JANGAN gunakan label generik "Insersi Nilai SRA".
    `;
  } else if (integrationOption === IntegrationOption.TKA) {
    integrationPrompt = `
      **INSTRUKSI TAMBAHAN (TKA):**
      Sisipkan kompetensi TKA Literasi (pemahaman tekstual, inferensi, evaluasi) dan TKA Numerasi (interpretasi data, penalaran, pemecahan masalah) ke dalam modul ajar ini.
      Fokuskan modifikasi pada:
      - Aktivitas: Menggunakan stimulus (teks, infografis, tabel, atau studi kasus) yang relevan dengan materi.
      - Asesmen: Mengukur kemampuan penalaran dan analisis siswa terhadap stimulus tersebut.
      - **Penanda dan Pewarnaan (PENTING):**
        - Untuk setiap bagian yang dimodifikasi untuk integrasi TKA, bungkus teks yang relevan dalam tag \`<span style="background-color: #F0F32B;">\`.
        - Setelah teks yang disorot, tambahkan penanda tebal yang spesifik, yang menjelaskan kompetensi TKA yang sedang diperkuat. Contoh: \`<b>(Penguatan Literasi: Evaluasi Teks)</b>\`, \`<b>(Penguatan Numerasi: Interpretasi Data)</b>\`, atau \`<b>(Penguatan Numerasi: Pemecahan Masalah)</b>\`. JANGAN gunakan label generik "Penguatan Literasi" atau "Penguatan Numerasi".
      Pastikan untuk secara cerdas memilih antara Literasi atau Numerasi dan kompetensi spesifiknya untuk setiap modifikasi yang Anda buat.

      **INSTRUKSI ASESMEN KHUSUS TKA (SANGAT PENTING):**
      Saat membuat soal untuk asesmen formatif dan sumatif, Anda HARUS mengikuti format soal HOTS (Higher-Order Thinking Skills) berbasis TKA yang mengukur <b>PENALARAN</b>, bukan sekadar hafalan.
      
      <b>Format Wajib untuk Setiap Soal:</b>
      <ol style="list-style-type: none; padding-left: 0;">
        <li><b>1. Stimulus:</b> Awali SETIAP soal dengan stimulus yang relevan dengan materi. Stimulus dapat berupa:<br/>
        - Teks singkat (artikel, berita, kutipan)<br/>
        - Data (tabel, statistik)<br/>
        - Visual (deskripsi grafik, diagram, gambar, poster, atau infografis)<br/>
        - Studi kasus singkat</li>
        <li><b>2. Pertanyaan:</b> Buat pertanyaan yang menuntut siswa untuk:<br/>
        - <b>Menganalisis:</b> Menguraikan informasi dari stimulus.<br/>
        - <b>Mengevaluasi:</b> Memberikan penilaian atau argumen berdasarkan stimulus.<br/>
        - <b>Menciptakan:</b> Menghasilkan ide atau solusi baru dari stimulus.<br/>
        - <b>Menghubungkan:</b> Mengaitkan konsep dalam stimulus dengan konteks lain.</li>
      </ol>
      <b>Contoh Struktur:</b><br/>
      <i>[STIMULUS: Sebuah infografis tentang siklus air]</i><br/>
      <b>Pertanyaan:</b> Berdasarkan infografis tersebut, apa yang akan terjadi pada ketersediaan air tanah jika sebagian besar hutan di area tersebut ditebang? Jelaskan alasanmu. <b>(Penguatan Numerasi: Interpretasi Data)</b>
    `;
  }
    
  let lkpdInstructions = '';
  for (let i = 0; i < meetings; i++) {
    const meetingNumber = i + 1;
    const practice = pedagogicalPractices[i];
    lkpdInstructions += `
        <br class="page-break" />
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
    `;
  }

  let openingInstruction: string;
  let closingInstruction: string;

  switch (language) {
    case 'Bahasa Arab':
      openingInstruction = `**Mulai kegiatan awal dengan salam pembuka Islami yang interaktif dalam Bahasa Arab. PENTING: Tuliskan transliterasi Latin terlebih dahulu, diikuti dengan teks Arab asli dalam tanda kurung. Contoh: 'Assalamu'alaikum warahmatullahi wabarakatuh (السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ). Kaifa halukum jamian? (كَيْفَ حَالُكُمْ جَمِيْعًا؟) Mari kita mulai pelajaran hari ini dengan membaca doa bersama.' Buatlah kalimat yang mengajak siswa berinteraksi, BUKAN hanya salam saja.**`;
      closingInstruction = `**Akhiri kegiatan penutup dengan kalimat penutup yang interaktif dalam Bahasa Arab. PENTING: Tuliskan transliterasi Latin terlebih dahulu, diikuti dengan teks Arab asli dalam tanda kurung. Contoh: 'Alhamdulillah, kita telah menyelesaikan pelajaran hari ini. Hayya nakhtatim darsana bi qira'ati hamdalah (هيا نختتم درسنا بقراءة الحمدلة). Wassalamu'alaikum warahmatullahi wabarakatuh (وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ).' Buatlah kalimat penutup yang baik, BUKAN hanya salam saja.**`;
      break;
    case 'Bahasa Inggris':
      openingInstruction = `**Mulai kegiatan awal ini dengan salam pembuka yang interaktif dalam Bahasa Inggris. Contohnya, 'Good morning, class! How is everyone today? Let's start our lesson by...' Buatlah kalimat yang mengajak siswa berinteraksi, BUKAN hanya salam saja.**`;
      closingInstruction = `**Akhiri kegiatan penutup ini dengan kalimat penutup yang interaktif dalam Bahasa Inggris. Contohnya, 'Alright everyone, that's all for today. Do you have any questions? See you next time! Good bye.' Buatlah kalimat penutup yang baik, BUKAN hanya salam saja.**`;
      break;
    default:
      openingInstruction = `**Mulai kegiatan awal dengan salam pembuka.**`;
      closingInstruction = `**Akhiri kegiatan penutup dengan salam penutup.**`;
  }

  let assessmentSectionHtml = `
    <br class="page-break" />
    <h3><b>Lampiran ${meetings + 1}: Instrumen Asesmen</b></h3>
      <h4><b>A. Asesmen Diagnostik (Awal)</b></h4>
      <p>Buat 5 soal pertanyaan pemantik atau kuis singkat yang relevan dengan materi, beserta kunci jawabannya, untuk mengukur pemahaman awal siswa.</p>
      
      <h4><b>B. Instrumen Asesmen Formatif</b></h4>
      <p><b>PENTING:</b> Buat instrumen yang relevan dengan metode asesmen formatif yang Anda jelaskan di bagian E.2. Misalnya: Jika penilaian LKPD, buat rubrik penilaian detail untuk setiap LKPD. Jika observasi, buat lembar ceklis observasi partisipasi siswa.</p>
      
      <h4><b>C. Instrumen Asesmen Sumatif</b></h4>
      <p><b>PENTING:</b> Buat instrumen yang relevan dengan metode asesmen sumatif yang Anda jelaskan di bagian E.3. Misalnya: Jika tes tulis, buat 5-10 soal pilihan ganda atau esai lengkap dengan kunci jawaban dan pedoman penskoran. Jika penilaian proyek/produk, buat rubrik penilaian yang komprehensif.</p>
      
      <h4><b>D. Rubrik Penilaian Sikap</b></h4>
      <p>Buat satu tabel rubrik HTML untuk menilai sikap siswa yang mencakup dimensi lulusan yang dipilih (misalnya: Bernalar Kritis, Kreatif, Gotong Royong, dll.).</p>
  `;

  if (integrationOption === IntegrationOption.TKA) {
    assessmentSectionHtml = `
    <br class="page-break" />
    <h3><b>Lampiran ${meetings + 1}: Instrumen Asesmen</b></h3>
      <h4><b>A. Asesmen Diagnostik (Awal)</b></h4>
      <p>Buat 5 soal pertanyaan pemantik atau kuis singkat yang relevan dengan materi, beserta kunci jawabannya, untuk mengukur pemahaman awal siswa.</p>
      
      <h4><b>B. Instrumen Asesmen Formatif (Berbasis TKA)</b></h4>
      <p>Buatlah instrumen asesmen formatif (misalnya, soal analisis kasus dalam LKPD). Pastikan setiap soal mengikuti format HOTS berbasis TKA (Stimulus lalu Pertanyaan) seperti yang telah diinstruksikan sebelumnya, lengkap dengan kunci jawaban dan pedoman penskoran. Ingat untuk menerapkan penandaan TKA <span style="background-color: #F0F32B;">(warna kuning)</span> pada soal yang Anda buat.</p>
      
      <h4><b>C. Instrumen Asesmen Sumatif (Berbasis TKA)</b></h4>
      <p>Buatlah 5-10 soal untuk asesmen sumatif (bisa pilihan ganda atau esai). Pastikan setiap soal mengikuti format HOTS berbasis TKA (Stimulus lalu Pertanyaan) seperti yang telah diinstruksikan sebelumnya, lengkap dengan kunci jawaban dan pedoman penskoran. Ingat untuk menerapkan penandaan TKA <span style="background-color: #F0F32B;">(warna kuning)</span> pada soal yang Anda buat.</p>
      
      <h4><b>D. Rubrik Penilaian Sikap</b></h4>
      <p>Buat satu tabel rubrik HTML untuk menilai sikap siswa yang mencakup dimensi lulusan yang dipilih (misalnya: Bernalar Kritis, Kreatif, Gotong Royong, dll.).</p>
    `;
  }


  return `
    Berdasarkan input berikut:
    - Nama Guru: ${teacherName}
    - NIP Guru: ${teacherNip}
    - Kelas: ${className}
    - Semester: ${semester}
    - Mata Pelajaran: ${subject}
    - Tujuan Pembelajaran: ${learningObjectives}
    - Materi Pelajaran: ${subjectMatter}
    - Bahasa Pembuka/Penutup: ${language}
    - Jumlah Pertemuan: ${meetings}
    - Praktik Pedagogis per Pertemuan: ${practicesText}
    - Dimensi Lulusan: ${graduateDimensions.join(', ')}
    - Opsi Integrasi: ${integrationOption}

    ${kbcInstruction}
    ${integrationPrompt}

    **ATURAN GAYA PENTING (PERATAAN TEKS):** Untuk semua teks paragraf di dalam kolom "Isi" pada tabel RPM utama, Anda HARUS menerapkan gaya rata kanan-kiri (\`style="text-align: justify;"\`). Namun, untuk SEMUA konten di dalam bagian LAMPIRAN (termasuk LKPD dan Asesmen), gunakan perataan teks kiri standar (JANGAN tambahkan gaya \`text-align\`).

    **ATURAN PEMISAH HALAMAN (SANGAT PENTING):**
    Untuk memulai halaman baru, sisipkan tag **hanya-satu** \`<br class="page-break" />\` TEPAT SEBELUM elemen judul (\`<h2>\` atau \`<h3>\`) dari setiap bagian yang harus memulai halaman baru. Ini berlaku untuk judul utama "Lampiran" dan untuk setiap sub-lampiran (misalnya, "Lampiran 1", "Lampiran 2", "Instrumen Asesmen").
    **DILARANG KERAS:** Jangan pernah menggunakan \`<div class="page-break">\` atau menerapkan gaya CSS \`page-break-before: always\` secara langsung pada elemen lain seperti \`<p>\`, \`<div>\`, \`<li>\`, atau di dalam tabel. Metode \`<br class="page-break" />\` adalah satu-satunya cara yang diizinkan.

    **ATURAN KONTEN BERSIH (SANGAT PENTING):**
    JANGAN PERNAH membuat tag HTML yang kosong atau hanya berisi spasi. Contoh yang DILARANG: \`<p></p>\`, \`<p>&nbsp;</p>\`, \`<li></li>\`. Setiap tag harus berisi konten yang substantif untuk mencegah adanya baris-baris kosong yang tidak perlu dalam dokumen akhir.

    **STRUKTUR OUTPUT HTML UTAMA:**

    Gunakan sebuah div kontainer utama dengan gaya \`style="color: #000;"\`. Di dalamnya, buatlah struktur berikut:

    1.  **Tabel RPM (Dua Kolom):** Buat sebuah tabel HTML (\`<table>\`) dengan kelas 'w-full border-collapse'. Kolom pertama adalah "Komponen" dan kedua "Isi". 
        - Gunakan \`<thead>\` untuk header.
        - Gunakan \`<tbody>\` untuk konten.
        - Untuk setiap baris komponen, gunakan \`<tr>\`.
        - Kolom "Komponen" (\`<td>\`) harus bold dan rata atas (\`style="font-weight: bold; vertical-align: top; width: 30%; padding: 8px; border: 1px solid #ddd;"\`).
        - Kolom "Isi" (\`<td>\`) harus diberi gaya \`style="padding: 8px; border: 1px solid #ddd;"\`. Gunakan aturan gaya umum untuk perataan teks paragraf di dalamnya.
        - Untuk header seksi seperti "IDENTITAS", gunakan \`<tr style="background-color: #f2f2f2;"><td colspan="2" style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">NAMA SEKSI</td></tr>\`.

    **Isi Tabel RPM:**

    a. **IDENTITAS**
       - Nama Madrasah: MTsN 4 Jombang
       - Mata Pelajaran: ${subject}
       - Kelas/Semester: ${className} / ${semester}
       - Durasi Pertemuan: ${meetings} x (2 x 40 menit)

    b. **IDENTIFIKASI**
       - Siswa: Generate deskripsi singkat karakteristik umum siswa kelas ${className} di madrasah tsaniyah.
       - Materi Pelajaran: ${subjectMatter}
       - Capaian Dimensi Lulusan: ${graduateDimensions.join(', ')}
       - Topik Panca Cinta: Analisislah materi pelajaran dan tujuan pembelajaran untuk memilih 2-3 dimensi Kurikulum Berbasis Cinta (KBC) yang paling relevan dari daftar berikut: [Cinta Allah dan Rasul-Nya, Cinta Ilmu, Cinta Lingkungan, Cinta Diri dan Sesama, Cinta Tanah Air].
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
       - Memahami (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan awal. ${openingInstruction} Setelah menjelaskan tujuan, tambahkan satu paragraf singkat untuk membangun koneksi emosional siswa dengan mengaitkan materi pada salah satu nilai KBC (ingat untuk menerapkan penanda dan pewarnaan KBC sesuai instruksi di atas).
       - Mengaplikasi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan inti detail untuk setiap pertemuan sesuai sintaks dari praktik pedagogis masing-masing (${practicesText}). Tambahkan instruksi spesifik untuk mendorong refleksi nilai KBC dalam aktivitas (ingat untuk menerapkan penanda dan pewarnaan KBC sesuai instruksi di atas).
       - Refleksi (berkesadaran, bermakna, menggembirakan): Generate langkah-langkah kegiatan penutup. ${closingInstruction}

    e. **ASESMEN PEMBELAJARAN**
       - Asesmen Awal (diagnostik/apersepsi): Jelaskan metode asesmen awal (misal: pertanyaan pemantik lisan, kuis singkat).
       - Asesmen Formatif (for/as learning): Jelaskan metode asesmen formatif (misal: observasi partisipasi, penilaian LKPD, penilaian antar teman).
       - Asesmen Sumatif (of learning): Jelaskan metode asesmen sumatif (misal: tes tulis di akhir bab, penilaian proyek, presentasi).

    2.  **Tanda Tangan:** Setelah tabel utama, buatlah sebuah tabel baru untuk bagian tanda tangan dengan gaya \`<table style="width: 100%; border: none; text-align: center; margin-top: 0;">\`. PASTIKAN TIDAK ADA MARGIN SEBELUM ATAU SESUDAH TABEL INI. Tabel ini harus memiliki satu baris (\`<tr>\`) dan dua kolom (\`<td>\`).
        - Kolom kiri: \`<td style="width: 50%; border: none; line-height: 1.2;">Mengetahui,<br/>Kepala MTsN 4 Jombang<br/><br/><br/><b>Sulthon Sulaiman, M.Pd.I.</b><br/>NIP. 19810616 2005011003</td>\`
        - Kolom kanan: \`<td style="width: 50%; border: none; line-height: 1.2;">Jombang, [Generate tanggal hari ini format DD MMMM YYYY]<br/>Guru Mata Pelajaran<br/><br/><br/><b>${teacherName}</b><br/>NIP. ${teacherNip}</td>\`

    3.  **LAMPIRAN:** Gunakan \`<br class="page-break" /><h2 style="text-align: center; font-size: 36px; font-weight: bold;">LAMPIRAN-LAMPIRAN</h2>\` untuk memulai di halaman baru.
        ${lkpdInstructions}
        ${assessmentSectionHtml}

    Pastikan seluruh output adalah satu blok kode HTML yang valid dan rapi.
    `;
}

export const MISSING_API_KEY_ERROR = "Kunci API Gemini tidak ditemukan. Harap konfigurasikan variabel lingkungan `API_KEY` di pengaturan deployment Anda (misalnya, di Netlify: Site settings > Build & deploy > Environment).";

export const generateRPM = async (data: RPMInput): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const prompt = createPrompt(data);

    const response = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Terjadi masalah saat berkomunikasi dengan layanan AI. Pastikan kunci API Anda valid. (Detail: ${error.message})`);
    }
    throw new Error("Gagal berkomunikasi dengan layanan AI. Terjadi kesalahan yang tidak diketahui.");
  }
};