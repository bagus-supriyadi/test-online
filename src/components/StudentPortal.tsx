import React, { useState, useEffect } from 'react';
import { ExamPackage, Question, StudentAttempt, UserRegistry } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import TryoutDashboard from './TryoutDashboard';

interface StudentPortalProps {
  currentUser: UserRegistry;
  packages: ExamPackage[];
  locks: { [packageId: string]: boolean };
  attempts: StudentAttempt[];
  questions?: Question[];
  onStartExam: (packageId: string) => void;
  onLogout: () => void;
  allAttempts?: StudentAttempt[];
  studentUsers?: UserRegistry[];
}

interface ActiveCBTState {
  packageId: string;
  subtestIndex: number;
  subtestName: string;
  durationMinutes: number;
  totalQuestions: number;
  remainingSeconds: number;
  currentQuestionIndex: number;
  answers: { [qIdx: number]: string };
  raguRagu: { [qIdx: number]: boolean };
  tabSwitchViolations: number;
}

// 4 Premium Color Gradients (dynamic coordinate with Left Sidebar & Right indicators)
type ThemeKey = 'emerald' | 'blue' | 'violet' | 'sunrise';

const THEME_PRESETS = {
  emerald: {
    sidebar: 'bg-gradient-to-b from-[#0f766e] via-[#0d9488] to-[#115e59]',
    primary: '#0d9488',
    accentText: 'text-[#0d9488] font-black',
    headerBg: 'from-[#0f766e] to-[#115e59]',
    pillBg: 'bg-teal-100 text-[#0f766e]',
    buttonBg: 'bg-[#00705f] hover:bg-[#005a4d]',
    accentBorder: 'border-emerald-500/20',
    indicatorGlow: 'shadow-emerald-500/10'
  },
  blue: {
    sidebar: 'bg-gradient-to-b from-[#1e40af] via-[#2563eb] to-[#1e3a8a]',
    primary: '#2563eb',
    accentText: 'text-[#2563eb] font-black',
    headerBg: 'from-[#1e40af] to-[#1e3a8a]',
    pillBg: 'bg-blue-100 text-blue-700',
    buttonBg: 'bg-blue-600 hover:bg-blue-500',
    accentBorder: 'border-blue-500/20',
    indicatorGlow: 'shadow-blue-500/10'
  },
  violet: {
    sidebar: 'bg-gradient-to-b from-[#5b21b6] via-[#7c3aed] to-[#4c1d95]',
    primary: '#7c3aed',
    accentText: 'text-[#7c3aed] font-black',
    headerBg: 'from-[#5b21b6] to-[#4c1d95]',
    pillBg: 'bg-purple-100 text-purple-700',
    buttonBg: 'bg-purple-600 hover:bg-purple-500',
    accentBorder: 'border-[#7c3aed]/20',
    indicatorGlow: 'shadow-[#7c3aed]/10'
  } as const,
  sunrise: {
    sidebar: 'bg-gradient-to-b from-[#9f1239] via-[#e11d48] to-[#be123c]',
    primary: '#e11d48',
    accentText: 'text-[#e11d48] font-black',
    headerBg: 'from-[#9f1239] to-[#be123c]',
    pillBg: 'bg-rose-100 text-rose-700',
    buttonBg: 'bg-rose-600 hover:bg-rose-500',
    accentBorder: 'border-[#e11d48]/20',
    indicatorGlow: 'shadow-[#e11d48]/10'
  }
};

// Top quotes database (rotated on refresh click)
const EDUCATIONAL_QUOTES = [
  {
    text: "Lawan sastra ngesti mulya, ing ngarsa sung tulada, ing madya mangun karsa, tut wuri handayani.",
    author: "Ki Hajar Dewantara",
    role: "Bapak Pendidikan Nasional Indonesia",
    meaning: "Pendidikan sejati bertujuan mencapai kemuliaan hidup melalui kekuatan ilmu pengetahuan. Semboyan luhur ini mengajarkan pendidik/pemimpin untuk memberikan keteladanan yang baik di depan (ing ngarsa sung tulada), menciptakan prakarsa atau pembangun semangat di tengah (ing madya mangun karsa), serta senantiasa memberikan dorongan moral serta kepercayaan dari belakang (tut wuri handayani) demi kemandirian dan kesuksesan siswa."
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    role: "Presiden Afrika Selatan & Penerima Nobel Perdamaian",
    meaning: "Pendidikan bukan sekadar aktivitas menghafal materi, namun merupakan bekal bekerjanya akal sehat dan karakter moral yang tangguh guna memutus mata rantai kemiskinan, ketidaktahuan, serta keterbatasan sosial demi mengubah peradaban masa depan menjadi jauh lebih adil, makmur, dan inklusif."
  },
  {
    text: "Tiada awan di langit yang tetap selamanya. Tiada mungkin akan terus-menerus terang cuaca. Sehabis malam gelap gulita lahir pagi membawa keindahan.",
    author: "R.A. Kartini",
    role: "Pelopor Kebangkitan Perempuan Pribumi",
    meaning: "Perjuangan keras dalam menempuh persiapan tryout akademis terkadang melelahkan dan penuh rintangan besar. Namun, kesulitan tersebut laksana badai awan mendung sesaat; asalkan kita pantang menyerah dan terus berikhtiar memperbaiki diri, fajar keberhasilan yang indah pada seleksi perguruan tinggi idaman pasti akan terbit menyambut kita."
  },
  {
    text: "Learning is not a product of schooling but the lifelong attempt to acquire it.",
    author: "Albert Einstein",
    role: "Fisikawan Teoritis Terkemuka Dunia",
    meaning: "Mendapatkan ilmu sejati tidak berhenti saat jam bimbingan selesai atau kelulusan sekolah digenggam. Belajar adalah hasrat keingintahuan aktif yang berlangsung selamanya di sepanjang hayat manusia, di mana setiap kesalahan pengerjaan soal adalah guru berharga untuk penyempurnaan wawasan berpikir."
  },
  {
    text: "Tujuan pendidikan itu untuk mempertajam kecerdasan, memperkukuh kemauan, serta memperhalus perasaan.",
    author: "Tan Malaka",
    role: "Pemimpin Ideologi & Pemikir Bangsa",
    meaning: "Esensi pendidikan seutuhnya berporos pada tiga komponen kemanusiaan utama: ketajaman rasio kecerdasan berpikir (intelektual/akademis), kekokohan tekad semangat berjuang (ketangguhan mental pantang putus asa), dan kehalusan rasa budi pekerti (kepekaan empati moral) supaya kita tumbuh menjadi generasi cerdas ber-integritas tinggi."
  }
];

// 7 UTBK SNBT Sub-test sections shown in list (Gambar 1 / Gambar 4)
const SUBTESTS_LIST = [
  { id: 'sub-1', name: 'TPS - Penalaran Umum', duration: 30, questionsCount: 5, category: 'TPS' },
  { id: 'sub-2', name: 'TPS - Pengetahuan & Pemahaman Umum', duration: 25, questionsCount: 5, category: 'TPS' },
  { id: 'sub-3', name: 'TPS - Memahami Bacaan & Menulis', duration: 25, questionsCount: 5, category: 'TPS' },
  { id: 'sub-4', name: 'TPS - Pengetahuan Kuantitatif', duration: 20, questionsCount: 5, category: 'TPS' },
  { id: 'sub-5', name: 'Literasi - Bahasa Indonesia', duration: 45, questionsCount: 5, category: 'Literasi' },
  { id: 'sub-6', name: 'Literasi - Bahasa Inggris', duration: 30, questionsCount: 5, category: 'Literasi' },
  { id: 'sub-7', name: 'Penalaran Matematika', duration: 20, questionsCount: 5, category: 'Matematika' }
];

// Rich, concise question database for the 7 sub-tests
interface QuestionDBItem {
  question: string;
  options: { [key: string]: string };
  correct: string;
  explanation: string;
  questionImage?: string;
  questionImagePosition?: string;
  optionImages?: { [key: string]: string };
  optionImagePositions?: { [key: string]: string };
}

const SUB_QUESTIONS_DB: { [subtestIdx: number]: QuestionDBItem[] } = {
  0: [
    {
      question: "Jika tingkat kelulusan di Bimbel Kata Kita meningkat, maka jumlah siswa baru yang mendaftar bertambah secara akumulatif. Saat ini, jumlah siswa baru mendaftar bertambah. Simpulan yang PALING SAH adalah...",
      options: {
        A: "Tingkat kelulusan di Bimbel Kata Kita terbukti meningkat secara riil.",
        B: "Tingkat kelulusan di Bimbel Kata Kita tidak mengalami kenaikan.",
        C: "Sebagian siswa baru tidak memanfaatkan program tryout nasional.",
        D: "Tidak dapat ditarik kesimpulan yang mutlak sah secara logika formal.",
        E: "Bimbel Kata Kita otomatis mendapat akreditasi nasional tertinggi."
      },
      correct: "D",
      explanation: "Ini merupakan kesalahan logika penalaran afirmatif konsekuen (affirming the consequent). Mengetahui akibat benar tidak menjamin sebabnya juga benar, sehingga tidak ada kesimpulan mutlak yang sah."
    },
    {
      question: "Semua pengajar di Kata Kita menguasai teknik eliminasi jawaban cepat. Sebagian mahasiswa magang adalah pengajar di Bimbel Kata Kita. Simpulan yang sah:",
      options: {
        A: "Semua mahasiswa magang menguasai teknik eliminasi jawaban.",
        B: "Sebagian mahasiswa magang menguasai teknik eliminasi jawaban cepat.",
        C: "Sebagian pengajar di Kata Kita bukan mahasiswa magang.",
        D: "Tidak ada mahasiswa magang yang bisa menguasai metode belajar.",
        E: "Semua pengajar adalah mahasiswa magang aktif."
      },
      correct: "B",
      explanation: "Karena sebagian mahasiswa magang adalah pengajar, dan semua pengajar menguasai teknik eliminasi jawaban cepat, maka sebagian mahasiswa magang tersebut pasti menguasai teknik tersebut."
    }
  ],
  1: [
    {
      question: "Kata KOLEKTIF dalam dunia pendidikan nasional bersinonim dengan kata...",
      options: {
        A: "Tersebar",
        B: "Parsial",
        C: "Bersama-sama / Kelompok",
        D: "Spesifik",
        E: "Individual"
      },
      correct: "C",
      explanation: "Kolektif bermakna secara bersama-sama, kelompok, terpadu atau komunal. Lawan katanya adalah individual."
    },
    {
      question: "Pilihlah lawan kata (antonim) yang paling tepat untuk kata SPEKULATIF dalam dunia analisis data:",
      options: {
        A: "Teoretis",
        B: "Pasti / Riil",
        C: "Dugaan",
        D: "Khayalan",
        E: "Fluktuatif"
      },
      correct: "B",
      explanation: "Spekulatif berarti bersifat untung-untungan atau dugaan sementara. Lawan kata yang paling pas adalah pasti atau riil."
    }
  ],
  2: [
    {
      question: "Kalimat berikut tidak efektif karena hilangnya subjek: 'Dalam rapat persiapan tryout akbar memutuskan jadwal pengerjaan diundur.' Bagaimana perbaikan paling tepat?",
      options: {
        A: "Rapat persiapan tryout akbar memutuskan jadwal pengerjaan nasional diundur.",
        B: "Dalam rapat memutuskan keputusan bahwa diundur.",
        C: "Jadwal pengerjaan memutuskan rapat persiapan diundur.",
        D: "Memutuskan dalam rapat akbar bahwa jadwal ujian nasional diundur.",
        E: "Ujian nasional diundur karena rapat persiapan menentukan."
      },
      correct: "A",
      explanation: "Dengan menghapus preposisi 'Dalam' di awal kalimat, maka kata benda 'Rapat persiapan tryout akbar' langsung berfungsi sebagai Subjek aktif."
    },
    {
      question: "Penggunaan tanda koma (,) yang menyalahi kaidah gramatikal bahasa Indonesia ditemukan pada...",
      options: {
        A: "Roni membeli buku rumus, alat tulis, dan penghapus di koperasi bimbel.",
        B: "Meskipun hujan deras mengguyur, para siswa Kata Kita tetap antusias belajar.",
        C: "Bagus akan pergi ke Lampung, jika ia mendapatkan tiket pesawat pagi.",
        D: "Oleh karena itu, kita harus tekun melatih penalaran kuantitatif.",
        E: "Prof. Dr. Ir. Siswanto, M.B.A., akan memberikan motivasi kelulusan."
      },
      correct: "C",
      explanation: "Anak kalimat yang diposisikan di belakang induk kalimat (didahului konjungsi subordinatif 'jika') tidak perlu dibatasi dengan tanda koma."
    }
  ],
  3: [
    {
      question: "Jika diketahui 3x + 5 = 20, berapakah nilai dari hitungan 6x - 2?",
      options: {
        A: "26",
        B: "28",
        C: "30",
        D: "32",
        E: "34"
      },
      correct: "B",
      explanation: "3x = 15 => x = 5. Maka 6x - 2 = 6(5) - 2 = 30 - 2 = 28."
    },
    {
      question: "Suatu segitiga siku-siku memiliki hipotenusa (sisi miring) 13 cm dan satu sisi tegak 5 cm. Berapakah luas segitiga tersebut?",
      options: {
        A: "30 cm²",
        B: "60 cm²",
        C: "65 cm²",
        D: "120 cm²",
        E: "150 cm²"
      },
      correct: "A",
      explanation: "Sesuai Tripel Pythagoras, sisi alas = akar(13² - 5²) = 12 cm. Luas segitiga = 1/2 * alas * tinggi = 1/2 * 12 * 5 = 30 cm²."
    }
  ],
  4: [
    {
      question: "Kemajuan teknologi ujian digital kini merambah sistem seleksi perguruan tinggi negeri. Namun, efektivitas CBT sangat bergantung pada kestabilan internet serta literasi digital para peserta di daerah tertinggal.\n\nSimpulan utama paragraf adalah...",
      options: {
        A: "Pemberlakuan ujian mandiri merugikan murid daerah.",
        B: "Sistem CBT dipengaruhi kestabilan koneksi internet serta kesiapan literasi digital peserta.",
        C: "Biaya komputer mahal di daerah terluar Indonesia.",
        D: "Teknologi merusak tatanan pengajaran guru di sekolah menengah.",
        E: "Semua murid otomatis lulus seleksi online."
      },
      correct: "B",
      explanation: "Paragraf menyebutkan secara eksplisit bahwa efektivitas sistem ujian berbasis komputer (CBT) ini sangat bergantung pada dua faktor tersebut."
    },
    {
      question: "Manakah penulisan kata baku menurut ketentuan PUEBI/EYD?",
      options: {
        A: "Mempraktekkan",
        B: "Standarisasi",
        C: "Standardisasi",
        D: "Efektifitas",
        E: "Diskontinyu"
      },
      correct: "C",
      explanation: "Standardisasi dibentuk dari kata standard + isasi, yang merupakan penulisan baku. Bentuk tidak baku lainnya adalah praktek (praktik) dan efektifitas (efektivitas)."
    }
  ],
  5: [
    {
      question: "Artificial Intelligence (AI) has transformed traditional schools. By analyzing students' test outcomes, custom computer engines can build custom worksheets targeted at persistent student weaknesses to maximize scores.\n\nWhat is the passage's main idea?",
      options: {
        A: "Teachers will be completely replaced by humanoid robots.",
        B: "AI tools help target individual student weaknesses to promote better scores.",
        C: "The financial cost of maintaining computer sets is extremely heavy.",
        D: "Students dislike solving math questions on laptops.",
        E: "All school examinations should be written in English."
      },
      correct: "B",
      explanation: "The passage highlights that custom computer systems analyze student outcomes and target persistent student weaknesses to maximize scores."
    },
    {
      question: "Fill in the blank: 'If the student ___ the CBT simulator earlier, they would have felt much more confident.'",
      options: {
        A: "start",
        B: "has started",
        C: "had started",
        D: "will start",
        E: "starting"
      },
      correct: "C",
      explanation: "This is conditional sentence type 3 (unreal past event). The correct construction uses 'had + past participle'."
    }
  ],
  6: [
    {
      question: "Seorang siswa berkendara dengan kecepatan rata-rata 60 km/jam dari kediamannya ke Bimbel Kata Kita. Jika jarak perjalanan adalah 15 km, berapa lamakah durasi yang ia habiskan di perjalanan?",
      options: {
        A: "10 menit",
        B: "15 menit",
        C: "20 menit",
        D: "25 menit",
        E: "30 menit"
      },
      correct: "B",
      explanation: "Waktu = Jarak / Kecepatan = 15 km / 60 km/jam = 1/4 jam = 15 menit."
    },
    {
      question: "Sebuah panitia bimbel menyewa bis berkapasitas 40 kursi. Jika perbandingan siswa laki-laki dan perempuan adalah 3:2, dan seluruh kursi terisi penuh oleh siswa tanpa sisa, berapakah jumlah perempuan?",
      options: {
        A: "12 orang",
        B: "16 orang",
        C: "20 orang",
        D: "24 orang",
        E: "28 orang"
      },
      correct: "B",
      explanation: "Perempuan = 2 / (3 + 2) * 40 = 2/5 * 40 = 16 orang."
    }
  ]
};

export default function StudentPortal({
  currentUser,
  packages,
  locks,
  attempts,
  questions = [],
  onStartExam,
  onLogout,
  allAttempts,
  studentUsers
}: StudentPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'cbt' | 'stats' | 'profile'>('home');
  const [portalTheme, setPortalTheme] = useState<ThemeKey>(() => {
    return (localStorage.getItem('katakita_student_portal_theme') as ThemeKey) || 'emerald';
  });
  
  // Rotating educational quote active index
  const [quoteIndex, setQuoteIndex] = useState(0);

  // States for interactive subtests CBT flow of package (intercepts the dashboard "Mulai Ujian")
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [activeCBT, setActiveCBT] = useState<ActiveCBTState | null>(null);
  
  // Local trigger for subtests completion updates
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  // For review popup of details
  const [selectedReviewData, setSelectedReviewData] = useState<{
    pkgName: string;
    subtestIdx: number;
    score: number;
    correct: number;
    wrong: number;
    empty: number;
    violations: number;
    disqualified: boolean;
    answers: { [key: number]: string };
  } | null>(null);

  // Profile forms loaded locally
  const [profileName, setProfileName] = useState(currentUser.fullname);
  const [profileSchool, setProfileSchool] = useState(currentUser.school || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(currentUser.photoUrl || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Local state copy of completed subtests
  const [completedSubtests, setCompletedSubtests] = useState<{ [packageId: string]: { [subIdx: number]: any } }>({});

  const [showCbtSubmitConfirmPopup, setShowCbtSubmitConfirmPopup] = useState<{
    filled: number;
    empty: number;
    ragu: number;
  } | null>(null);

  // Sync state on load
  useEffect(() => {
    const saved = localStorage.getItem('katakita_completed_subtests_v2');
    if (saved) {
      setCompletedSubtests(JSON.parse(saved));
    } else {
      setCompletedSubtests({});
    }
  }, [triggerUpdate, selectedPkgId]);

  // Handle ticking timers for active CBT session
  useEffect(() => {
    if (!activeCBT) return;
    const interval = setInterval(() => {
      setActiveCBT((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          clearInterval(interval);
          alert("WAKTU SUDAH HABIS! Jawaban Anda otomatis disimpan.");
          handleFinishCBTLocal(prev.packageId, prev.subtestIndex, prev.answers, prev.tabSwitchViolations, false);
          return null;
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCBT]);

  // Monitor tab change / blur anti-cheat violation
  useEffect(() => {
    if (!activeCBT) return;
    const handleBlur = () => {
      setActiveCBT((prev) => {
        if (!prev) return null;
        const newViolations = prev.tabSwitchViolations + 1;
        if (newViolations >= 3) {
          alert("DISKUALIFIKASI OTOMATIS! Anda terdeteksi keluar dari layar browser sebanyak 3 kali.");
          handleFinishCBTLocal(prev.packageId, prev.subtestIndex, prev.answers, newViolations, true);
          return null;
        } else {
          alert(`PERINGATAN KERAS! Anda melanggar ketentuan keluar tab browser (${newViolations}/3). Melampaui batas akan membatalkan hasil tryout Anda!`);
          return {
            ...prev,
            tabSwitchViolations: newViolations
          };
        }
      });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeCBT]);

  // Rotate quotes index safely on refresh
  const handleRandomQuoteRotation = () => {
    setQuoteIndex((prev) => (prev + 1) % EDUCATIONAL_QUOTES.length);
  };

  // Switch Theme Preset
  const handleToggleTheme = () => {
    const themes: ThemeKey[] = ['emerald', 'blue', 'violet'];
    const currentIdx = themes.indexOf(portalTheme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    setPortalTheme(nextTheme);
    localStorage.setItem('katakita_student_portal_theme', nextTheme);
    handleRandomQuoteRotation(); // also rot quote for seamless dynamic click outcome as requested!
  };

  const getSubtestsForPackage = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg && pkg.subExams && pkg.subExams.length > 0) {
      return pkg.subExams.map((subName, sIdx) => {
        const qList = (questions || []).filter(q => q.examId === pkgId && q.subExamName === subName && q.isPublished !== false);
        const config = pkg.subExamsConfig?.[subName] || { durationMinutes: 30, questionCount: qList.length > 0 ? qList.length : 5 };
        return {
          id: `sub-${sIdx}`,
          name: subName,
          duration: config.durationMinutes,
          questionsCount: qList.length > 0 ? qList.length : config.questionCount,
          category: pkg.category
        };
      });
    }
    return SUBTESTS_LIST;
  };

  const getQuestionsForSubtest = (pkgId: string, subtestName: string, subtestIdx: number) => {
    const dbQuestions = (questions || []).filter(q => q.examId === pkgId && q.subExamName === subtestName && q.isPublished !== false);
    if (dbQuestions.length > 0) {
      return dbQuestions.map(q => ({
        question: q.questionText,
        options: q.options,
        correct: q.correctOption,
        explanation: q.explanation || "Pembahasan belum disertakan oleh admin.",
        questionImage: q.questionImage,
        questionImagePosition: q.questionImagePosition,
        optionImages: q.optionImages,
        optionImagePositions: q.optionImagePositions
      }));
    }
    return SUB_QUESTIONS_DB[subtestIdx] || SUB_QUESTIONS_DB[0];
  };

  const handleStartSubtestLocal = (pkgId: string, subtestIdx: number) => {
    const subtests = getSubtestsForPackage(pkgId);
    const sub = subtests[subtestIdx] || subtests[0];
    const subQuestions = getQuestionsForSubtest(pkgId, sub.name, subtestIdx);
    
    setActiveCBT({
      packageId: pkgId,
      subtestIndex: subtestIdx,
      subtestName: sub.name,
      durationMinutes: sub.duration,
      totalQuestions: subQuestions.length,
      remainingSeconds: sub.duration * 60,
      currentQuestionIndex: 0,
      answers: {},
      raguRagu: {},
      tabSwitchViolations: 0
    });
  };

  const handleFinishCBTLocal = (
    pkgId: string,
    subtestIdx: number,
    uAnswers: { [key: number]: string },
    violations: number,
    disqualified: boolean
  ) => {
    const subtests = getSubtestsForPackage(pkgId);
    const sub = subtests[subtestIdx] || subtests[0];
    const subQuestions = getQuestionsForSubtest(pkgId, sub.name, subtestIdx);
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    subQuestions.forEach((q, idx) => {
      const selected = uAnswers[idx];
      if (!selected) {
        empty++;
      } else if (selected === q.correct) {
        correct++;
      } else {
        wrong++;
      }
    });

    const calculatedScore = disqualified ? 0 : (correct / (subQuestions.length || 1)) * 100;

    // Save subtest locally
    const savedStr = localStorage.getItem('katakita_completed_subtests_v2') || '{}';
    const saved = JSON.parse(savedStr);
    if (!saved[pkgId]) saved[pkgId] = {};
    saved[pkgId][subtestIdx] = {
      correct,
      wrong,
      empty,
      score: calculatedScore,
      violations,
      disqualified,
      answers: uAnswers,
      dateCompleted: new Date().toISOString()
    };
    localStorage.setItem('katakita_completed_subtests_v2', JSON.stringify(saved));
    
    // Also append an overall student attempt session so standard statistical lists and main tables receive updates instantly too!
    const pkg = packages.find(p => p.id === pkgId);
    const subName = SUBTESTS_LIST[subtestIdx].name;
    const newAttempt: StudentAttempt = {
      id: `ATT-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser.id,
      examId: pkgId,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      status: 'SUBMITTED',
      finalScore: calculatedScore,
      correctCount: correct,
      incorrectCount: wrong,
      emptyCount: empty,
      tabSwitchViolations: violations,
      answers: Object.entries(uAnswers).reduce((acc, [k, v]) => {
        acc[`${pkgId}-${subtestIdx}-${k}`] = v;
        return acc;
      }, {} as { [qId: string]: string })
    };

    const currentAttemptsStr = localStorage.getItem('katakita_student_attempts') || '[]';
    try {
      const currentAttempts = JSON.parse(currentAttemptsStr);
      localStorage.setItem('katakita_student_attempts', JSON.stringify([newAttempt, ...currentAttempts]));
    } catch (e) {
      console.error(e);
    }

    setTriggerUpdate((prev) => prev + 1);
    setActiveCBT(null);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');

    const updatedUser: UserRegistry = {
      ...currentUser,
      fullname: profileName,
      email: profileEmail,
      phone: profilePhone,
      photoUrl: profilePhotoUrl,
      school: profileSchool
    };

    localStorage.setItem('katakita_current_user', JSON.stringify(updatedUser));

    // Save profile update to Firestore
    setDoc(doc(db, 'users', updatedUser.id), updatedUser).catch((err) => {
      console.error("Firestore error saving profile update:", err);
    });

    const usersStr = localStorage.getItem('katakita_users');
    if (usersStr) {
      try {
        const users: UserRegistry[] = JSON.parse(usersStr);
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = {
            ...users[idx],
            fullname: profileName,
            email: profileEmail,
            phone: profilePhone,
            photoUrl: profilePhotoUrl,
            school: profileSchool
          };
          localStorage.setItem('katakita_users', JSON.stringify(users));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setProfileSuccess('Profil disimpan! Menyegarkan data...');
    setTimeout(() => {
      setProfileSuccess('');
      window.location.reload();
    }, 1200);
  };

  // Calculate dynamic metrics across completed tests of v2
  const studentSubtestsForPkg = completedSubtests[selectedPkgId || ''] || {};
  const completedCount = Object.keys(studentSubtestsForPkg).length;

  let totalCompletedSubCount = 0;
  let totalScoreSum = 0;
  let maxSubtestScore = -1;
  let minSubtestScore = 101;
  let strongestSektor = 'Belum Ada';
  let weakestSektor = 'Belum Ada';

  Object.entries(completedSubtests).forEach(([pkgId, subtests]) => {
    Object.entries(subtests).forEach(([subIdxStr, data]: [string, any]) => {
      totalCompletedSubCount++;
      totalScoreSum += data.score;
      if (data.score > maxSubtestScore) {
        maxSubtestScore = data.score;
        strongestSektor = SUBTESTS_LIST[Number(subIdxStr)].name;
      }
      if (data.score < minSubtestScore) {
        minSubtestScore = data.score;
        weakestSektor = SUBTESTS_LIST[Number(subIdxStr)].name;
      }
    });
  });

  const dynamicAverageScore = totalCompletedSubCount > 0 ? (totalScoreSum / totalCompletedSubCount).toFixed(0) : "0";

  const selectedTheme = THEME_PRESETS[portalTheme] || THEME_PRESETS.emerald;

  // Render format clock helper
  const formatTimeSeconds = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeQuote = EDUCATIONAL_QUOTES[quoteIndex] || EDUCATIONAL_QUOTES[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-6 text-left relative" id="student-portal-wrapper">
      
      {/* ============================================== */}
      {/* 1. PERSISTENT CENTER ALIGNED SIDEBAR */}
      {/* ============================================== */}
      <aside className={`w-full lg:w-72 ${selectedTheme.sidebar} text-white rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-xl transition-all duration-300`} id="student-sidebar">
        
        <div className="space-y-6 text-center flex flex-col items-center">
          {/* Brand header block */}
          <div className="flex flex-col items-center pb-4 border-b border-white/10 w-full">
            <img 
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
              alt="Logo Kata Kita" 
              className="h-14 w-auto object-contain bg-white rounded-2xl p-1.5 shadow-md mb-2.5"
            />
            <h4 className="font-display font-black text-white text-xs tracking-wider uppercase">PORTAL SISWA</h4>
            <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest mt-0.5">Bimbel Kata Kita</p>
          </div>

          {/* Student Profile Block */}
          <div className="bg-black/25 rounded-2xl p-5 flex flex-col items-center text-center space-y-3.5 border border-white/10 w-full relative overflow-hidden" id="student-sidebar-profile">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-rose-450"></div>

            <div className="relative">
              {currentUser.photoUrl ? (
                <img 
                  src={currentUser.photoUrl} 
                  alt={currentUser.fullname} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#00705f] text-white flex items-center justify-center text-xl font-black uppercase shadow-md border border-white/10">
                  {currentUser.fullname.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Online Aktif"></span>
            </div>

            <div className="leading-tight w-full">
              <h5 className="font-black text-white text-sm truncate max-w-[190px] mx-auto" title={currentUser.fullname}>
                {currentUser.fullname}
              </h5>
              <p className="text-[9px] text-amber-200 font-extrabold uppercase mt-1.5 tracking-wider truncate px-1" title={currentUser.school || 'Asal Sekolah Belum Diisi'}>
                <i className="fa-solid fa-school text-amber-400 mr-1 text-[8px]"></i>
                {currentUser.school || 'Asal Sekolah Belum Diisi'}
              </p>
              
              <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-100 font-medium space-y-1.5 text-center flex flex-col items-center justify-center">
                <p className="truncate max-w-[210px]" title={currentUser.email}>
                  <i className="fa-regular fa-envelope text-amber-400 mr-2"></i> {currentUser.email}
                </p>
                <p className="truncate max-w-[210px]">
                  <i className="fa-solid fa-phone text-amber-400 mr-2"></i> {currentUser.phone || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu (Individualized Colorful Presets) */}
          <nav className="space-y-2 w-full text-left" id="student-sidebar-options">
            
            {/* Beranda */}
            <button
              onClick={() => { setActiveSubTab('home'); setSelectedPkgId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                activeSubTab === 'home'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-house text-sm w-5 text-center"></i>
              <span>Beranda</span>
            </button>

            {/* List Paket Ujian */}
            <button
              onClick={() => { setActiveSubTab('cbt'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                activeSubTab === 'cbt'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-file-invoice text-sm w-5 text-center"></i>
              <span>List Paket Ujian</span>
            </button>

            {/* Analisa dan Pembahasan */}
            <button
              onClick={() => { setActiveSubTab('stats'); setSelectedPkgId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                activeSubTab === 'stats'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-chart-pie text-sm w-5 text-center"></i>
              <span>Analisa & Pembahasan</span>
            </button>

            {/* Edit Profil */}
            <button
              onClick={() => { setActiveSubTab('profile'); setSelectedPkgId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-user-gear text-sm w-5 text-center"></i>
              <span>Edit Profil</span>
            </button>
            
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-2 mt-6">
          <button 
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 bg-red-900/40 hover:bg-red-800 text-red-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Keluar Portal</span>
          </button>
        </div>

      </aside>

      {/* ============================================== */}
      {/* 2. DYNAMIC WORKSPACE PANE WITH THEMED INDICATION */}
      {/* ============================================== */}
      <main className="flex-grow bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm min-h-[600px] overflow-hidden relative" id="student-workspace">
        
        {/* UPPER STATUS HEADER ACTION & THEME TOGGLER */}
        <div className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00705f] font-mono">
              PORTAL /
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-white bg-[#00705f] animate-pulse">
              {activeSubTab === 'home' && 'Beranda'}
              {activeSubTab === 'cbt' && (selectedPkgId ? 'Instruksi Sub-ujian' : 'List Paket Ujian')}
              {activeSubTab === 'stats' && 'Analisa & Pembahasan'}
              {activeSubTab === 'profile' && 'Edit Profil'}
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Theme color toggler */}
            <button
              onClick={handleToggleTheme}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer border border-slate-200"
              title="Ganti kombinasi warna gradasi layout"
            >
              <i className="fa-solid fa-palette text-amber-500 text-xs"></i>
              <span>Ganti Tema ({selectedTheme.themeName})</span>
            </button>

            {/* Refresh Quote button */}
            <button
              onClick={handleRandomQuoteRotation}
              className="p-1.5 bg-slate-50 hover:bg-slate-150 text-slate-600 rounded-lg border border-slate-150 transition-colors cursor-pointer"
              title="Sebut Quote tokoh acak"
            >
              <i className="fa-solid fa-rotate text-sm"></i>
            </button>
          </div>
        </div>

        {/* ============================================== */}
        {/* SUB-VIEW TAB 1: BERANDA */}
        {/* ============================================== */}
        {activeSubTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            {/* Themed Hero Area */}
            <div className={`bg-gradient-to-r ${selectedTheme.headerBg} text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-md transition-all duration-300`}>
              <div className="space-y-1.5 z-10 text-left">
                <span className="text-[9px] bg-white/20 text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  DASHBOARD AKADEMIS UTBK
                </span>
                <h2 className="font-display font-black text-2xl">Halo, {currentUser.fullname}!</h2>
                <p className="text-xs text-white/95 font-medium">Bimbel Kata Kita siap mengantarkan Anda meraih kursi PTN Favorit Impian!</p>
              </div>
              <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 rounded-xl border border-white/10 z-10 font-mono text-xs font-bold text-amber-300">
                <i className="fa-solid fa-shield-halved mr-1.5"></i> CBT Guard Active
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Animated Educational Quote Frame with live rotating capabilities */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-inner relative overflow-hidden">
              <span className="absolute -right-4 -bottom-6 text-9xl text-amber-500/10 font-serif">“</span>
              <div className="space-y-3.5 text-left relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-amber-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    KUTIPAN MOTIVASI & MAKNA FILOSOFINYA
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-800 italic font-black leading-relaxed">
                    "{activeQuote.text}"
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    — <span className="text-slate-800">{activeQuote.author}</span> ({activeQuote.role})
                  </p>
                </div>
                {activeQuote.meaning && (
                  <div className="p-3.5 bg-white/90 rounded-xl border border-amber-100 text-[10.5px] leading-relaxed text-slate-700 shadow-sm">
                    <strong className="text-amber-800 uppercase tracking-widest text-[9px] block mb-1">
                      <i className="fa-solid fa-lightbulb mr-1"></i> Penjabaran Makna Filosofis:
                    </strong>
                    {activeQuote.meaning}
                  </div>
                )}
              </div>
            </div>

            {/* Top Row Indicators with "Telah Dinilai/Dikerjakan" correctly renamed */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Rata-rata Nilai</span>
                <span className="text-xl font-black text-slate-800 font-mono">{dynamicAverageScore}%</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Total Sektor</span>
                <span className="text-xl font-black text-slate-800 font-mono">7 Sektor</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">TELAH DINILAI/DIKERJAKAN</span>
                <span className="text-xl font-black text-slate-800 font-mono">
                  {totalCompletedSubCount} / 7
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Integritas CBT</span>
                <span className="text-xs font-black text-emerald-600 uppercase block mt-1">100% LOLOS</span>
              </div>
            </div>

            {/* Instruction Guide Cards && Aturan Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Panduan Sukses Belajar */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 text-left">
                <h3 className="font-display font-black text-slate-800 text-xs tracking-wider uppercase mb-3 flex items-center text-[#00705f]">
                  <i className="fa-solid fa-graduation-cap mr-2"></i> Panduan Sukses Belajar
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00705f] font-black mr-1">✓</span>
                    <span>Pilih sub-ujian secara saksama di list paket pengerjaan.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00705f] font-black mr-1">✓</span>
                    <span>Latih teknik eliminasi taktis secara berkala.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#00705f] font-black mr-1">✓</span>
                    <span>Tinjau evaluasi skor di menu Analisa detail.</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: Aturan & Instruksi Utama Pengerjaan Ujian */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 text-left">
                <h3 className="font-display font-black text-[#842029] text-xs tracking-wider uppercase mb-3 flex items-center">
                  <i className="fa-solid fa-triangle-exclamation mr-2 text-red-500"></i> Aturan & Instruksi Utama
                </h3>
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="p-2.5 bg-red-50 text-[#842029] text-[10px] rounded-lg border border-red-200 leading-normal font-medium">
                    <strong>Fitur Anti-Curang:</strong> Ujian dipantau oleh server. Keluar layar browser (tab-switch) lebih dari 3 kali akan membatalkan hasil pengerjaan (Diskontinu / Diskualifikasi otomatis).
                  </div>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                    <li>Pastikan koneksi internet stabil sebelum mulai menekan tombol pengerjaan.</li>
                    <li>Gunakan pembagian alokasi waktu tiap-tiap sub-tes secara efisien.</li>
                    <li>Jika ragu-ragu menentukan jawaban, tandai tombol indikator ragu kuning.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSubTab('cbt')}
                className="px-6 py-3 bg-[#0a5c4d] hover:bg-[#00705f] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center space-x-2 transition-all"
              >
                <span>Buka List Paket Ujian Utama ➔</span>
              </button>
            </div>
          </div>
        )}


        {/* ============================================== */}
        {/* SUB-VIEW TAB 2: LIST PAKET UJIAN */}
        {/* ============================================== */}
        {activeSubTab === 'cbt' && !selectedPkgId && (
          <div className="space-y-6">
            <div className="border-b border-sidebar-100 pb-3 text-left">
              <span className="text-[10px] bg-teal-150 text-[#00705f] font-black uppercase px-2.5 py-1 rounded-full border border-teal-200">
                Pilih Kelompok Tryout Nasional CAT
              </span>
              <h2 className="font-display font-black text-2xl text-slate-800 mt-1">Daftar Paket Ujian</h2>
            </div>

            {/* Intercept list of packages click */}
            <TryoutDashboard 
              packages={packages}
              locks={locks}
              attempts={attempts}
              onStartExam={(pkgId) => {
                // Instantly open the custom subtests list view (Gambar 1 / Gambar 4)
                setSelectedPkgId(pkgId);
              }}
              userRole="student"
            />
          </div>
        )}

        {/* DETAILS SUBTEST CHECKLIST VIEW (Gambar 1 & Gambar 4) */}
        {activeSubTab === 'cbt' && selectedPkgId && !activeCBT && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Top Back Action */}
            <button
              onClick={() => setSelectedPkgId(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>← Kembali ke Daftar Paket Tryout</span>
            </button>

            {/* Header info bar of selected package */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                  UTBK SNBT SEKTOR
                </span>
                <h3 className="font-display font-black text-xl text-slate-800">
                  {packages.find(p => p.id === selectedPkgId)?.name || 'Tryout Nasional UTBK SNBT - Sektor TPS & Literasi'}
                </h3>
                <p className="text-xs text-slate-500">Evaluasi kesiapan UTBK SNBT dengan materi Penalaran Umum, Kuantitatif, Bacaan Menulis, dan Literasi Bahasa Indonesia/Inggris.</p>
              </div>

              {/* Status block info */}
              <div className="flex space-x-3 text-xs shrink-0 font-bold">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] block text-slate-400 font-bold uppercase">Total Sub-Ujian</span>
                  <span className="text-sm font-black text-slate-800 font-mono">7 Sektor</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] block text-slate-400 font-bold uppercase">Durasi Akbar</span>
                  <span className="text-sm font-black text-slate-800 font-mono">195 Menit</span>
                </div>
              </div>
            </div>

            {/* Subtests Active List Segment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-transparent border-b border-slate-100 pb-2">
                <h4 className="font-display font-black text-slate-800 text-xs tracking-wider uppercase flex items-center">
                  <i className="fa-solid fa-layer-group text-teal-600 mr-2"></i>
                  RINCIAN SUB-UJIAN AKTIF
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">Bisa dikerjakan secara bebas/acak selama belum dikunci</span>
              </div>

              {/* Grid or rows list of 7 sub-exams */}
              <div className="space-y-2.5 font-sans">
                {getSubtestsForPackage(selectedPkgId).map((sub, idx) => {
                  const subCompletedData = studentSubtestsForPkg[idx];
                  const hasFinished = !!subCompletedData;

                  return (
                    <div 
                      key={sub.id}
                      className="bg-white hover:bg-slate-50/60 p-4.5 rounded-xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-xs">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            <i className="fa-regular fa-clock mr-1"></i> {sub.duration} Menit
                            <span className="mx-2">•</span>
                            <i className="fa-regular fa-file-lines mr-1"></i> {sub.questionsCount} Butir Soal
                          </p>
                        </div>
                      </div>

                      {/* Display CTA action based on status */}
                      <div>
                        {hasFinished ? (
                          <div className="flex items-center space-x-2">
                            {/* Green pills checklist */}
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-black rounded-lg text-[10px] uppercase flex items-center">
                              <i className="fa-solid fa-check-double mr-1 text-[11px]"></i>
                              SELESAI
                            </span>
                            {/* Review Pembahasan */}
                            <button
                              onClick={() => {
                                setSelectedReviewData({
                                  pkgName: packages.find(p => p.id === selectedPkgId)?.name || 'Tryout Nasional UTBK SNBT',
                                  subtestIdx: idx,
                                  score: subCompletedData.score,
                                  correct: subCompletedData.correct,
                                  wrong: subCompletedData.wrong,
                                  empty: subCompletedData.empty,
                                  violations: subCompletedData.violations,
                                  disqualified: subCompletedData.disqualified,
                                  answers: subCompletedData.answers
                                });
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-[10px] uppercase cursor-pointer transition-all border border-slate-200"
                            >
                              Pembahasan »
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartSubtestLocal(selectedPkgId, idx)}
                            className="px-4 py-2 bg-[#00705f] hover:bg-[#005a4d] text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Mulai Sub-Ujian</span>
                            <i className="fa-solid fa-circle-play"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CBT EXAMINATION RUNTIME PLAYER ENGINE (Gambar 2) */}
        {activeSubTab === 'cbt' && activeCBT && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
            <div className="bg-slate-50 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[92vh] border border-slate-200">
              
              {/* Green layout custom Top Banner */}
              <div className="bg-[#00705f] px-6 py-4 text-white flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded font-black uppercase text-[10px]">
                    SUB-UJIAN STANDAR
                  </span>
                  <span className="font-bold truncate max-w-[350px] md:max-w-none">
                    Tryout Nasional UTBK SNBT - Sektor TPS & Literasi — {activeCBT.subtestName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const start = performance.now();
                    const res = confirm("Apakah Anda yakin membatalkan ujian? Progress jawaban sub-ujian ini tidak akan disimpan.");
                    const duration = performance.now() - start;
                    const isConfirmed = res || (res === false && duration < 50);
                    if (isConfirmed) {
                      setActiveCBT(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-black rounded-lg uppercase tracking-wider text-[10px]"
                >
                  Batalkan
                </button>
              </div>

              {/* Sub-exam information notice strip */}
              <div className="bg-slate-800 text-slate-100 px-6 py-2.5 flex justify-between items-center text-xs font-mono">
                <span>SEKTOR UJIAN AKTIF: <span className="text-[#00a896] font-bold">{activeCBT.subtestName}</span></span>
                <span>Butir Soal Ke: <span className="font-black text-[#00a896]">{activeCBT.currentQuestionIndex + 1}</span> dari <span className="font-black">{activeCBT.totalQuestions}</span></span>
              </div>

              {/* CBT Content Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-grow overflow-y-auto min-h-0">
                
                {/* Left question module column */}
                <div className="lg:col-span-8 p-6 space-y-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
                  {/* Dynamic loaded question */}
                  {(() => {
                    const activeQuestions = getQuestionsForSubtest(activeCBT.packageId, activeCBT.subtestName, activeCBT.subtestIndex);
                    const qData = activeQuestions[activeCBT.currentQuestionIndex];
                    if (!qData) return <p className="text-xs text-red-500 font-bold p-6">Soal tidak ditemukan untuk sub-ujian ini.</p>;

                    const currentAnswer = activeCBT.answers[activeCBT.currentQuestionIndex];

                    return (
                      <div className="space-y-5 text-left">
                        {/* Question Image (Atas position) */}
                        {qData.questionImage && (qData.questionImagePosition === 'atas' || !qData.questionImagePosition) && (
                          <div className="flex justify-center my-2">
                            <img 
                              src={qData.questionImage} 
                              alt="Gambar Soal" 
                              className="max-h-64 object-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Simulation header strip */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-705 text-slate-700 leading-relaxed">
                          {qData.question}
                        </div>

                        {/* Question Image (Tengah position) */}
                        {qData.questionImage && qData.questionImagePosition === 'tengah' && (
                          <div className="flex justify-center my-3">
                            <img 
                              src={qData.questionImage} 
                              alt="Gambar Soal" 
                              className="max-h-64 object-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Choice options list A-E */}
                        <div className="space-y-2.5">
                          {Object.entries(qData.options).map(([optKey, optText]) => {
                            const isSelected = currentAnswer === optKey;
                            const optImg = qData.optionImages?.[optKey];
                            const optImgPos = qData.optionImagePositions?.[optKey] || 'tengah';

                            return (
                              <button
                                key={optKey}
                                onClick={() => {
                                  setActiveCBT(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      answers: {
                                        ...prev.answers,
                                        [prev.currentQuestionIndex]: optKey
                                      }
                                    };
                                  });
                                }}
                                className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all flex flex-col space-y-2 ${
                                  isSelected 
                                    ? 'bg-[#00705f]/5 border-[#00705f] ring-1 ring-[#00705f]' 
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start space-x-3 w-full">
                                  <span className={`w-5 h-5 rounded-lg text-slate-800 flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                    isSelected ? 'bg-[#00705f] text-white' : 'bg-slate-105 bg-slate-100 text-slate-600'
                                  }`}>
                                    {optKey}
                                  </span>
                                  <div className="flex-grow text-slate-700 text-left leading-relaxed text-[11px] prose-sm">
                                    {/* Option Image (Atas / Atas Teks) */}
                                    {optImg && optImgPos === 'atas' && (
                                      <div className="mb-2">
                                        <img 
                                          src={optImg} 
                                          alt={`Gambar Pilihan ${optKey}`} 
                                          className="max-h-36 object-contain rounded bg-white border border-slate-150 p-1"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}

                                    <div>{optText}</div>

                                    {/* Option Image (Tengah / Dibawah Teks) */}
                                    {optImg && optImgPos === 'tengah' && (
                                      <div className="mt-2">
                                        <img 
                                          src={optImg} 
                                          alt={`Gambar Pilihan ${optKey}`} 
                                          className="max-h-36 object-contain rounded bg-white border border-slate-150 p-1"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Option Image (Bawah / Di dasar card kustom) */}
                                {optImg && optImgPos === 'bawah' && (
                                  <div className="pl-8 pb-1">
                                    <img 
                                      src={optImg} 
                                      alt={`Gambar Pilihan ${optKey}`} 
                                      className="max-h-36 object-contain rounded bg-white border border-slate-150 p-1"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Question Image (Bawah position) */}
                        {qData.questionImage && qData.questionImagePosition === 'bawah' && (
                          <div className="flex justify-center my-4">
                            <img 
                              src={qData.questionImage} 
                              alt="Gambar Soal" 
                              className="max-h-64 object-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right control column */}
                <div className="lg:col-span-4 bg-slate-100/60 p-6 border-t lg:border-t-0 lg:border-l border-slate-200 space-y-6 flex flex-col justify-between">
                  
                  <div className="space-y-5">
                    
                    {/* Countdown Ticker Box */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Countdown Sisa Waktu</span>
                      <span className="text-2xl font-black text-slate-800 font-mono inline-flex items-center mt-1">
                        <i className="fa-regular fa-clock text-rose-500 mr-2"></i>
                        {formatTimeSeconds(activeCBT.remainingSeconds)}
                      </span>
                    </div>

                    {/* Question navigation grid */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Navigasi Nomor Soal</span>
                      
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {Array.from({ length: activeCBT.totalQuestions }).map((_, idx) => {
                          const ans = activeCBT.answers[idx];
                          const isRagu = activeCBT.raguRagu[idx];
                          const isCurrent = activeCBT.currentQuestionIndex === idx;

                          let btnBg = 'bg-red-500 text-white'; // Belum dijawab (Merah)
                          if (isRagu) {
                            btnBg = 'bg-amber-500 text-white'; // Ragu-ragu (Kuning/Orange)
                          } else if (ans) {
                            btnBg = 'bg-emerald-600 text-white'; // Sudah diisi (Hijau)
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveCBT(prev => {
                                  if (!prev) return prev;
                                  return { ...prev, currentQuestionIndex: idx };
                                });
                              }}
                              className={`w-9 h-9 rounded-lg font-black text-xs transition-all active:scale-90 flex items-center justify-center cursor-pointer ${btnBg} ${
                                isCurrent ? 'ring-2 ring-black ring-offset-2' : ''
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[9px] text-slate-400 space-y-1 pt-2 border-t border-slate-100 uppercase font-sans font-bold">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-600 rounded mr-1.5 block"></span><span>Sudah Diisi</span></div>
                        <div className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded mr-1.5 block"></span><span>Ragu-Ragu</span></div>
                        <div className="flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded mr-1.5 block"></span><span>Belum Dijawab (Merah)</span></div>
                      </div>
                    </div>

                    {/* AI Anti-Cheat Block */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
                      <span className="text-[9px] font-black uppercase text-amber-400 block tracking-widest">
                        <i className="fa-solid fa-user-shield mr-1"></i> PENGAWASAN AKTIF (AI ANTI-CHEAT)
                      </span>
                      <p className="text-[10px] text-slate-300 leading-normal font-sans">
                        Lembar ujian Anda dipantau oleh pengawas otomatis Bimbel Kata Kita. Anda tidak diizinkan berganti tab browser atau me-minimize jendela.
                      </p>
                      <div className="pt-1.5 border-t border-white/5 flex justify-between text-[10px] font-mono">
                        <span>Kejadian keluar tab:</span>
                        <span className={`font-black ${activeCBT.tabSwitchViolations > 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}`}>
                          {activeCBT.tabSwitchViolations} / 3 Pelanggaran
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Actions buttons row */}
                  <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => {
                        setActiveCBT(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
                          };
                        });
                      }}
                      disabled={activeCBT.currentQuestionIndex === 0}
                      className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-250 disabled:opacity-40 text-slate-700 rounded-lg text-2xs uppercase tracking-wider font-extrabold cursor-pointer text-center text-xs"
                    >
                      ← Soal Sebelumnya
                    </button>
                    
                    {/* Ragu-ragu kuning check toggle */}
                    <button
                      onClick={() => {
                        setActiveCBT(prev => {
                          if (!prev) return prev;
                          const currentIsRagu = !!prev.raguRagu[prev.currentQuestionIndex];
                          return {
                            ...prev,
                            raguRagu: {
                              ...prev.raguRagu,
                              [prev.currentQuestionIndex]: !currentIsRagu
                            }
                          };
                        });
                      }}
                      className="flex-1 py-2.5 bg-amber-100 hover:bg-amber-150 text-amber-805 text-[#854d0e] rounded-lg text-2xs uppercase tracking-wider font-extrabold cursor-pointer text-center text-xs"
                    >
                      {activeCBT.raguRagu[activeCBT.currentQuestionIndex] ? '✓ Hilang Ragu' : '⚠ Ragu-Ragu (Kuning)'}
                    </button>

                    {/* Selesai and submit popup open */}
                    <button
                      onClick={() => {
                        // Gather correct counts dynamically
                        let filled = 0;
                        let empty = 0;
                        let ragu = 0;
                        for (let idx = 0; idx < activeCBT.totalQuestions; idx++) {
                          if (activeCBT.raguRagu[idx]) {
                            ragu++;
                          }
                          if (activeCBT.answers[idx]) {
                            filled++;
                          } else {
                            empty++;
                          }
                        }

                        // Set states to display popup (Gambar 3)
                        setShowCbtSubmitConfirmPopup({
                          filled,
                          empty,
                          ragu
                        });
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-2xs uppercase tracking-wider font-black cursor-pointer text-center text-xs shadow-md"
                    >
                      Selesai & Submit
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* CONFIRMATION END CBT POPUP DIALOGUE (Gambar 3) */}
        {(() => {
          if (!activeCBT || !showCbtSubmitConfirmPopup) return null;
          return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-center font-sans z-[60]">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 md:p-8 border border-slate-100 shadow-2xl space-y-6 relative">
                
                {/* Yellow Question Icon Circle Top Centered */}
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 mx-auto flex items-center justify-center text-3xl shadow-inner border border-amber-200">
                  ?
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-black text-slate-800 text-sm tracking-widest uppercase">
                    KONFIRMASI AKHIRI SUB-UJIAN
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Apakah Anda yakin menyelesaikan sub menu ujian ini? Setelah disubmit, respons lembar jawaban Anda akan langsung tersimpan dan terkunci secara otomatis.
                  </p>
                </div>

                {/* Sub-exam metrics summary boxes */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">Terjawab</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{showCbtSubmitConfirmPopup.filled} / 2</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">Belum Diisi</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{showCbtSubmitConfirmPopup.empty}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">Ragu-Ragu</span>
                    <span className="text-sm font-black text-slate-800 font-mono">{showCbtSubmitConfirmPopup.ragu}</span>
                  </div>
                </div>

                <div className="flex space-x-3 text-xs pt-1">
                  <button
                    onClick={() => setShowCbtSubmitConfirmPopup(null)}
                    className="flex-1 py-3 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg cursor-pointer text-xs"
                  >
                    NO (Kembali Ke Soal)
                  </button>
                  <button
                    onClick={() => {
                      const values = showCbtSubmitConfirmPopup;
                      setShowCbtSubmitConfirmPopup(null);
                      handleFinishCBTLocal(
                        activeCBT.packageId,
                        activeCBT.subtestIndex,
                        activeCBT.answers,
                        activeCBT.tabSwitchViolations,
                        false
                      );
                    }}
                    className="flex-1 py-3 bg-[#00705f] hover:bg-[#005a4d] text-white font-black rounded-lg shadow-md cursor-pointer text-xs"
                  >
                    OK (Ya, Selesaikan)
                  </button>
                </div>

              </div>
            </div>
          );
        })()}


        {/* ============================================== */}
        {/* SUB-VIEW TAB 3: ANALISA & PEMBAHASAN */}
        {/* ============================================== */}
        {activeSubTab === 'stats' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black uppercase px-2.5 py-1 rounded-full border border-indigo-200">
                DIAGNOSIS & SARAN KESIAPAN AKADEMIK ANDA
              </span>
              <h2 className="font-display font-black text-2xl text-slate-900 mt-2">Daftar Hasil Belajar Real-Time</h2>
            </div>

            {/* Row 1 Grid: Diagnosis & Saran metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#f8fafc] border border-slate-150 p-3.5 rounded-xl">
                <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider">Skor Rata-Rata Anda</span>
                <span className="text-lg font-black text-slate-800 font-mono">{dynamicAverageScore}%</span>
              </div>
              <div className="bg-[#f8fafc] border border-slate-150 p-3.5 rounded-xl">
                <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider">Sektor Terkuat Siswa</span>
                <span className="text-xs font-black text-emerald-600 truncate block mt-0.5" title={strongestSektor}>{strongestSektor}</span>
              </div>
              <div className="bg-[#f8fafc] border border-slate-150 p-3.5 rounded-xl">
                <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider">Saran Area Kelemahan</span>
                <span className="text-xs font-black text-red-650 truncate block mt-0.5 text-red-500" title={weakestSektor}>{weakestSektor}</span>
              </div>
              <div className="bg-[#f8fafc] border border-slate-150 p-3.5 rounded-xl">
                <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider">Total Sesi Tryout</span>
                <span className="text-lg font-black text-slate-800 font-mono">{totalCompletedSubCount} Kali</span>
              </div>
            </div>

            {/* Row 2: Prediksi Masuk & Target Kelulusan Kata Kita */}
            <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 leading-normal space-y-1">
              <span className="text-[9px] font-black uppercase text-sky-700 block tracking-wider">
                💡 PREDIKSI MASUK & TARGET KELULUSAN KATA KITA
              </span>
              <p className="text-xs text-slate-700">
                Status kesiapan akademis Anda saat ini adalah <span className="font-bold text-sky-800">{Number(dynamicAverageScore) >= 70 ? 'Optimal Lolos PTN Favorit' : 'Memerlukan Pemantapan Bertahap'}</span>. Sejarah mencatat bahwa siswa Kata Kita yang rajin meninjau pembahasan secara teliti memiliki rasio kelulusan melampaui 92.5% di PTN utama seperti UI, ITB, Unila, dan UGM. Tingkatkan fokus nalar dan atasi kelemahan sub-ujian Anda segera!
              </p>
            </div>

            {/* Row 3: Matriks SWOT Karakter Akademik Siswa (S-W-O-T Boxes matching layout) */}
            <div className="space-y-2.5">
              <h4 className="font-display font-black text-slate-800 text-xs tracking-wider uppercase">
                ⚙ MATRIKS SWOT KARAKTER AKADEMIK SISWA
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* S - Strength */}
                <div className="bg-[#0f5132] text-white p-5 rounded-2xl border border-emerald-500/25 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-black text-emerald-300 block tracking-widest">S • STRENGTH (KEKUATAN UTAMA)</span>
                    <p className="text-[10.5px] leading-relaxed text-slate-100 pt-1.5 font-normal">
                      Kemampuan analisis logis Anda pada bagian <span className="font-bold text-amber-300 underline">{strongestSektor !== 'Belum Ada' ? strongestSektor : 'Simulasi Ujian'}</span> menonjol dengan baik. Anda memiliki kecerdasan membaca pola teks cepat yang efektif serta integritas fokus pengerjaan yang bersih.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold text-right pt-2 block">✓ 100% Jujur Lolos</span>
                </div>

                {/* W - Weakness */}
                <div className="bg-[#842029] text-white p-5 rounded-2xl border border-rose-500/25 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-black text-rose-300 block tracking-widest">W • WEAKNESS (KELEMAHAN AKADEMIS)</span>
                    <p className="text-[10.5px] leading-relaxed text-slate-100 pt-1.5 font-normal">
                      Sumbatan skor berpotensi terjadi di area <span className="font-bold text-amber-300 underline">{weakestSektor !== 'Belum Ada' ? weakestSektor : 'Matematika / Kuantitatif'}</span>. Hal ini biasanya dipicu alokasi manajemen waktu tiap subtes yang kurang berimbang atau kebiasaan tergesa-gesa saat membaca rumus soal.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-rose-200 font-bold text-right pt-2 block">⚠ Perlu Pemantapan</span>
                </div>

                {/* O - Opportunity */}
                <div className="bg-[#004b7e] text-white p-5 rounded-2xl border border-sky-500/25 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-black text-sky-300 block tracking-widest">O • OPPORTUNITY (PELUANG SUKSES)</span>
                    <p className="text-[10.5px] leading-relaxed text-slate-100 pt-1.5 font-normal">
                      Belajar di portal siswa Kata Kita menawarkan paket kisi-kisi terstruktur. Mengulang pengerjaan paket terfokus secara konsisten diramalkan mampu mendongkrak akumulasi skor aman minimal +15% di sesi berikutnya!
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-sky-200 font-bold text-right pt-2 block">➔ Rapor Terpadu Aktif</span>
                </div>

                {/* T - Threat */}
                <div className="bg-[#9a3412] text-white p-5 rounded-2xl border border-orange-500/25 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-black text-amber-300 block tracking-widest">T • THREAT (ANCAMAN DISKUALIFIKASI)</span>
                    <p className="text-[10.5px] leading-relaxed text-slate-100 pt-1.5 font-normal">
                      Pengawasan super ketat server mendeteksi tab-switching seketika. Sanksi pembatalan otomatis (diskualifikasi nilai 0%) bagi pelanggaran layar di atas 3 kali adalah ancaman serius bagi kelulusan rapor.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-amber-200 font-bold text-right pt-2 block">⚡ Disiplin Diutamakan</span>
                </div>

              </div>
            </div>

            {/* Riwayat Ujian && Top Rankings split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Riwayat */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
                <h4 className="font-display font-black text-xs text-slate-800 tracking-wider uppercase">
                  ⌛ Riwayat Ujian / Tes Nasional Anda
                </h4>

                {totalCompletedSubCount === 0 ? (
                  <p className="text-xs text-slate-450 italic text-center py-8">Anda belom menyelesaikan ujian manapun. Silakan coba buka menu List Paket Ujian untuk berlatih.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(completedSubtests).flatMap(([pkgId, subtests]) => {
                      return Object.entries(subtests).map(([subIdxStr, data]: [string, any]) => {
                        const subName = SUBTESTS_LIST[Number(subIdxStr)].name;
                        const dateFormatted = data.dateCompleted ? new Date(data.dateCompleted).toLocaleDateString('id-ID') : '-';
                        return (
                          <div key={`${pkgId}-${subIdxStr}`} className="p-3 rounded-lg border border-slate-150 bg-slate-50 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{subName}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Sektor CAT • Selesai: {dateFormatted}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black font-mono text-[#00705f]">{data.score.toFixed(0)}%</span>
                              <button
                                onClick={() => {
                                  setSelectedReviewData({
                                    pkgName: packages.find(p => p.id === pkgId)?.name || 'Tryout Nasional UTBK SNBT',
                                    subtestIdx: Number(subIdxStr),
                                    score: data.score,
                                    correct: data.correct,
                                    wrong: data.wrong,
                                    empty: data.empty,
                                    violations: data.violations,
                                    disqualified: data.disqualified,
                                    answers: data.answers
                                  });
                                }}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold text-[9px] uppercase transition-colors"
                              >
                                Tinjau
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Top ranking */}
              {(() => {
                const allUsers: UserRegistry[] = studentUsers !== undefined ? studentUsers : JSON.parse(localStorage.getItem('katakita_users') || '[]');
                const allAttemptsList: StudentAttempt[] = allAttempts !== undefined ? allAttempts : JSON.parse(localStorage.getItem('katakita_student_attempts') || '[]');

                // Group attempts by student/userId and get the highest finalScore
                const studentScoresMap: { [userId: string]: { user: UserRegistry; maxScore: number } } = {};

                allAttemptsList.forEach(attempt => {
                  if (attempt.status === 'SUBMITTED' && typeof attempt.finalScore === 'number') {
                    const user = allUsers.find(u => u.id === attempt.userId && u.role === 'student');
                    if (user) {
                      const currentMax = studentScoresMap[attempt.userId]?.maxScore || -1;
                      if (attempt.finalScore > currentMax) {
                        studentScoresMap[attempt.userId] = {
                          user,
                          maxScore: attempt.finalScore
                        };
                      }
                    }
                  }
                });

                // Convert map to list and sort by score desc
                const leaderboards = Object.values(studentScoresMap)
                  .sort((a, b) => b.maxScore - a.maxScore)
                  .slice(0, 3); // Get top 3

                const medals = ['🥇', '🥈', '🥉'];

                return (
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
                    <h4 className="font-display font-black text-xs text-slate-850 tracking-wider uppercase text-amber-600 flex items-center space-x-1">
                      <span>🏆 Top 3 Rangking Nasional Bimbel</span>
                    </h4>

                    {leaderboards.length === 0 ? (
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
                        <p className="text-slate-400 text-[11px] font-bold">Belum Ada Ranking Terdata</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Papan peringkat nasional akan muncul otomatis setelah pendaftar menyelesaikan simulasi Tryout mereka secara real-time.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        {leaderboards.map((leader, idx) => (
                          <div 
                            key={leader.user.id} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              idx === 0 
                                ? 'bg-amber-500/5 border-amber-200/60 shadow-sm shadow-amber-500/5' 
                                : 'bg-slate-50/50 border-slate-150'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className="text-base shrink-0 select-none">{medals[idx] || '🎖️'}</span>
                              
                              {/* Photo rendering */}
                              {leader.user.photoUrl ? (
                                <img 
                                  src={leader.user.photoUrl} 
                                  alt={leader.user.fullname} 
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm animate-fade-in"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'; // Fallback to icon
                                  }}
                                />
                              ) : null}
                              
                              {(!leader.user.photoUrl) && (
                                <div className="w-8 h-8 rounded-full bg-[#00705f] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase">
                                  {leader.user.fullname.charAt(0)}
                                </div>
                              )}
                              
                              <div className="min-w-0">
                                <p className="font-black text-slate-800 truncate leading-tight text-[11.5px]">{leader.user.fullname}</p>
                                <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{leader.user.school || 'Siswa Bimbel Kata Kita'}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black text-slate-800 text-[11px] bg-slate-100 px-2 py-1 rounded-md">{leader.maxScore.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          </div>
        )}


        {/* ============================================== */}
        {/* SUB-VIEW TAB 4: EDIT PROFIL (PREMIUM SHOWN CARD) */}
        {/* ============================================== */}
        {activeSubTab === 'profile' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-pink-100 text-pink-700 font-black uppercase px-2.5 py-1 rounded-full border border-pink-200">
                PROFIL DAN DATA LOGIN SISWA
              </span>
              <h2 className="font-display font-black text-2xl text-slate-800 mt-1">Pengaturan Akun</h2>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                ✓ {profileSuccess}
              </div>
            )}

            {/* Premium, prominent eye-catching frame box with double golden/emerald boundary trims (PREMIUM SHOWN CARD as requested!) */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-[3px] rounded-3xl shadow-xl border-4 border-amber-400">
              <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6">
                
                {/* Visual Header */}
                <div className="flex flex-col sm:flex-row items-center sm:space-x-5 space-y-4 sm:space-y-0 pb-4 border-b border-slate-100">
                  <div className="relative shrink-0">
                    {profilePhotoUrl ? (
                      <img 
                        src={profilePhotoUrl} 
                        alt="Avatar Preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#00705f] text-white flex items-center justify-center font-bold text-xl uppercase">
                        {profileName ? profileName.charAt(0) : 'S'}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">GOLD SISWA</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-display font-black text-slate-800 text-sm tracking-wider uppercase">KATA KITA ELITE MEMBER</h3>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Lengkapi atau ubah profil Anda secara saksama di frame premium emas ini.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                  {/* Fullname */}
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* School Origin */}
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Asal Sekolah</label>
                    <input
                      type="text"
                      required
                      value={profileSchool}
                      onChange={(e) => setProfileSchool(e.target.value)}
                      placeholder="Contoh: SMAN 1 Jakarta"
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Alamat Email (Akun Login)</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* WhatsApp Phone */}
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Nomor WhatsApp Aktif</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Direct File Photo Upload Component */}
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold block">Foto Profil / Pasfoto Siswa</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50/55 hover:bg-slate-50 transition-colors">
                      <div className="shrink-0">
                        {profilePhotoUrl ? (
                          <div className="relative">
                            <img 
                              src={profilePhotoUrl} 
                              alt="Uploaded Preview" 
                              className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow"
                            />
                            <button
                              type="button"
                              onClick={() => setProfilePhotoUrl('')}
                              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-650 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow"
                              title="Hapus foto"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex flex-col items-center justify-center border-2 border-slate-200 border-dashed">
                            <i className="fa-solid fa-user text-2xl mb-1 text-slate-400"></i>
                            <span className="text-[8px] font-bold uppercase">KOSONG</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow space-y-1.5 text-center sm:text-left">
                        <p className="text-xs font-black text-slate-700">Unggah Berkas JPG atau PNG</p>
                        <p className="text-[9.5px] text-slate-400 leading-normal">Pilih berkas pasfoto langsung dari laptop atau HP Anda (Maksimal 2MB).</p>
                        
                        <div className="pt-1">
                          <label className="inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10.5px] font-extrabold rounded-lg cursor-pointer transition-all active:scale-95">
                            <i className="fa-solid fa-camera mr-1.5 text-xs text-slate-550"></i>
                            Pilih Foto Siswa
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert("Ukuran berkas melebihi batas maksimum 2MB!");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setProfilePhotoUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#00705f] hover:bg-[#005a4d] text-white font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center space-x-1 border border-[#00705f] hover:scale-102 transition-transform cursor-pointer shadow-md shadow-emerald-990/10"
                    >
                      <i className="fa-solid fa-cloud-arrow-up mr-1 text-[11px]"></i>
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ============================================== */}
      {/* 3. REVIEW DETAILS / PEMBAHASAN DIALOGUE (Gambar 5) */}
      {/* ============================================== */}
      {selectedReviewData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left font-sans">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Header Dialog (Review Hasil Tryout in orange) */}
            <div className="bg-amber-600 px-6 py-4.5 text-white flex justify-between items-center">
              <div>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                  REVIEW HASIL TRYOUT
                </span>
                <h3 className="font-display font-black text-lg mt-0.5">
                  {selectedReviewData.pkgName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReviewData(null)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold border border-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Grid of Results metrics (Gambar 5 style) */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[8.5px] block text-slate-400 font-bold uppercase">Skor Akhir</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{selectedReviewData.score.toFixed(0)}%</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[8.5px] block text-slate-400 font-bold uppercase">Benar</span>
                <span className="text-lg font-black text-[#00705f] font-mono">{selectedReviewData.correct} Soal</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[8.5px] block text-slate-400 font-bold uppercase">Salah / Kosong</span>
                <span className="text-lg font-black text-red-500 font-mono">{selectedReviewData.wrong + selectedReviewData.empty} Soal</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[8.5px] block text-slate-400 font-bold uppercase">Integritas CBT</span>
                <span className={`text-[10px] uppercase font-black tracking-wider block mt-1.5 ${
                  selectedReviewData.disqualified ? 'text-red-500 bg-red-50 px-1 rounded' : 'text-emerald-700 bg-emerald-50 px-1 rounded'
                }`}>
                  {selectedReviewData.disqualified ? 'DISKUALIFIKASI' : 'SIKAP JUJUR LOLOS'}
                </span>
              </div>
            </div>

            {/* Questions detail lists */}
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto min-h-0 text-xs">
              <h4 className="font-display font-black text-slate-400 text-[10px] tracking-wider uppercase mb-1">
                RINCIAN PEMBAHASAN TERPADU TIAP SOAL
              </h4>

              <div className="space-y-3.5 font-sans">
                {(SUB_QUESTIONS_DB[selectedReviewData.subtestIdx] || []).map((q, idx) => {
                  const studentAnswer = selectedReviewData.answers[idx];
                  const matchCorrect = studentAnswer === q.correct;

                  return (
                    <div key={idx} className="bg-[#f8fafc] p-4 rounded-xl border border-slate-150 space-y-2 text-left">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800">Soal Nomor {idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          matchCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {matchCorrect ? 'Benar (✓)' : studentAnswer ? 'Salah (✗)' : 'Kosong'}
                        </span>
                      </div>
                      
                      <p className="text-slate-600 leading-normal leading-relaxed">{q.question}</p>
                      
                      <div className="p-2.5 bg-white rounded-lg border border-slate-150 grid grid-cols-2 gap-4 text-[10.5px]">
                        <div>Pilihan Siswa: <span className="font-black font-mono text-slate-800">{studentAnswer || '-'}</span></div>
                        <div>Kunci Jawaban: <span className="font-black font-mono text-emerald-700">{q.correct}</span></div>
                      </div>

                      <div className="p-2.5 bg-amber-50 rounded border-l-2 border-amber-500 text-[10.5px] text-slate-650 leading-relaxed leading-normal">
                        <strong className="text-amber-800 block uppercase tracking-wider text-[9px] mb-0.5">PEMBAHASAN MODUL:</strong>
                        {q.explanation}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Footer close */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReviewData(null)}
                className="px-5 py-2 w-full sm:w-auto bg-slate-850 bg-slate-800 hover:bg-slate-750 text-white font-extrabold rounded-lg text-xs uppercase cursor-pointer"
              >
                Selesai Belajar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
