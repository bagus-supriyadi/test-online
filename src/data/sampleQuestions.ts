import { ExamPackage, Question } from '../types';

export const DEFAULT_PACKAGES: ExamPackage[] = [
  {
    id: "PKG-UTBK",
    name: "UTBK SNBT",
    category: "UTBK SNBT",
    description: "Tryout berskala nasional sesuai standar BPPP Kemendikbudristek. Paket Tryout ini dirancang secara detail untuk menguji ketahanan kognitif dan nalar berpikir kritis.",
    totalDurationMinutes: 195,
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
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
    totalQuestions: 0,
    subExams: [
      "Ujian Saringan Masuk",
      "Tes Potensi Akademik Skolastik"
    ],
    isPremium: true
  }
];

export const DEFAULT_QUESTIONS: Question[] = [];
