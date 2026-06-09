import { ExamPackage, Question } from '../types';

export const DEFAULT_PACKAGES: ExamPackage[] = [
  {
    id: "PKG-UTBK",
    name: "UTBK SNBT",
    category: "UTBK SNBT",
    description: "Tryout berskala nasional sesuai standar BPPP Kemendikbudristek. Paket Tryout ini dirancang secara detail untuk menguji ketahanan kognitif dan nalar berpikir kritis.",
    totalDurationMinutes: 195,
    totalQuestions: 7,
    subExams: [
      "Penalaran Umum",
      "Pemahaman Bacaan",
      "Pengetahuan Umum",
      "Pengetahuan Kuantitatif",
      "Literasi B. Indonesia",
      "Literasi B. Inggris",
      "Penalaran Matematika"
    ],
    isPremium: false
  },
  {
    id: "PKG-KEDINASAN",
    name: "Kedinasan",
    category: "Kedinasan",
    description: "Persiapan intensif Seleksi Kompetensi Dasar (SKD) untuk Sekolah Kedinasan (STAN, IPDN, STIS, STMKG, Poltekip). Pola soal HOTS standar BKN.",
    totalDurationMinutes: 100,
    totalQuestions: 6,
    subExams: [
      "Tes Inteligensi Umum (TIU)",
      "Tes Wawasan Kebangsaan (TWK)",
      "Tes Karakteristik Pribadi (TKP)"
    ],
    isPremium: true
  },
  {
    id: "PKG-CPNS",
    name: "CPNS",
    category: "CPNS",
    description: "Simulasi Computer Assisted Test (CAT) Seleksi Penerimaan Calon Pegawai Negeri Sipil nasional ter-update sesuai kisi-kisi KemenpanRB.",
    totalDurationMinutes: 100,
    totalQuestions: 6,
    subExams: [
      "Tes Inteligensi Umum (TIU)",
      "Tes Wawasan Kebangsaan (TWK)",
      "Tes Karakteristik Pribadi (TKP)"
    ],
    isPremium: false
  },
  {
    id: "PKG-TNIPOLRI",
    name: "TNI / Polri",
    category: "TNI / Polri",
    description: "Akuratif simulasi tes akademik, regulasi kebangsaan dan pengetahuan umum terpadu bagi calon prajurit Akmil, Akpol, maupun Bintara.",
    totalDurationMinutes: 90,
    totalQuestions: 6,
    subExams: [
      "Tes Psikotes Akademik",
      "Pengetahuan Umum",
      "Wawasan Kebangsaan"
    ],
    isPremium: true
  },
  {
    id: "PKG-BUMN",
    name: "BUMN",
    category: "BUMN",
    description: "Uji kelayakan rekrutmen bersama BUMN (RBB) mencakup Tes Kemampuan Dasar (TKD) dan evaluasi Core Values AKHLAK yang baku.",
    totalDurationMinutes: 110,
    totalQuestions: 6,
    subExams: [
      "Tes Kemampuan Dasar (TKD)",
      "Core Values AKHLAK"
    ],
    isPremium: true
  },
  {
    id: "PKG-PPPK",
    name: "PPPK",
    category: "PPPK",
    description: "Simulasi uji kompetensi pegawai pemerintah dengan perjanjian kerja, mencakup kompetensi teknis, manajerial, dan sosiokultural.",
    totalDurationMinutes: 120,
    totalQuestions: 5,
    subExams: [
      "Asesmen Kompetensi Teknis",
      "Kompetensi Manajerial",
      "Kompetensi Sosiokultural"
    ],
    isPremium: false
  },
  {
    id: "PKG-PSIKOTES",
    name: "Psikotes",
    category: "Psikotes",
    description: "Evaluasi aspek kecerdasan kognitif, stabilitas psikologis, diagram spasial, penalaran analitik, serta tes konsistensi kepribadian.",
    totalDurationMinutes: 60,
    totalQuestions: 5,
    subExams: [
      "Logika Kognitif",
      "Kecerdasan Spasial",
      "Tes Kepribadian"
    ],
    isPremium: true
  },
  {
    id: "PKG-TKAUMUM",
    name: "TKA Umum",
    category: "TKA Umum",
    description: "Evaluasi penguasaan materi akademik kurikulum nasional sekolah dasar (SD), sekolah menengah pertama (SMP), dan atas (SMA).",
    totalDurationMinutes: 90,
    totalQuestions: 5,
    subExams: [
      "TKA Matematika",
      "TKA Sains IPA",
      "TKA Sosial IPS"
    ],
    isPremium: false
  },
  {
    id: "PKG-BAHASAINGGRIS",
    name: "Bahasa Inggris (SD, SMP, SMA)",
    category: "Bahasa Inggris",
    description: "Dirancang khusus meningkatkan kapabilitas tata bahasa (grammar), reading comprehension, error analysis, dan sentence structure dasar ke mahir.",
    totalDurationMinutes: 60,
    totalQuestions: 5,
    subExams: [
      "English Grammar",
      "Reading Comprehension",
      "Structure & Written Expression"
    ],
    isPremium: false
  },
  {
    id: "PKG-MATEMATIKASD",
    name: "Matematika (SD, SMP, SMA)",
    category: "Matematika",
    description: "Pemantapan penalaran logis analitis, dasar aritmatika, aljabar linear, persamaan kuadrat, trigonometri, hingga kalkulus dasar.",
    totalDurationMinutes: 75,
    totalQuestions: 5,
    subExams: [
      "Aljabar & Aritmatika",
      "Geometri & Logika Analitis"
    ],
    isPremium: true
  },
  {
    id: "PKG-ASESMENNASIONAL",
    name: "Test Asesmen Nasional (AN)",
    category: "Asesmen Nasional",
    description: "Simulasi resmi Asesmen Kompetensi Minimum (AKM) siswa, mencakup instrumen literasi fungsional, numerasi kritis, serta survei karakter.",
    totalDurationMinutes: 90,
    totalQuestions: 5,
    subExams: [
      "AKM Numerasi",
      "AKM Literasi Membaca",
      "Survei Karakter & Lingkungan"
    ],
    isPremium: false
  },
  {
    id: "PKG-UJIANLAIN",
    name: "Test/Ujian Lainnya",
    category: "Test/Ujian Lainnya",
    description: "Beragam jenis simulasi seleksi eksternal tambahan, ujian saringan masuk mandiri, serta tes bakat skolastik umum terintegrasi.",
    totalDurationMinutes: 120,
    totalQuestions: 5,
    subExams: [
      "Ujian Saringan Masuk",
      "Tes Potensi Akademik Skolastik"
    ],
    isPremium: true
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // PKG-UTBK Questions
  {
    id: "Q-UTBK-01",
    examId: "PKG-UTBK",
    subExamName: "Penalaran Umum",
    questionText: "Semua siswa Bimbel Kata Kita yang mengikuti kelas intensif lolos ke Perguruan Tinggi Negeri (PTN) favorit. Sebagian siswa yang lolos ke PTN favorit mendapatkan beasiswa berprestasi.\n\nSimpulan mana yang PALING TEPAT berdasarkan pernyataan di atas?",
    options: {
      A: "Sebagian siswa Bimbel Kata Kita yang mengikuti kelas intensif tidak mendapatkan beasiswa berprestasi.",
      B: "Semua siswa Bimbel Kata Kita yang mendapatkan beasiswa berprestasi pasti mengikuti kelas intensif.",
      C: "Sebagian siswa Bimbel Kata Kita yang mengikuti kelas intensif mendapatkan beasiswa berprestasi.",
      D: "Semua siswa kelas intensif Bimbel Kata Kita mendapatkan beasiswa berprestasi di PTN.",
      E: "Siswa yang lolos PTN favorit tetapi tidak mendapatkan beasiswa bukanlah siswa Bimbel Kata Kita."
    },
    correctOption: "C",
    explanation: "Semua siswa kelas intensif masuk PTN favorit. Sebagian yang masuk PTN favorit mendapat beasiswa. Maka, sebagian dari mereka yang merupakan siswa kelas intensif juga mendapatkan beasiswa berprestasi. Pilihan C adalah kesimpulan logis terbaik."
  },
  {
    id: "Q-UTBK-02",
    examId: "PKG-UTBK",
    subExamName: "Pengetahuan Kuantitatif",
    questionText: "Jika x dan y memenuhi sistem persamaan linear berikut:\n3x + 2y = 12\n2x - y = 1\n\nBerapakah nilai dari 5x - 3y?",
    options: {
      A: "1",
      B: "3",
      C: "5",
      D: "7",
      E: "9"
    },
    correctOption: "A",
    explanation: "Dari persamaan kedua: y = 2x - 1.\nSubstitusikan ke persamaan pertama:\n3x + 2(2x - 1) = 12\n3x + 4x - 2 = 12 => 7x = 14 => x = 2.\nMaka y = 2(2) - 1 = 3.\nNilai dari 5x - 3y adalah 5(2) - 3(3) = 10 - 9 = 1."
  },
  {
    id: "Q-UTBK-03",
    examId: "PKG-UTBK",
    subExamName: "Pengetahuan Kuantitatif",
    questionText: "Sebuah segitiga memiliki alas sebesar (2x + 4) cm dan tinggi sebesar (x - 1) cm. Jika luas segitiga tersebut adalah 18 cm², berapakah nilai x yang memenuhi?",
    options: {
      A: "2",
      B: "3",
      C: "4",
      D: "5",
      E: "6"
    },
    correctOption: "C",
    explanation: "Luas Segitiga = 1/2 * alas * tinggi = 18\n1/2 * (2x + 4) * (x - 1) = 18\n(x + 2) * (x - 1) = 18\nx² + x - 2 = 18 => x² + x - 20 = 0\n(x + 5)(x - 4) = 0.\nKarena panjang harus positif, maka x = 4."
  },
  {
    id: "Q-UTBK-04",
    examId: "PKG-UTBK",
    subExamName: "Literasi B. Indonesia",
    questionText: "Bacalah paragraf berikut:\n\n'Kemajuan teknologi informasi saat ini bagaikan pisau bermata dua. Di satu sisi, ia mempermudah siswa Bimbel Kata Kita dalam mengakses jutaan bank soal UTBK berkualitas secara real-time. Di sisi lain, paparan media sosial yang berlebihan dapat menurunkan fokus belajar serta memicu kecemasan akademik tinggi.'\n\nIde pokok paragraf di atas adalah...",
    options: {
      A: "Kemudahan siswa Kata Kita dalam belajar UTBK online.",
      B: "Kecemasan akademik siswa akibat terlalu fokus belajar.",
      C: "Dua sisi dampak kemajuan teknologi informasi pada siswa.",
      D: "Keunggulan platform tryout online modern daripada metode lama.",
      E: "Strategi mengurangi paparan media sosial berlebih saat ujian."
    },
    correctOption: "C",
    explanation: "Paragraf tersebut membahas dua dampak berlawanan (bagaikan pisau bermata dua) dari kemajuan teknologi informasi pada siswa, yaitu mempermudah studi (positif) sekaligus menurunkan fokus (negatif)."
  },
  {
    id: "Q-UTBK-05",
    examId: "PKG-UTBK",
    subExamName: "Literasi B. Inggris",
    questionText: "Read the dialogue below:\n\nTeacher: 'Bagus, your score in the last mock test is remarkable. You have progressed significantly.'\nStudent: 'Thank you, sir. I have been putting extra efforts in practicing English materials through Kata Kita online portal.'\n\nWhat can be inferred about the student?",
    options: {
      A: "The student was disappointed with his last mock test.",
      B: "The student's performance has improved because of his consistent learning.",
      C: "The teacher suggests the student to cancel his Kata Kita membership.",
      D: "The student found English materials extremely hard to access.",
      E: "The mock test questions were exactly identical to those on social media."
    },
    correctOption: "B",
    explanation: "The teacher commends ('remarkable', 'progressed significantly') the student, who credits his results to 'putting extra efforts in practicing' on the portal. This points directly to Option B."
  },
  {
    id: "Q-UTBK-06",
    examId: "PKG-UTBK",
    subExamName: "Penalaran Matematika",
    questionText: "Seorang siswa membeli 3 buku latihan UTBK dan 2 pensil dengan harga Rp 145.000. Jika harga satu buku latihan UTBK dikurangi harga satu pensil adalah Rp 35.000, berapakah harga satu buku latihan UTBK tersebut?",
    options: {
      A: "Rp 38.000",
      B: "Rp 40.000",
      C: "Rp 42.000",
      D: "Rp 43.000",
      E: "Rp 45.000"
    },
    correctOption: "D",
    explanation: "Misalkan B = Buku, P = Pensil.\n3B + 2P = 145000\nB - P = 35000 => P = B - 35000\nSubstitusi:\n3B + 2(B - 35000) = 145000\n5B - 70000 = 145000\n5B = 215000 => B = 43000."
  },
  {
    id: "Q-UTBK-07",
    examId: "PKG-UTBK",
    subExamName: "Pemahaman Bacaan",
    questionText: "Kata 'prestasi' pada kalimat utama teks bacaan di atas berantonim dengan kata...",
    options: {
      A: "Pencapaian",
      B: "Kegagalan",
      C: "Prestiles",
      D: "Dedikasi",
      E: "Atribut"
    },
    correctOption: "B",
    explanation: "Prestasi bermakna hasil yang telah dicapai (dari apa yang telah dilakukan/dikerjakan). Antonim atau lawan kata yang paling sesuai adalah kegagalan."
  },

  // PKG-CPNS Questions
  {
    id: "Q-CPNS-01",
    examId: "PKG-CPNS",
    subExamName: "Tes Inteligensi Umum (TIU)",
    questionText: "Deret angka berikut memiliki pola tertentu:\n3, 7, 15, 31, 63, ...\n\nBerapakah angka berikutnya yang paling cocok?",
    options: {
      A: "95",
      B: "111",
      C: "127",
      D: "129",
      E: "135"
    },
    correctOption: "C",
    explanation: "Polanya adalah dikali 2 lalu ditambah 1:\n3 * 2 + 1 = 7\n7 * 2 + 1 = 15\n15 * 2 + 1 = 31\n31 * 2 + 1 = 63\n63 * 2 + 1 = 127."
  },
  {
    id: "Q-CPNS-02",
    examId: "PKG-CPNS",
    subExamName: "Tes Wawasan Kebangsaan (TWK)",
    questionText: "Kedudukan Pancasila sebagai pandangan hidup bangsa Indonesia berarti Pancasila berfungsi sebagai...",
    options: {
      A: "Dasar hukum tertulis tertinggi dalam sistem legislasi nasional.",
      B: "Alat pemersatu militer dalam mengamankan kedaulatan negara.",
      C: "Petunjuk arah, acuan, dan moral perilaku keseharian bangsa.",
      D: "Dokumen diplomatik untuk mendaftarkan perjanjian internasional.",
      E: "Materi sejarah yang wajib dihapalkan dari generasi ke generasi."
    },
    correctOption: "C",
    explanation: "Sebagai pandangan hidup bangsa (weltanschauung), Pancasila dijadikan petunjuk, pedoman, arah, dan landasan moral bagi seluruh aktivitas kehidupan kemasyarakatan dan bernegara sehari-hari."
  },
  {
    id: "Q-CPNS-03",
    examId: "PKG-CPNS",
    subExamName: "Tes Karakteristik Pribadi (TKP)",
    questionText: "Saat mengawas pelaksanaan Tryout Nasional di Bimbel Kata Kita secara tenang, Anda melihat salah satu koneksi internet siswa tiba-tiba mati total akibat gangguan teknis provider eksternal. Siswa tersebut mulai panik karena waktu berjalan terus. Apa tindakan terbaik Anda?",
    options: {
      A: "Memarahi siswa tersebut karena merusak ketenangan kelas tryout.",
      B: "Secara tenang menghampiri, memberikan modem hotspot cadangan Bimbel, serta menenangkan agar ia tetap fokus bekerja.",
      C: "Menyuruhnya pulang dan menjadwalkan ulang di hari lain tanpa memberikan kompensasi apa pun.",
      D: "Membiarkannya saja karena kendala internet eksternal bukan tanggung jawab pengawas.",
      E: "Menjawab semua sisa soal ujiannya agar nilai total siswa tersebut tetap tinggi."
    },
    correctOption: "B",
    explanation: "Dalam Tes Karakteristik Pribadi, pelayanan publik, profesionalisme, dan pemecahan masalah (problem solving) harus diutamakan secara ramah dan proaktif. Memberikan bantuan hotspot cadangan secara sigap adalah jawaban berbobot nilai tertinggi (5)."
  },

  // PKG-KEDINASAN Questions
  {
    id: "Q-KED-01",
    examId: "PKG-KEDINASAN",
    subExamName: "Tes Inteligensi Umum (TIU)",
    questionText: "Seorang pegawai kedinasan menyelesaikan input data registrasi 60 siswa dalam waktu 4 jam. Jika jumlah data registrasi bertambah menjadi 150 siswa, berapa jam kah total waktu yang dibutuhkan oleh pegawai tersebut untuk menyelesaikannya dengan kecepatan yang sama?",
    options: {
      A: "8 Jam",
      B: "9 Jam",
      C: "10 Jam",
      D: "12 Jam",
      E: "15 Jam"
    },
    correctOption: "C",
    explanation: "Ini merupakan kasus perbandingan senilai.\n60 siswa -> 4 jam\n150 siswa -> x jam\n60/150 = 4/x => x = (150 * 4)/60 = 600/60 = 10 jam."
  },

  // PKG-BUMN Questions
  {
    id: "Q-BUMN-01",
    examId: "PKG-BUMN",
    subExamName: "Core Values AKHLAK",
    questionText: "Salah satu pilar Core Values AKHLAK BUMN adalah 'Harmonis'. Manakah di antara tindakan berikut yang mencerminkan pilar tersebut dalam dunia kerja BUMN?",
    options: {
      A: "Membantu rekan kerja yang kesulitan menyelesaikan tugas tanpa melihat latar belakang sukunya.",
      B: "Menjalankan perintah atasan meskipun bertentangan dengan prinsip etika keadilan.",
      C: "Berpartisipasi aktif dalam rapat serta meremehkan pendapat dari divisi lain.",
      D: "Menolak bekerja sama dengan anak perusahaan BUMN lain karena persaingan ketat.",
      E: "Mengundurkan diri karena perbedaan pendapat politik dengan anggota direksi perusahaan."
    },
    correctOption: "A",
    explanation: "Pilar Harmonis menekankan nilai saling peduli dan menghargai perbedaan, serta membangun lingkungan kerja yang kondusif tanpa diskriminasi."
  },

  // PKG-TNIPOLRI Questions
  {
    id: "Q-TNI-01",
    examId: "PKG-TNIPOLRI",
    subExamName: "Tes Psikotes Kognitif",
    questionText: "BUMI : GLOBE = MAP : ...\n\nPilihlah kata yang memiliki padanan analogi terbaik untuk melengkapi relasi di atas!",
    options: {
      A: "Atmosfer",
      B: "Wilayah",
      C: "Kertas",
      D: "Kompas",
      E: "Negara"
    },
    correctOption: "B",
    explanation: "Globe adalah model replika visual 3 dimensi dari Bumi. Map (peta) adalah model visual 2 dimensi dari Wilayah/Negara. Padanan terbaik adalah Wilayah."
  },

  // PKG-BAHASAINGGRIS Questions
  {
    id: "Q-ENG-01",
    examId: "PKG-BAHASAINGGRIS",
    subExamName: "English Grammar",
    questionText: "The students ________ English in the self-access learning room when their instructor came in.",
    options: {
      A: "studied",
      B: "are studying",
      ...{ C: "were studying" },
      D: "have studied",
      E: "will study"
    },
    correctOption: "C",
    explanation: "Kegiatan yang sedang berlangsung di masa lampau ketika kejadian lain menyela menggunakan Past Continuous Tense ('were studying' paired with past verb 'came')."
  }
];
