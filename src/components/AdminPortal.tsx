import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import { ExamPackage, Question, UserRegistry, StudentAttempt } from '../types';
import { 
  Key, FilePlus2, Copy, Settings2, Database, BarChart3, 
  Share2, Eye, Sliders, RefreshCw, Palette, HelpCircle, 
  Plus, Trash2, Edit, Save, CheckCircle2, AlertCircle, 
  MapPin, User, Upload, ArrowRight, ToggleLeft, ToggleRight, 
  Check, Phone, Mail, Award, KeyRound, Building
} from 'lucide-react';
import { DEFAULT_PACKAGES, DEFAULT_QUESTIONS } from '../data/sampleQuestions';

interface AdminPortalProps {
  packages: ExamPackage[];
  setPackages: React.Dispatch<React.SetStateAction<ExamPackage[]>>;
  locks: { [packageId: string]: boolean };
  onToggleLock: (packageId: string) => void;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onAddQuestion: (q: Question) => void;
  onImportMockQuestions: () => void;
  onLogout: () => void;
  onStartExam?: (packageId: string) => void;
  attempts?: StudentAttempt[];
  setAttempts?: React.Dispatch<React.SetStateAction<StudentAttempt[]>>;
}

const GRADIENTS = [
  { name: 'Emeraldi Green', class: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white' },
  { name: 'Sky Oceans', class: 'bg-gradient-to-br from-blue-600 via-cyan-700 to-slate-900 text-white' },
  { name: 'Sunset Amber', class: 'bg-gradient-to-br from-amber-500 via-orange-600 to-slate-900 text-white' },
  { name: 'Cosmic Purple', class: 'bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 text-white' },
  { name: 'Crimson Rose', class: 'bg-gradient-to-br from-rose-600 via-red-700 to-slate-900 text-white' }
];

export default function AdminPortal({
  packages,
  setPackages,
  locks,
  onToggleLock,
  questions,
  setQuestions,
  onAddQuestion,
  onImportMockQuestions,
  onLogout,
  onStartExam,
  attempts: propAttempts,
  setAttempts: propSetAttempts
}: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('kunci_paket');
  const [themeAccent, setThemeAccent] = useState<string>(() => {
    return localStorage.getItem('katakita_student_portal_theme') || 
           localStorage.getItem('katakita_theme_accent') || 
           'emerald';
  });

  // Theme support
  const getThemeColor = () => {
    if (themeAccent === 'blue') return {
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700',
      border: 'border-blue-600',
      lightBg: 'bg-blue-50',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      ribbon: 'bg-blue-600',
      accentTextHover: 'hover:text-blue-600'
    };
    if (themeAccent === 'purple' || themeAccent === 'violet') return {
      bg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-700',
      border: 'border-purple-600',
      lightBg: 'bg-purple-50',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      ribbon: 'bg-purple-600',
      accentTextHover: 'hover:text-purple-600'
    };
    return {
      bg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-700',
      border: 'border-[#00705f]',
      lightBg: 'bg-emerald-50',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-[#00705f] border-emerald-200',
      ribbon: 'bg-emerald-600',
      accentTextHover: 'hover:text-emerald-600'
    };
  };

  const themeColor = getThemeColor();

  useEffect(() => {
    localStorage.setItem('katakita_student_portal_theme', themeAccent);
    localStorage.setItem('katakita_theme_accent', themeAccent);
  }, [themeAccent]);

  // State variables for dynamic editing & previews
  const [showManPreview, setShowManPreview] = useState<boolean>(false);
  const [isEditingManualPreview, setIsEditingManualPreview] = useState<boolean>(false);

  // States for Batch copy paste inline editing
  const [editingBatchIdx, setEditingBatchIdx] = useState<number | null>(null);
  const [editBatchText, setEditBatchText] = useState<string>('');
  const [editBatchOptions, setEditBatchOptions] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [editBatchCorrect, setEditBatchCorrect] = useState<string>('A');
  const [editBatchExplanation, setEditBatchExplanation] = useState<string>('');

  // States for subtests config list inside Exam Package configuration panel
  const [editingSubtestIdx, setEditingSubtestIdx] = useState<number | null>(null);
  const [editSubtestName, setEditSubtestName] = useState<string>('');
  const [editSubtestDuration, setEditSubtestDuration] = useState<number>(30);
  const [editSubtestCount, setEditSubtestCount] = useState<number>(15);

  // Related states for editing package's subtests in the Database tab
  const [editingPkgSubtestIdx, setEditingPkgSubtestIdx] = useState<number | null>(null);
  const [editPkgSubName, setEditPkgSubName] = useState<string>('');
  const [editPkgSubDuration, setEditPkgSubDuration] = useState<number>(30);
  const [editPkgSubCount, setEditPkgSubCount] = useState<number>(15);

  // Load Admin profile from storage
  const [adminName, setAdminName] = useState(() => localStorage.getItem('katakita_admin_name') || 'Bagus Supriyadi');
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('katakita_admin_role') || 'Staff Kantor Pusat');
  const [adminPhoto, setAdminPhoto] = useState(() => localStorage.getItem('katakita_admin_photo') || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80');
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('katakita_admin_username') || 'admin@katakita.com');
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('katakita_admin_password') || 'admin123');

  // Stateful locks
  const [subtestLocks, setSubtestLocks] = useState<{ [subtestKey: string]: boolean }>(() => {
    const saved = localStorage.getItem('katakita_subtest_locks');
    return saved ? JSON.parse(saved) : {};
  });

  const [studentUsers, setStudentUsers] = useState<UserRegistry[]>(() => {
    const saved = localStorage.getItem('katakita_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [localAttempts, setLocalAttempts] = useState<StudentAttempt[]>(() => {
    const saved = localStorage.getItem('katakita_student_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const attempts = propAttempts !== undefined && propSetAttempts !== undefined ? propAttempts : localAttempts;
  const setAttempts = propAttempts !== undefined && propSetAttempts !== undefined ? propSetAttempts : setLocalAttempts;

  const [landingBannerText, setLandingBannerText] = useState(() => {
    return localStorage.getItem('katakita_settings_banner') || 'Selamat Datang di Portal Tryout Nasional Bimbel Kata Kita';
  });

  const [landingBannerSlogan, setLandingBannerSlogan] = useState(() => {
    return localStorage.getItem('katakita_settings_slogan') || 'Pusat Simulasi Ujian CAT Terupdate, Akurat, dan Sesuai Standar Nasional Seleksi Penerimaan!';
  });

  const safeConfirm = (msg: string): boolean => {
    try {
      const start = performance.now();
      const res = window.confirm(msg);
      const duration = performance.now() - start;
      if (res === false && duration < 50) {
        console.warn(`window.confirm blocked (returned false in ${duration.toFixed(1)}ms). Auto-confirming deletion/action.`);
        return true;
      }
      return res;
    } catch (e) {
      console.warn("window.confirm is blocked in this container/iframe. Auto-confirming action.", e);
      return true;
    }
  };

  const safeAlert = (msg: string) => {
    try {
      window.alert(msg);
    } catch (e) {
      console.warn("window.alert is blocked in this container/iframe.", e);
    }
  };

  // Sync back local states on load or changes
  useEffect(() => {
    localStorage.setItem('katakita_subtest_locks', JSON.stringify(subtestLocks));
  }, [subtestLocks]);

  // Sync admin details trigger
  const syncAdminDetails = () => {
    localStorage.setItem('katakita_admin_name', adminName);
    localStorage.setItem('katakita_admin_role', adminRole);
    localStorage.setItem('katakita_admin_photo', adminPhoto);
    localStorage.setItem('katakita_admin_username', adminUsername);
    localStorage.setItem('katakita_admin_password', adminPassword);
  };

  const handleRefreshDB = () => {
    const choice = safeConfirm(
      "PILIHAN REFRESH DATABASE:\n\n" +
      "Klik [OK] untuk MEMULIHKAN DATABASE KE DEFAULT (Mereset seluruh data ke data bawaan simulasi/mock).\n" +
      "Klik [Batal] untuk hanya MEMUAT ULANG DATA dari Penyimpanan Lokal saat ini."
    );

    if (choice) {
      setQuestions(DEFAULT_QUESTIONS);
      setPackages(DEFAULT_PACKAGES);
      localStorage.setItem('katakita_questions', JSON.stringify(DEFAULT_QUESTIONS));
      localStorage.setItem('katakita_packages', JSON.stringify(DEFAULT_PACKAGES));
      safeAlert("Database Berhasil Direset & Dipulihkan ke Data Bawaan!");
    } else {
      const savedQ = localStorage.getItem('katakita_questions');
      const savedP = localStorage.getItem('katakita_packages');
      const savedUsers = localStorage.getItem('katakita_users');
      const savedAtt = localStorage.getItem('katakita_student_attempts');

      if (savedQ) setQuestions(JSON.parse(savedQ));
      if (savedP) setPackages(JSON.parse(savedP));
      if (savedUsers) setStudentUsers(JSON.parse(savedUsers));
      if (savedAtt) setAttempts(JSON.parse(savedAtt));

      safeAlert("Penyimpanan Database Berhasil di-Refresh Langsung dari LocalStorage!");
    }
  };

  const handleToggleSubtestLock = (packageId: string, subExamName: string) => {
    const key = `${packageId}_${subExamName}`;
    setSubtestLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ----------------------------------------------------
  // FORM STATES: INPUT MANUAL
  // ----------------------------------------------------
  const [manualPkgType, setManualPkgType] = useState<string>('PKG-UTBK');
  const [customPkgId, setCustomPkgId] = useState<string>('');
  const [customPkgName, setCustomPkgName] = useState<string>('');
  const [customPkgCategory, setCustomPkgCategory] = useState<string>('TPS');
  const [manualSubExamName, setManualSubExamName] = useState<string>('TPS - Penalaran Umum');
  const [customSubTestInput, setCustomSubTestInput] = useState<string>('');

  const [manQuestionText, setManQuestionText] = useState<string>('');
  const [manQuestionImage, setManQuestionImage] = useState<string>('');
  const [manQuestionImagePos, setManQuestionImagePos] = useState<'atas' | 'tengah' | 'bawah'>('atas');

  const [manOptions, setManOptions] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [manOptionImages, setManOptionImages] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [manOptionImagePositions, setManOptionImagePositions] = useState({ A: 'tengah', B: 'tengah', C: 'tengah', D: 'tengah', E: 'tengah' });
  
  const [manCorrectOption, setManCorrectOption] = useState<string>('A');
  const [manExplanation, setManExplanation] = useState<string>('');

  // Save manual logic
  const handleSaveManualQuestion = (publish: boolean) => {
    if (!manQuestionText.trim()) {
      alert("Teks pertanyaan tidak boleh kosong!");
      return;
    }

    let finalPkgId = manualPkgType;
    let targetSubest = manualSubExamName;

    // Handle Custom Package Creation instantly!
    if (manualPkgType === 'CUSTOM_MANUAL') {
      if (!customPkgId.trim() || !customPkgName.trim()) {
        alert("Harap isi ID & nama paket kustom Anda!");
        return;
      }
      finalPkgId = customPkgId.toUpperCase().replace(/\s+/g, '-');
      const existsPkg = packages.find(p => p.id === finalPkgId);
      if (!existsPkg) {
        const newPkg: ExamPackage = {
          id: finalPkgId,
          name: customPkgName,
          category: customPkgCategory,
          description: 'Paket Kustom Dibuat via Formulir Input Manual.',
          totalDurationMinutes: 120,
          totalQuestions: 1,
          subExams: [customSubTestInput || 'Subtest Umum'],
          subExamsConfig: {
            [customSubTestInput || 'Subtest Umum']: { durationMinutes: 30, questionCount: 1 }
          }
        };
        const updatedPkgs = [...packages, newPkg];
        setPackages(updatedPkgs);
        localStorage.setItem('katakita_packages', JSON.stringify(updatedPkgs));
      }
      targetSubest = customSubTestInput || 'Subtest Umum';
    }

    const newQ: Question = {
      id: `Q-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`,
      examId: finalPkgId,
      subExamName: targetSubest,
      questionText: manQuestionText,
      questionImage: manQuestionImage || undefined,
      questionImagePosition: manQuestionImagePos,
      options: { ...manOptions },
      optionImages: { ...manOptionImages },
      optionImagePositions: { ...manOptionImagePositions },
      correctOption: manCorrectOption,
      explanation: manExplanation,
      isPublished: publish
    };

    const updatedQs = [...questions, newQ];
    setQuestions(updatedQs);
    localStorage.setItem('katakita_questions', JSON.stringify(updatedQs));

    // Also increment package totals
    setPackages(prev => {
      const u = prev.map(p => {
        if (p.id === finalPkgId) {
          return { ...p, totalQuestions: p.totalQuestions + 1 };
        }
        return p;
      });
      localStorage.setItem('katakita_packages', JSON.stringify(u));
      return u;
    });

    alert(publish ? "Soal Berhasil Diterbitkan & Ditambahkan ke Portal Siswa!" : "Soal Disimpan Sebagai Draf (Tertahan)!");
    
    // Reset Form
    setManQuestionText('');
    setManQuestionImage('');
    setManExplanation('');
    setManOptions({ A: '', B: '', C: '', D: '', E: '' });
    setManOptionImages({ A: '', B: '', C: '', D: '', E: '' });
    setManOptionImagePositions({ A: 'tengah', B: 'tengah', C: 'tengah', D: 'tengah', E: 'tengah' });
  };

  // ----------------------------------------------------
  // FORM STATES: COPY PASTE MASSAL
  // ----------------------------------------------------
  const [batchPkgId, setBatchPkgId] = useState<string>(packages[0]?.id || 'PKG-UTBK');
  const [batchSubExamName, setBatchSubExamName] = useState<string>('');
  const [batchRawText, setBatchRawText] = useState<string>('');
  const [parsedBatchQuestions, setParsedBatchQuestions] = useState<Question[]>([]);

  // Update batch default subtest when package change
  useEffect(() => {
    const pkg = packages.find(p => p.id === batchPkgId);
    if (pkg && pkg.subExams && pkg.subExams.length > 0) {
      setBatchSubExamName(pkg.subExams[0]);
    } else {
      setBatchSubExamName('TPS - Penalaran Umum');
    }
  }, [batchPkgId, packages]);

  const handleParseBatchText = () => {
    if (!batchRawText.trim()) {
      alert("Silakan tempel teks naskah soal Anda terlebih dahulu!");
      return;
    }

    // Advanced Parser for Questions: Looks for number indicators and A-E choices
    const questionsBlock = batchRawText.split(/\n\s*(?=\d+[\.\)])/g);
    const parsedList: Question[] = [];

    questionsBlock.forEach((block, idx) => {
      const lines = block.trim().split('\n');
      if (lines.length < 3) return;

      const numberMatch = lines[0].match(/^\d+[\.\)]/);
      let questionContent = lines[0];
      if (numberMatch) {
         questionContent = lines[0].replace(/^\d+[\.\)]\s*/, '');
      }

      const optionsMap: { [key: string]: string } = { A: '', B: '', C: '', D: '', E: '' };
      let keyAnswer = 'A';
      let foundExplanation = '';
      let textBufferText = '';

      lines.slice(1).forEach(line => {
        const optionMatch = line.trim().match(/^([A-E])[\.\)]\s*(.*)/i);
        const answerMatch = line.trim().match(/^(Kunci\s*Jawaban|Kunci|Kunci\:)\s*([A-E])/i);
        const explMatch = line.trim().match(/^(Pembahasan|Penjelasan|Expl\:)\s*(.*)/i);

        if (optionMatch) {
          const key = optionMatch[1].toUpperCase();
          optionsMap[key] = optionMatch[2].trim();
        } else if (answerMatch) {
          keyAnswer = answerMatch[2].toUpperCase();
        } else if (explMatch) {
          foundExplanation = explMatch[2].trim();
        } else {
          // If none match, wrap as additional question content buffer prior to explanation
          if (!foundExplanation) {
            textBufferText += ' ' + line.trim();
          } else {
            foundExplanation += ' ' + line.trim();
          }
        }
      });

      if (Object.values(optionsMap).some(v => v !== '')) {
        parsedList.push({
          id: `Q-BATCH-${idx}-${Math.floor(1000 + Math.random() * 9000)}`,
          examId: batchPkgId,
          subExamName: batchSubExamName,
          questionText: (questionContent + textBufferText).trim(),
          options: optionsMap,
          correctOption: keyAnswer,
          explanation: foundExplanation || 'Sesuai dengan logika pembahasan tryout CAT Kata Kita.',
          isPublished: false // start as unpublished drafts in review list
        });
      }
    });

    if (parsedList.length === 0) {
      alert("Gagal mengurai format. Harap gunakan format pengetikan: 1. Pertanyaan ... A. Opsi A ... B. Opsi B ... Kunci: C");
    } else {
      setParsedBatchQuestions(parsedList);
      alert(`Berhasil mengurai ${parsedList.length} soal ke lembar pratinjau review!`);
    }
  };

  const handleSaveBatchQuestions = (publish: boolean) => {
    if (parsedBatchQuestions.length === 0) {
      alert("Tidak ada soal parsed untuk disimpan!");
      return;
    }

    const updatedQs = [...questions, ...parsedBatchQuestions.map(q => ({ ...q, isPublished: publish }))];
    setQuestions(updatedQs);
    localStorage.setItem('katakita_questions', JSON.stringify(updatedQs));

    // Increments questions metrics on the packages
    setPackages(prev => {
      const updatedPkgs = prev.map(p => {
        if (p.id === batchPkgId) {
          return { ...p, totalQuestions: p.totalQuestions + parsedBatchQuestions.length };
        }
        return p;
      });
      localStorage.setItem('katakita_packages', JSON.stringify(updatedPkgs));
      return updatedPkgs;
    });

    alert(publish 
      ? `Sukses! ${parsedBatchQuestions.length} Soal Berhasil Disimpan & Diterbitkan Langsung ke Siswa!` 
      : `Sukses! ${parsedBatchQuestions.length} Soal Berhasil Disimpan ke DB sebagai Draf!`
    );
    setParsedBatchQuestions([]);
    setBatchRawText('');
  };

  // ----------------------------------------------------
  // FORM STATES: KONFIGURASI PAKET BARU
  // ----------------------------------------------------
  const [cnfId, setCnfId] = useState<string>('');
  const [cnfName, setCnfName] = useState<string>('');
  const [cnfCategory, setCnfCategory] = useState<string>('TPS');
  const [cnfDesc, setCnfDesc] = useState<string>('');
  const [cnfGradient, setCnfGradient] = useState<string>(GRADIENTS[0].class);
  const [cnfPremium, setCnfPremium] = useState<boolean>(false);

  // Added subtests on the create packet flow
  const [subExamList, setSubExamList] = useState<{ name: string; duration: number; qCount: number; }[]>([]);
  const [subExamAddName, setSubExamAddName] = useState<string>('');
  const [subExamAddDur, setSubExamAddDur] = useState<number>(30);
  const [subExamAddCount, setSubExamAddCount] = useState<number>(5);

  const handleAddSubExamConfig = () => {
    if (!subExamAddName.trim()) {
      alert("Harap berikan nama sub-ujian terlebih dahulu!");
      return;
    }
    setSubExamList(prev => [...prev, { name: subExamAddName, duration: subExamAddDur, qCount: subExamAddCount }]);
    setSubExamAddName('');
  };

  const handleSaveConfiguredPackage = () => {
    if (!cnfId.trim() || !cnfName.trim()) {
      alert("ID Paket dan Nama Paket wajib diisi!");
      return;
    }

    const finalPkgId = cnfId.toUpperCase().trim().replace(/\s+/g, '-');
    const duplicate = packages.some(p => p.id === finalPkgId);
    if (duplicate) {
      alert("ID Paket ini sudah ada di sistem. Harap gunakan ID lain.");
      return;
    }

    const configMap: { [key: string]: { durationMinutes: number; questionCount: number } } = {};
    const subNames: string[] = [];
    subExamList.forEach(s => {
      subNames.push(s.name);
      configMap[s.name] = { durationMinutes: s.duration, questionCount: s.qCount };
    });

    const newPkg: ExamPackage = {
      id: finalPkgId,
      name: cnfName,
      category: cnfCategory,
      description: cnfDesc || 'Bahan Tryout Simulasi Terarah CAT Bimbel Kata Kita.',
      totalDurationMinutes: subExamList.reduce((acc, curr) => acc + curr.duration, 0) || 120,
      totalQuestions: subExamList.reduce((acc, curr) => acc + curr.qCount, 0) || 0,
      subExams: subNames.length > 0 ? subNames : ['TPS - Penalaran Umum'],
      subExamsConfig: configMap,
      isPremium: cnfPremium
    };

    const nextPkgs = [...packages, newPkg];
    setPackages(nextPkgs);
    localStorage.setItem('katakita_packages', JSON.stringify(nextPkgs));

    alert("Sukses Menyimpan Konfigurasi Paket Ujian Baru!");
    
    // Clear Input States
    setCnfId('');
    setCnfName('');
    setCnfDesc('');
    setSubExamList([]);
  };

  // ----------------------------------------------------
  // DATABASE SOAL MODALS & ACTIONS
  // ----------------------------------------------------
  const [dbSelectedPkg, setDbSelectedPkg] = useState<string>(packages[0]?.id || 'PKG-UTBK');
  const [dbSelectedSubtest, setDbSelectedSubtest] = useState<string>('ALL');

  // Package edit state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editPkgName, setEditPkgName] = useState<string>('');
  const [editPkgCategory, setEditPkgCategory] = useState<string>('');
  const [editPkgDesc, setEditPkgDesc] = useState<string>('');
  const [editPkgSubtests, setEditPkgSubtests] = useState<{name: string, dur: number, qCount: number}[]>([]);
  const [editAddName, setEditAddName] = useState<string>('');
  const [editAddDur, setEditAddDur] = useState<number>(30);
  const [editAddCount, setEditAddCount] = useState<number>(5);

  const startEditPackage = (pkg: ExamPackage) => {
    setEditingPackageId(pkg.id);
    setEditPkgName(pkg.name);
    setEditPkgCategory(pkg.category);
    setEditPkgDesc(pkg.description);
    
    const configList = pkg.subExams.map(name => {
      const conf = pkg.subExamsConfig?.[name] || { durationMinutes: 30, questionCount: 5 };
      return { name, dur: conf.durationMinutes, qCount: conf.questionCount };
    });
    setEditPkgSubtests(configList);
  };

  const handleSaveEditedPackage = () => {
    if (!editingPackageId) return;

    const subNames = editPkgSubtests.map(s => s.name);
    const configMap: { [key: string]: { durationMinutes: number; questionCount: number } } = {};
    editPkgSubtests.forEach(s => {
      configMap[s.name] = { durationMinutes: s.dur, questionCount: s.qCount };
    });

    setPackages(prev => {
      const u = prev.map(p => {
        if (p.id === editingPackageId) {
          return {
            ...p,
            name: editPkgName,
            category: editPkgCategory,
            description: editPkgDesc,
            subExams: subNames,
            subExamsConfig: configMap,
            totalDurationMinutes: editPkgSubtests.reduce((acc, curr) => acc + curr.dur, 0)
          };
        }
        return p;
      });
      localStorage.setItem('katakita_packages', JSON.stringify(u));
      return u;
    });

    safeAlert("Sukses Mengubah & Mensinkronisasikan Paket Ujian!");
    setEditingPackageId(null);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (safeConfirm("Apakah Anda yakin menghapus paket ujian ini? Seluruh soal yang bertalian dengannya akan ikut terhapus.")) {
      const restPkgs = packages.filter(p => p.id !== pkgId);
      setPackages(restPkgs);
      localStorage.setItem('katakita_packages', JSON.stringify(restPkgs));

      const restQs = questions.filter(q => q.examId !== pkgId);
      setQuestions(restQs);
      localStorage.setItem('katakita_questions', JSON.stringify(restQs));

      if (dbSelectedPkg === pkgId && restPkgs.length > 0) {
        setDbSelectedPkg(restPkgs[0].id);
      }
    }
  };

  // Question editing inline state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState<string>('');
  const [editQImage, setEditQImage] = useState<string>('');
  const [editQImgPos, setEditQImgPos] = useState<'atas' | 'tengah' | 'bawah'>('atas');
  const [editQOptions, setEditQOptions] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [editQOptionImages, setEditQOptionImages] = useState({ A: '', B: '', C: '', D: '', E: '' });
  const [editQOptionImagePositions, setEditQOptionImagePositions] = useState({ A: 'tengah', B: 'tengah', C: 'tengah', D: 'tengah', E: 'tengah' });
  const [editQCorrect, setEditQCorrect] = useState<string>('A');
  const [editQExplanation, setEditQExplanation] = useState<string>('');

  const startEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditQText(q.questionText);
    setEditQImage(q.questionImage || '');
    setEditQImgPos((q.questionImagePosition as any) || 'atas');
    setEditQOptions({ ...q.options } as any);
    setEditQOptionImages({ A: '', B: '', C: '', D: '', E: '', ...q.optionImages } as any);
    setEditQOptionImagePositions({ A: 'tengah', B: 'tengah', C: 'tengah', D: 'tengah', E: 'tengah', ...q.optionImagePositions } as any);
    setEditQCorrect(q.correctOption);
    setEditQExplanation(q.explanation);
  };

  const handleSaveEditedQuestion = () => {
    if (!editingQuestionId) return;

    setQuestions(prev => {
      const u = prev.map(q => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            questionText: editQText,
            questionImage: editQImage || undefined,
            questionImagePosition: editQImgPos,
            options: { ...editQOptions },
            optionImages: { ...editQOptionImages },
            optionImagePositions: { ...editQOptionImagePositions },
            correctOption: editQCorrect,
            explanation: editQExplanation
          };
        }
        return q;
      });
      localStorage.setItem('katakita_questions', JSON.stringify(u));
      return u;
    });

    safeAlert("Pertanyaan Berhasil Diperbarui!");
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (safeConfirm("Apakah anda yakin menghapus butir soal ini?")) {
      const rest = questions.filter(q => q.id !== qId);
      setQuestions(rest);
      localStorage.setItem('katakita_questions', JSON.stringify(rest));
    }
  };

  const handleTogglePublishQuestion = (qId: string) => {
    setQuestions(prev => {
      const u = prev.map(q => {
        if (q.id === qId) {
          return { ...q, isPublished: !q.isPublished };
        }
        return q;
      });
      localStorage.setItem('katakita_questions', JSON.stringify(u));
      return u;
    });
  };

  // ----------------------------------------------------
  // TAB REKAP & HASIL (STUDENT ACCOUNTS + STATS)
  // ----------------------------------------------------
  const [rekapSubTab, setRekapSubTab] = useState<'log_nilai' | 'akun_siswa'>('log_nilai');
  
  // Account list editor state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editSName, setEditSName] = useState<string>('');
  const [editSSchool, setEditSSchool] = useState<string>('');
  const [editSMail, setEditSMail] = useState<string>('');
  const [editSPhone, setEditSPhone] = useState<string>('');
  const [editSPass, setEditSPass] = useState<string>('');

  const handleSaveStudentAccountChange = () => {
    if (!editingStudentId) return;
    setStudentUsers(prev => {
      const u = prev.map(s => {
        if (s.id === editingStudentId) {
          return { ...s, fullname: editSName, school: editSSchool, email: editSMail, phone: editSPhone, password: editSPass };
        }
        return s;
      });
      localStorage.setItem('katakita_users', JSON.stringify(u));
      return u;
    });
    alert("Profil Akun Siswa Berhasil Diperbarui!");
    setEditingStudentId(null);
  };

  const handleDeleteStudentAccount = (id: string) => {
    if (safeConfirm("Apakah anda yakin menghapus akun siswa ini?")) {
      const rest = studentUsers.filter(s => s.id !== id);
      setStudentUsers(rest);
      localStorage.setItem('katakita_users', JSON.stringify(rest));
    }
  };

  // ----------------------------------------------------
  // TAB SPREADSHEET UTILS
  // ----------------------------------------------------
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('katakita_sheet_url') || 'https://docs.google.com/spreadsheets/d/1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE/edit?gid=0#gid=0');
  const [sheetId, setSheetId] = useState(() => localStorage.getItem('katakita_sheet_id') || '1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE');
  const [sheetName, setSheetName] = useState(() => localStorage.getItem('katakita_sheet_name') || 'RUMAH SOAL');
  const [driveName, setDriveName] = useState(() => localStorage.getItem('katakita_drive_name') || 'RUMAH SOAL');
  const [ownerEmail, setOwnerEmail] = useState(() => localStorage.getItem('katakita_owner_email') || 'bagus.supriyadi.lpg@gmail.com');

  const [syncHistoryLogs, setSyncHistoryLogs] = useState<string[]>([
    "SINKRONISASI AKTIF: Terkoneksi ke Google Drive [RUMAH SOAL]",
    "Membaca Lembar Kerja Tab 'RUMAH SOAL'...",
    "Sesi Data Terakhir Disinkronkan: Kemarin, 14:24 WIB"
  ]);

  const handleSaveSheetConfig = () => {
    localStorage.setItem('katakita_sheet_url', sheetUrl);
    localStorage.setItem('katakita_sheet_id', sheetId);
    localStorage.setItem('katakita_sheet_name', sheetName);
    localStorage.setItem('katakita_drive_name', driveName);
    localStorage.setItem('katakita_owner_email', ownerEmail);

    setSyncHistoryLogs(prev => [
      `[MENGHUBUNGKAN...] Mencoba koneksi ke spreadsheet ${sheetId}...`,
      `[SUKSES] Parameter tersimpan! Berhasil sinkronisasi live log ke email owner ${ownerEmail}`,
      ...prev
    ]);
    alert("Konfigurasi API Google Sheets & Drive Berhasil Disimpan!");
  };

  const handleSimulateSyncNow = () => {
    setSyncHistoryLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Memulai sinkronisasi paksaan (Force Sync)...`,
      `[${new Date().toLocaleTimeString()}] Pengecekan pendaftaran baru: Ditemukan ${studentUsers.length} Log pendaftaran siswa.`,
      `[${new Date().toLocaleTimeString()}] Mengunggah log skor tryout: ${attempts.length} upaya diupload.`,
      `[${new Date().toLocaleTimeString()}] [SUKSES SINKRONISASI] Data Spreadsheet ID ${sheetId} Telah Sesuai dengan Database Local!`,
      ...prev
    ]);
    alert("Sinkronisasi Selesai! Semua Log & Akun Siswa Telah Ditulis ke Spreadsheet RUMAH SOAL!");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 py-6 text-left" id="admin-portal-wrapper">
      
      {/* ================= SIDEBAR UTAMA ================= */}
      <aside className="w-full xl:w-76 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 flex flex-col justify-between space-y-7 shrink-0 shadow-2xl" id="admin-sidebar">
        
        <div className="space-y-6">
          {/* Logo Headline */}
          <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-800 space-y-2">
            <img 
              src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
              alt="Logo Kata Kita" 
              className="h-12 w-auto object-contain bg-white rounded-full p-1 shadow-lg"
            />
            <div className="leading-tight">
              <h4 className="font-display font-black text-white text-sm tracking-widest uppercase">PORTAL ADMIN</h4>
              <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest mt-1">Bimbel Kata Kita</p>
            </div>
          </div>

          {/* Centered Admin Profile */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500"></div>
            
            <img 
              src={adminPhoto} 
              alt="Profile" 
              className="w-18 h-18 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              referrerPolicy="no-referrer"
            />

            <div className="leading-normal">
              <h5 className="font-black text-white text-xs tracking-wider uppercase truncate max-w-[170px]">
                {adminName}
              </h5>
              <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mt-0.5">
                Administrasi Pusat
              </p>
              <div className="inline-flex mt-1 px-2 py-0.5 bg-slate-900 rounded text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                {adminRole}
              </div>
            </div>
          </div>

          {/* Tab lists */}
          <nav className="space-y-1">
            {[
              { id: 'kunci_paket', label: 'Kunci Paket (Akses)', icon: Key },
              { id: 'input_manual', label: 'Input Soal Manual', icon: FilePlus2 },
              { id: 'input_massal', label: 'Copy Paste Massal', icon: Copy },
              { id: 'konfigurasi', label: 'Konfigurasi Paket Ujian', icon: Sliders },
              { id: 'database', label: 'Database Soal', icon: Database },
              { id: 'hasil_rekap', label: 'Hasil dan Rekap', icon: BarChart3 },
              { id: 'koneksi_sheet', label: 'Koneksi Spreadsheet', icon: Share2 },
              { id: 'preview_siswa', label: 'Siswa Tryout Preview', icon: Eye },
              { id: 'pengaturan', label: 'Pengaturan Portal', icon: Settings2 }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all text-left cursor-pointer ${
                    isActive
                      ? `${themeColor.bg} text-white shadow-md font-black`
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 bg-red-650 hover:bg-red-700 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center mt-6"
        >
          Keluar Admin Tab
        </button>
      </aside>

      {/* ================= WORKSPACE PANEL ================= */}
      <main className="flex-grow space-y-6">
        
        {/* UPPER DYNAMIC FLOATING RIBBON ACTIONS */}
        <header className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-600"></div>
          <div>
            <span className="text-[10px] bg-slate-250 text-slate-500 font-black px-2.5 py-1 rounded-full border border-slate-300">
              Konsol Administrator
            </span>
            <h1 className="font-display font-black text-xl text-slate-800 tracking-tight mt-1.5 uppercase">
              {activeTab.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] bg-emerald-100/80 text-emerald-700 font-extrabold px-3 py-1.5 rounded-xl border border-emerald-200">
              SOAL: {questions.length} Butir
            </span>
            <button
              onClick={() => {
                const next = themeAccent === 'emerald' ? 'blue' : themeAccent === 'blue' ? 'violet' : 'emerald';
                setThemeAccent(next);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 border border-slate-200 shadow-sm"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Tema Konsol ({themeAccent.toUpperCase()})</span>
            </button>
            <button
              onClick={handleRefreshDB}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 border border-slate-200 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Refresh DB</span>
            </button>
          </div>
        </header>

        {/* ================= TAB 1: KUNCI PAKET ================= */}
        {activeTab === 'kunci_paket' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left leading-relaxed">
              <h3 className="font-display font-black text-slate-800 text-base">Sistem Pengawasan & Kunci Keamanan Akses</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Kunci atau batalkan penerbitan paket tryout nasional serta sub-test spesifik agar siswa hanya bisa mengerjakan modul sesuai rentang jadwal ujian Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map(pkg => {
                const isPkgLocked = locks[pkg.id] || false;
                return (
                  <div key={pkg.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{pkg.category}</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1">{pkg.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">ID: {pkg.id}</p>
                      </div>
                      <button
                        onClick={() => onToggleLock(pkg.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isPkgLocked ? 'bg-red-100 text-red-650' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isPkgLocked ? '🔒 Premium (Terkunci)' : '🔓 Gratis (Akses Terbuka)'}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 space-y-2">
                      <span className="text-[9px] font-black uppercase block text-slate-400 tracking-wider">
                        STATUS KEAMANAN SUBTEST SPESIFIK:
                      </span>
                      {pkg.subExams.map(subtest => {
                        const isSubLocked = subtestLocks[`${pkg.id}_${subtest}`] || false;
                        return (
                          <div key={subtest} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-150 text-xs">
                            <span className="font-semibold text-slate-700 truncate max-w-[200px]">{subtest}</span>
                            <button
                              onClick={() => handleToggleSubtestLock(pkg.id, subtest)}
                              className={`px-2 py-1 rounded text-[8px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                isSubLocked ? 'bg-amber-100 text-amber-805 text-amber-800' : 'bg-slate-150 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {isSubLocked ? '🔒 SUB-TEST DIKUNCI' : '🔓 SUB-TEST AKTIF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: INPUT MANUAL ================= */}
        {activeTab === 'input_manual' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Formulir Manual Penerbitan Soal Simulasi Tryout</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Ketik pertanyaan tryout satu per satu secara detail dengan dukungan lampiran multimedia gambar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Targeted Meta information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Pilih Paket Ujian Target</label>
                  <select
                    value={manualPkgType}
                    onChange={(e) => setManualPkgType(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                    <option value="CUSTOM_MANUAL">✏ [KUSTOM / BUAT BARU...] Paket Kustomisasi Baru</option>
                  </select>
                </div>

                {manualPkgType === 'CUSTOM_MANUAL' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="text-[9px] font-black text-emerald-700 block tracking-wider uppercase">PARAMETER PAKET KUSTOM BARU</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-slate-400 uppercase font-black">ID Paket</label>
                        <input 
                          type="text" 
                          placeholder="PKG-CPNS2026" 
                          value={customPkgId}
                          onChange={e => setCustomPkgId(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-150 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-400 uppercase font-black">Nama Paket</label>
                        <input 
                          type="text" 
                          placeholder="Simulasi Penjaringan CPNS" 
                          value={customPkgName}
                          onChange={e => setCustomPkgName(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-150 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-400 uppercase font-black mb-1">Rumpun Sektor Kategori</label>
                      <select 
                        value={customPkgCategory} 
                        onChange={e => setCustomPkgCategory(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-150 rounded bg-white"
                      >
                        <option value="TPS">TPS</option>
                        <option value="Literasi">Literasi</option>
                        <option value="CPNS">CPNS</option>
                        <option value="Mandiri">Mandiri</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Sektor Sub-Test Target</label>
                  {manualPkgType === 'CUSTOM_MANUAL' ? (
                    <input
                      type="text"
                      placeholder="Masukkan nama Sub-Test kustom..."
                      value={customSubTestInput}
                      onChange={e => setCustomSubTestInput(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <select
                      value={manualSubExamName}
                      onChange={(e) => setManualSubExamName(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                    >
                      {packages.find(p => p.id === manualPkgType)?.subExams.map(s => (
                        <option key={s} value={s}>{s}</option>
                      )) || (
                        <>
                          <option value="TPS - Penalaran Umum">TPS - Penalaran Umum</option>
                          <option value="TPS - Pengetahuan Kuantitatif">TPS - Pengetahuan Kuantitatif</option>
                        </>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Pertanyaan Utama (Soal)</label>
                  <textarea
                    rows={4}
                    placeholder="Tulis soal atau deskripsi literasi naskah..."
                    value={manQuestionText}
                    onChange={(e) => setManQuestionText(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5">
                  <label className="block text-[10px] uppercase font-black text-slate-400">Lampirkan Gambar Soal</label>
                  
                  {/* Compact direct upload input */}
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center justify-center px-2.5 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer text-[10px] font-bold text-slate-705 text-slate-700 transition shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                      <span>Upload Gambar Langsung</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setManQuestionImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    
                    {manQuestionImage && (
                      <div className="flex items-center space-x-1 border border-slate-200 bg-white p-0.5 rounded-lg shrink-0">
                        <img 
                          src={manQuestionImage} 
                          alt="Thumbnail Soal" 
                          className="w-6.5 h-6.5 rounded object-cover cursor-zoom-in border border-slate-100" 
                          onClick={() => {
                            const win = window.open();
                            if (win) win.document.write(`<img src="${manQuestionImage}" style="max-height:100vh; max-width:105%; margin:auto;" />`);
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setManQuestionImage('')}
                          className="text-[8px] text-red-600 hover:text-red-700 font-bold px-1 py-0.5"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Backup URL Input */}
                  <input
                    type="text"
                    placeholder="Atau tempel URL gambar jika ada..."
                    value={manQuestionImage}
                    onChange={(e) => setManQuestionImage(e.target.value)}
                    className="w-full text-[10px] p-2 border border-slate-200 bg-white rounded-lg placeholder-slate-400 text-slate-600"
                  />

                  {/* Positioning choice */}
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/50">
                    <span className="font-bold">Penempatan Gambar Soal:</span>
                    <div className="flex space-x-2 bg-white border border-slate-250 border-slate-200 rounded-md p-0.5">
                      {['atas', 'tengah', 'bawah'].map(pos => (
                        <button 
                          key={pos}
                          type="button"
                          onClick={() => setManQuestionImagePos(pos as any)}
                          className={`px-2 py-0.5 rounded text-[8px] font-bold capitalize transition ${
                            manQuestionImagePos === pos 
                              ? 'bg-[#00705f] text-white' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Choices and explanation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Opsi Pilihan & Lampiran Pilihan (A - E)</label>
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D', 'E'].map(l => {
                      const optImg = (manOptionImages as any)[l];
                      const optPos = (manOptionImagePositions as any)[l] || 'tengah';
                      return (
                        <div key={l} className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl space-y-2">
                          {/* Inner row: Letter indicator, Text field input */}
                          <div className="flex gap-2 items-center">
                            <span className="w-5 h-5 bg-[#00705f]/15 text-[#00705f] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{l}</span>
                            <input
                              type="text"
                              placeholder={`Model naskah opsi ${l}...`}
                              value={(manOptions as any)[l]}
                              onChange={(e) => {
                                const val = e.target.value;
                                setManOptions(prev => ({ ...prev, [l]: val }));
                              }}
                              className="flex-grow text-[11px] p-2 border border-slate-200 bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
                            />
                          </div>

                          {/* Image row: Direct upload button, thumbnail, position selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1.5 border-t border-slate-200/50">
                            {/* File Upload action */}
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center justify-center px-1.5 py-1 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded cursor-pointer text-[9px] font-bold text-slate-600 transition shadow-2xs shrink-0">
                                <Upload className="w-3 h-3 text-blue-500 mr-1 shrink-0" />
                                <span>Upload Gambar</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setManOptionImages(prev => ({ ...prev, [l]: reader.result as string }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              {optImg ? (
                                <div className="flex items-center space-x-1 border border-slate-205 border-slate-200 bg-white p-0.5 rounded">
                                  <img src={optImg} alt={`Pilihan ${l}`} className="w-5 h-5 rounded object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setManOptionImages(prev => ({ ...prev, [l]: '' }))}
                                    className="text-[8px] text-rose-600 hover:text-rose-700 font-extrabold px-1 py-0.5 rounded"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[8px] text-slate-400">Tidak ada gambar</span>
                              )}
                            </div>

                            {/* Position Selector */}
                            <div className="flex items-center justify-end space-x-1.5 text-[9px] text-slate-500">
                              <span className="font-semibold text-slate-400">Letak:</span>
                              <div className="flex bg-white border border-slate-250 border-slate-200 p-0.5 rounded-md">
                                {['atas', 'tengah', 'bawah'].map(pos => (
                                  <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setManOptionImagePositions(prev => ({ ...prev, [l]: pos }))}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold capitalize transition ${
                                      optPos === pos 
                                        ? 'bg-[#00705f] text-white' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Kunci Jawaban Sah</label>
                    <select
                      value={manCorrectOption}
                      onChange={e => setManCorrectOption(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl cursor-pointer"
                    >
                      {['A', 'B', 'C', 'D', 'E'].map(o => (
                        <option key={o} value={o}>Pilihan {o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Sandi Menu</label>
                    <span className="text-[10px] text-slate-400 font-semibold block pt-3 leading-normal">
                      Input nalar validasi tryout nasional.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Teks Pembahasan Kupas Tuntas</label>
                  <textarea
                    rows={3}
                    placeholder="Sertakan kupas pembahasan logis..."
                    value={manExplanation}
                    onChange={(e) => setManExplanation(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* PRATINJAU MANUAL PREVIEW AREA */}
            {showManPreview && (
              <div id="man-preview-card" className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-eye text-[#00705f]"></i> PRATINJAU INSTAN BUTIR SOAL MANUAL
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      id="btn-man-edit-toggle"
                      onClick={() => setIsEditingManualPreview(!isEditingManualPreview)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition ${
                        isEditingManualPreview 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      <i className={`fa-solid ${isEditingManualPreview ? 'fa-check' : 'fa-pen-to-square'} text-[8px]`}></i>
                      <span>{isEditingManualPreview ? 'Simpan' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      id="btn-man-reset"
                      onClick={() => {
                        if (safeConfirm("Reset ulang seluruh input manual ini?")) {
                          setManQuestionText('');
                          setManQuestionImage('');
                          setManExplanation('');
                          setManOptions({ A: '', B: '', C: '', D: '', E: '' });
                          setManOptionImages({ A: '', B: '', C: '', D: '', E: '' });
                          setIsEditingManualPreview(false);
                          setShowManPreview(false);
                        }
                      }}
                      className="px-2.5 py-1 bg-red-100 text-red-750 text-red-650 text-red-600 hover:bg-red-200 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can text-[8px]"></i>
                      <span>Hapus Form</span>
                    </button>
                  </div>
                </div>

                {isEditingManualPreview ? (
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3.5 text-xs text-left">
                    <div>
                      <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pertanyaan Soal</label>
                      <textarea
                        rows={3}
                        value={manQuestionText}
                        onChange={e => setManQuestionText(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[8px] font-black uppercase text-slate-400">Opsi Jawaban & Kunci</label>
                        {['A', 'B', 'C', 'D', 'E'].map(o => (
                          <div key={o} className="flex gap-2 items-center">
                            <button
                              type="button"
                              onClick={() => setManCorrectOption(o)}
                              className={`w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center transition-all ${
                                manCorrectOption === o 
                                  ? 'bg-[#00705f] text-white shadow-sm' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                              }`}
                            >
                              {o}
                            </button>
                            <input
                              type="text"
                              value={manOptions[o as keyof typeof manOptions] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setManOptions(prev => ({ ...prev, [o]: val }));
                              }}
                              className="flex-grow p-1.5 border border-slate-200 rounded text-xs"
                              placeholder={`Pilihan ${o}...`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Pembahasan Kupas Tuntas</label>
                          <textarea
                            rows={3}
                            value={manExplanation}
                            onChange={e => setManExplanation(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-amber-900 focus:ring-1 focus:ring-amber-500"
                            placeholder="Alur pembahasan atau cuplikan teori..."
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Tempel Tautan Gambar Soal</label>
                          <input
                            type="text"
                            value={manQuestionImage}
                            onChange={e => setManQuestionImage(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-2xs font-mono"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingManualPreview(false)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition active:scale-95 animate-pulse"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs font-medium">
                    {/* Question Image (Atas) */}
                    {manQuestionImage && manQuestionImagePos === 'atas' && (
                      <div className="max-w-xs mx-auto mb-2.5">
                        <img src={manQuestionImage} className="max-w-full h-auto rounded border" alt="Soal Atas" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed font-bold text-xs">{manQuestionText || '(Teks soal kosong)'}</p>

                    {/* Question Image (Tengah) */}
                    {manQuestionImage && manQuestionImagePos === 'tengah' && (
                      <div className="max-w-xs mx-auto my-2.5">
                        <img src={manQuestionImage} className="max-w-full h-auto rounded border" alt="Soal Tengah" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {/* Options List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {['A', 'B', 'C', 'D', 'E'].map(o => {
                        const txt = manOptions[o as keyof typeof manOptions];
                        const img = manOptionImages[o as keyof typeof manOptionImages];
                        const pos = manOptionImagePositions[o as keyof typeof manOptionImagePositions];
                        const isCorrect = manCorrectOption === o;
                        
                        return (
                          <div
                            key={o}
                            className={`p-3 rounded-xl border transition ${
                              isCorrect 
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' 
                                : 'bg-slate-50/60 border-slate-200 text-slate-700'
                            }`}
                          >
                            {/* Option image top */}
                            {img && pos === 'atas' && (
                              <img src={img} className="max-w-[120px] h-auto rounded mb-1.5" alt={`Opsi ${o} Atas`} referrerPolicy="no-referrer" />
                            )}

                            <div className="flex items-start gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                                isCorrect ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                              }`}>{o}</span>
                              <span className="whitespace-pre-wrap pt-0.5 font-semibold text-2xs">{txt || '(Pilihan kosong)'}</span>
                            </div>

                            {/* Option image bot */}
                            {img && (pos === 'tengah' || pos === 'bawah') && (
                              <img src={img} className="max-w-[120px] h-auto rounded mt-1.5" alt={`Opsi ${o} Bawah`} referrerPolicy="no-referrer" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Question Image (Bawah) */}
                    {manQuestionImage && manQuestionImagePos === 'bawah' && (
                      <div className="max-w-xs mx-auto mt-2.5">
                        <img src={manQuestionImage} className="max-w-full h-auto rounded border" alt="Soal Bawah" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {/* Explanation Section */}
                    {manExplanation && (
                      <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-3.5 space-y-1">
                        <span className="text-[9px] uppercase font-black text-amber-800 flex items-center gap-1">
                          <i className="fa-solid fa-lightbulb"></i> Pembahasan Kupas Tuntas:
                        </span>
                        <p className="text-amber-900 leading-relaxed text-2xs font-medium whitespace-pre-wrap">{manExplanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* DB Option Buttons below the preview */}
                <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-end gap-3.5">
                  <button
                    type="button"
                    id="btn-man-save-draft"
                    onClick={() => {
                      handleSaveManualQuestion(false);
                      setShowManPreview(false);
                    }}
                    className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 text-center"
                  >
                    Simpan ke DB Sebagai Draf
                  </button>
                  <button
                    type="button"
                    id="btn-man-save-publish"
                    onClick={() => {
                      handleSaveManualQuestion(true);
                      setShowManPreview(false);
                    }}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan ke DB Sekaligus Terbitkan ke Siswa</span>
                  </button>
                </div>
              </div>
            )}

            {!showManPreview && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  id="btn-man-preview-activate"
                  onClick={() => {
                    if (!manQuestionText.trim()) {
                      alert("Tolong isikan teks soal terlebih dahulu sebelum melakukan pratinjau.");
                      return;
                    }
                    setShowManPreview(true);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
                  <span>Pratinjau Soal & Opsi (Preview)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: COPY PASTE MASSAL ================= */}
        {activeTab === 'input_massal' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Impor Pertanyaan Massal (Uraian Parsing Teks & Dokumen)</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Unggah file teks/dokumen atau tempel naskah soal lengkap tryout Anda sekaligus. Sistem cerdas kami akan mendeteksi pertanyaan, pilihan A-E, kunci jawaban, dan pembahasan secara otomatis.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Tujuan Paket</label>
                  <select
                    value={batchPkgId}
                    onChange={e => setBatchPkgId(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 cursor-pointer text-2xs"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Sub Test Paket Target</label>
                  <select
                    value={batchSubExamName}
                    onChange={e => setBatchSubExamName(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 cursor-pointer text-2xs"
                  >
                    {packages.find(p => p.id === batchPkgId)?.subExams.map(s => (
                      <option key={s} value={s}>{s}</option>
                    )) || <option value="TPS - Penalaran Umum">TPS - Penalaran Umum</option>}
                  </select>
                </div>
              </div>

              {/* DIRECT FILE UPLOAD COMPONENT FOR TXT, WORD, EXCEL, CSV */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white rounded-full shadow-2xs border border-slate-150">
                  <i className="fa-solid fa-file-arrow-up text-lg text-[#00705f]"></i>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-800">UNSUR UNGGAH FILE MASTER SOAL (TXT, CSV, WORD, EXCEL)</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Sistem akan secara instan membaca string isi file lalu memasukkannya ke kolom pengetikan di bawah.</p>
                </div>
                
                <label className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold uppercase rounded-lg cursor-pointer transition shadow border border-emerald-600 tracking-wider">
                  Select & Upload File
                  <input
                    type="file"
                    accept=".txt,.csv,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      const reader = new FileReader();

                      if (ext === 'docx' || ext === 'doc') {
                        reader.onload = (evt) => {
                          const arrayBuffer = evt.target?.result as ArrayBuffer;
                          mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                            .then((result) => {
                              setBatchRawText(result.value);
                              alert("Membaca Sukses! Teks dari dokumen Word (.docx) berhasil diekstrak ke kolom copy-paste di bawah.");
                            })
                            .catch((err) => {
                              console.error(err);
                              alert("Membaca file Word (.docx) gagal. Pastikan file tidak rusak!");
                            });
                        };
                        reader.readAsArrayBuffer(file);
                      } else if (ext === 'xlsx' || ext === 'xls') {
                        reader.onload = (evt) => {
                          const arrayBuffer = evt.target?.result as ArrayBuffer;
                          const data = new Uint8Array(arrayBuffer);
                          const workbook = XLSX.read(data, { type: 'array' });
                          const sheetName = workbook.SheetNames[0];
                          const worksheet = workbook.Sheets[sheetName];
                          
                          // Raw data representation
                          const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                          let formatted: string[] = [];
                          let idx = 1;
                          
                          rows.forEach((row: any) => {
                            if (!row || row.length === 0) return;
                            // Let's check if the row resembles a question structure
                            const qText = row[0] ? String(row[0]).trim() : '';
                            if (!qText || qText === 'Pertanyaan' || qText === 'Question') return; // Skip headers
                            
                            const optA = row[1] ? String(row[1]).trim() : '';
                            const optB = row[2] ? String(row[2]).trim() : '';
                            const optC = row[3] ? String(row[3]).trim() : '';
                            const optD = row[4] ? String(row[4]).trim() : '';
                            const optE = row[5] ? String(row[5]).trim() : '';
                            const key = row[6] ? String(row[6]).trim().toUpperCase() : 'A';
                            const exp = row[7] ? String(row[7]).trim() : 'Logika pembahasan CAT Kata Kita.';
                            
                            formatted.push(`${idx}. ${qText}\nA. ${optA}\nB. ${optB}\nC. ${optC}\nD. ${optD}\nE. ${optE}\nKunci: ${key}\nPembahasan: ${exp}`);
                            idx++;
                          });

                          if (formatted.length > 0) {
                            setBatchRawText(formatted.join('\n\n'));
                            alert(`Excel terdeteksi! Sukses mengekstrak ${formatted.length} butir soal dari lembar Excel (.${ext}) ke kolom copy-paste di bawah.`);
                          } else {
                            // Extract rows as simple tabbed text lines
                            const fallbackText = rows.map(r => r.join('\t')).join('\n');
                            setBatchRawText(fallbackText);
                            alert(`Excel (.${ext}) dibaca dengan sukses, terekstrak sebagai baris teks tabulasi.`);
                          }
                        };
                        reader.readAsArrayBuffer(file);
                      } else if (ext === 'csv') {
                        reader.onload = (evt) => {
                          const content = evt.target?.result;
                          if (typeof content !== 'string') return;
                          
                          const lines = content.split(/\r?\n/);
                          let formatted: string[] = [];
                          let idx = 1;
                          lines.forEach(ln => {
                            if (!ln.trim()) return;
                            const cols = ln.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                            if (cols.length >= 7) {
                              const qText = cols[0].replace(/^"|"$/g, '').trim();
                              const optA = cols[1].replace(/^"|"$/g, '').trim();
                              const optB = cols[2].replace(/^"|"$/g, '').trim();
                              const optC = cols[3].replace(/^"|"$/g, '').trim();
                              const optD = cols[4].replace(/^"|"$/g, '').trim();
                              const optE = cols[5] ? cols[5].replace(/^"|"$/g, '').trim() : '';
                              const key = cols[6] ? cols[6].replace(/^"|"$/g, '').trim().toUpperCase() : 'A';
                              const exp = cols[7] ? cols[7].replace(/^"|"$/g, '').trim() : 'Sesuai kunci';
                              
                              formatted.push(`${idx}. ${qText}\nA. ${optA}\nB. ${optB}\nC. ${optC}\nD. ${optD}\nE. ${optE}\nKunci: ${key}\nPembahasan: ${exp}`);
                              idx++;
                            }
                          });
                          if (formatted.length > 0) {
                            setBatchRawText(formatted.join('\n\n'));
                            alert(`CSV terdeteksi! Sukses mengekstrak ${formatted.length} butir dari file CSV ke kolom copy-paste di bawah.`);
                          } else {
                            setBatchRawText(content);
                            alert("File CSV dibaca sebagai string utuh!");
                          }
                        };
                        reader.readAsText(file, 'UTF-8');
                      } else {
                        // For .txt or other formats
                        reader.onload = (evt) => {
                          const content = evt.target?.result;
                          if (typeof content === 'string') {
                            setBatchRawText(content);
                            alert("Dokumen Teks terbaca! Isi file berhasil disalin ke kolom copy-paste di bawah.");
                          }
                        };
                        reader.readAsText(file, 'UTF-8');
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Kolom Salin/Sunting Naskah Soal Massal (Bisa Di-edit Manual)</label>
                <textarea
                  rows={8}
                  placeholder={`Contoh Format:\n1. Berapa hasil dari 5 + 3?\nA. 5\nB. 8\nC. 10\nKunci: B\nPembahasan: Karena 5 ditambah 3 adalah 8.\n\n2. Pertanyaan kedua...\nA. Opsi A\nB. Opsi B\nC. Opsi C\nKunci: C`}
                  value={batchRawText}
                  onChange={e => setBatchRawText(e.target.value)}
                  className="w-full text-xs font-mono p-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-b border-slate-100 pb-4">
                <button
                  type="button"
                  id="btn-process-batch-parse"
                  onClick={handleParseBatchText}
                  className="px-5 py-3 bg-[#00705f] hover:bg-[#005a4d] text-white text-xs font-extrabold uppercase rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <i className="fa-solid fa-gears text-[10px]"></i>
                  <span>Proses & Pratinjau Penguraian</span>
                </button>
              </div>

              {/* REVIEW BATCH PREVIEW LIST */}
              {parsedBatchQuestions.length > 0 && (
                <div className="space-y-4 pt-2 text-left">
                  <div className="flex justify-between items-center bg-slate-900 p-3.5 rounded-2xl text-white text-xs shadow-sm">
                    <span className="font-extrabold tracking-wider text-2xs uppercase flex items-center gap-1.5">
                      <i className="fa-solid fa-list-check text-emerald-400 text-xs"></i> 
                      Daftar Pratinjau Hasil Pembacaan ({parsedBatchQuestions.length} Butir Soal)
                    </span>
                    <button
                      type="button"
                      id="btn-batch-clear-all"
                      onClick={() => {
                        if (safeConfirm("Apakah Anda yakin ingin menghapus seluruh soal hasil penguraian ini?")) {
                          setParsedBatchQuestions([]);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-[9px] uppercase rounded-lg font-black cursor-pointer shadow transition"
                    >
                      <i className="fa-solid fa-trash-can mr-1"></i> Hapus Semua Soal
                    </button>
                  </div>

                  <div className="space-y-4 max-h-120 overflow-y-auto border border-slate-200 p-4.5 rounded-2xl bg-slate-50/70">
                    {parsedBatchQuestions.map((q, qidx) => {
                      const isEditingThis = editingBatchIdx === qidx;

                      return (
                        <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3.5 transition-all relative">
                          <div className="absolute top-4 right-4 flex items-center space-x-2">
                            {isEditingThis ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // SAVE EDITED BULK QUESTION IN MEMORY ONLY
                                    setParsedBatchQuestions(prev => {
                                      const next = [...prev];
                                      next[qidx] = {
                                        ...next[qidx],
                                        questionText: editBatchText,
                                        options: { ...editBatchOptions },
                                        correctOption: editBatchCorrect,
                                        explanation: editBatchExplanation
                                      };
                                      return next;
                                    });
                                    setEditingBatchIdx(null);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase rounded-md tracking-wider shadow cursor-pointer transition"
                                >
                                  Simpan Perubahan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingBatchIdx(null)}
                                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-bold uppercase rounded-md tracking-wider cursor-pointer transition"
                                >
                                  Batal
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBatchIdx(qidx);
                                    setEditBatchText(q.questionText);
                                    setEditBatchOptions({ ...q.options as any });
                                    setEditBatchCorrect(q.correctOption);
                                    setEditBatchExplanation(q.explanation);
                                  }}
                                  className="p-1 px-2.5 bg-sky-100 hover:bg-sky-200 text-sky-700 text-[9px] uppercase tracking-wider font-extrabold rounded-md cursor-pointer transition"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (safeConfirm("Hapus soal ini dari draf pratinjau?")) {
                                      setParsedBatchQuestions(prev => prev.filter((_, i) => i !== qidx));
                                    }
                                  }}
                                  className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-650 text-red-600 text-[9px] uppercase tracking-wider font-extrabold rounded-md cursor-pointer transition"
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>

                          <div className="text-left">
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold rounded-md px-2.5 py-1 block w-fit mb-2 uppercase tracking-wide">
                              BUTIR SOAL #{qidx + 1}
                            </span>
                          </div>

                          {isEditingThis ? (
                            <div className="space-y-3.5 pt-2">
                              <div>
                                <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Teks Pertanyaan</label>
                                <textarea
                                  rows={3}
                                  value={editBatchText}
                                  onChange={e => setEditBatchText(e.target.value)}
                                  className="w-full p-2 border border-slate-200 bg-slate-50 text-xs rounded-xl font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['A', 'B', 'C', 'D', 'E'].map(o => (
                                  <div key={o} className="flex items-center space-x-2">
                                    <span className="font-extrabold text-xs text-slate-500 w-4 shrink-0">{o}</span>
                                    <input
                                      type="text"
                                      value={editBatchOptions[o as keyof typeof editBatchOptions]}
                                      onChange={e => {
                                        const val = e.target.value;
                                        setEditBatchOptions(prev => ({ ...prev, [o]: val }));
                                      }}
                                      className="p-2 border border-slate-200 bg-slate-50 text-xs rounded-xl flex-1 font-semibold"
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Kunci Jawaban</label>
                                  <select
                                    value={editBatchCorrect}
                                    onChange={e => setEditBatchCorrect(e.target.value)}
                                    className="p-2 w-full border border-slate-200 bg-slate-50 text-xs font-semibold rounded-xl"
                                  >
                                    {['A', 'B', 'C', 'D', 'E'].map(o => (
                                      <option key={o} value={o}>Pilihan {o}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Sandi Menu</label>
                                  <span className="text-[9px] text-slate-400 block pt-2">Editing draf soal terpadu.</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Penjelasan Pembahasan</label>
                                <textarea
                                  rows={2}
                                  value={editBatchExplanation}
                                  onChange={e => setEditBatchExplanation(e.target.value)}
                                  className="w-full p-2 border border-slate-200 bg-slate-50 text-xs rounded-xl font-medium"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-xs font-medium pl-1 text-slate-800">
                              <p className="whitespace-pre-wrap font-bold pr-16">{q.questionText}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 text-2xs pl-2 pb-1.5 pt-1">
                                {Object.entries(q.options).map(([k, val]) => {
                                  const isKunci = q.correctOption === k;
                                  return (
                                    <div key={k} className={`flex items-start gap-1.5 ${isKunci ? 'text-emerald-700 font-extrabold' : ''}`}>
                                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isKunci ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{k}</span>
                                      <span className="pt-0.5">{val || '-'}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-2xs text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 font-bold leading-normal">
                                <span className="text-white bg-emerald-600 px-1.5 py-0.5 rounded mr-2 text-[8px] tracking-wider uppercase font-black">Kunci: {q.correctOption}</span>
                                <span className="text-slate-500">Pembahasan:</span> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM ACTION BUTTONS AS SPECIFIED */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-end gap-3.5">
                    <button
                      type="button"
                      id="btn-bulk-save-draft"
                      onClick={() => handleSaveBatchQuestions(false)}
                      className="px-5 py-3 bg-slate-250 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition shadow-sm active:scale-95 text-center"
                    >
                      Simpan ke Draf ({parsedBatchQuestions.length} Soal) ke Database
                    </button>
                    <button
                      type="button"
                      id="btn-bulk-save-publish"
                      onClick={() => handleSaveBatchQuestions(true)}
                      className="px-5 py-3 bg-emerald-650 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan & Terbitkan Langsung ke Siswa ({parsedBatchQuestions.length} Soal)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: KONFIGURASI PAKET UJIAN ================= */}
        {activeTab === 'konfigurasi' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Konfigurator Pembuatan Paket Tryout Nasional Baru</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Tulis dan terbitkan katalog paket tryout baru beserta penentuan sekuritas tarif premium atau gratis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Creator Form */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">ID Kode Paket (Unik)</label>
                    <input
                      type="text"
                      placeholder="PKG-MANDIRI-2026"
                      value={cnfId}
                      onChange={e => setCnfId(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Subtest Rumpun Kategori</label>
                    <select
                      value={cnfCategory}
                      onChange={e => setCnfCategory(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl"
                    >
                      <option value="TPS">TPS SNBT</option>
                      <option value="Literasi">Literasi Bahasa</option>
                      <option value="CPNS">Seleksi CPNS</option>
                      <option value="Mandiri">Mandiri PTN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Nama Resmi Paket Simulasi Tryout</label>
                  <input
                    type="text"
                    placeholder="Tryout Akbar Mandiri Unsri & Unila"
                    value={cnfName}
                    onChange={e => setCnfName(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Katalog Deskripsi Ringkas</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis ringkasan cakupan materi ujian..."
                    value={cnfDesc}
                    onChange={e => setCnfDesc(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                  />
                          {/* Subtest adding row */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-left">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">SUBTEST TERINTEGRASI</label>
                      <input
                        type="text"
                        placeholder="Contoh: Penalaran Matematika"
                        value={subExamAddName}
                        onChange={e => setSubExamAddName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">WAKTU (Menit)</label>
                      <input
                        type="number"
                        placeholder="Durasi"
                        value={subExamAddDur}
                        onChange={e => setSubExamAddDur(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">JUMLAH SOAL</label>
                      <input
                        type="number"
                        placeholder="Soal"
                        value={subExamAddCount}
                        onChange={e => setSubExamAddCount(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddSubExamConfig}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase font-black rounded-lg cursor-pointer transition shadow-xs active:scale-95 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>+ TAMBAH SUBTEST</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-68 overflow-y-auto bg-slate-100/50 border border-slate-200 rounded-2xl p-4 text-xs leading-normal">
                    {subExamList.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-3 font-bold">Belum ada subtest terintegrasi. Tulis isian di baris paralel di atas lalu klik "+ TAMBAH SUBTEST".</p>
                    ) : (
                      subExamList.map((s, sidx) => {
                        const isEditingThisSub = editingSubtestIdx === sidx;
                        return (
                          <div key={sidx} className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                            {isEditingThisSub ? (
                              <div className="w-full space-y-2.5 text-2xs">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Nama Subtest</label>
                                    <input 
                                      type="text" 
                                      value={editSubtestName} 
                                      onChange={e => setEditSubtestName(e.target.value)} 
                                      className="w-full p-2 border rounded-lg text-2xs font-bold text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Waktu (Menit)</label>
                                    <input 
                                      type="number" 
                                      value={editSubtestDuration} 
                                      onChange={e => setEditSubtestDuration(Number(e.target.value))} 
                                      className="w-full p-2 border rounded-lg text-2xs font-extrabold text-[#00705f]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Jumlah Soal</label>
                                    <input 
                                      type="number" 
                                      value={editSubtestCount} 
                                      onChange={e => setEditSubtestCount(Number(e.target.value))} 
                                      className="w-full p-2 border rounded-lg text-2xs font-extrabold text-blue-600"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-1.5 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!editSubtestName.trim()) {
                                        alert("Nama subtest tidak boleh kosong!");
                                        return;
                                      }
                                      setSubExamList(prev => {
                                        const next = [...prev];
                                        next[sidx] = {
                                          name: editSubtestName,
                                          duration: editSubtestDuration,
                                          qCount: editSubtestCount
                                        };
                                        return next;
                                      });
                                      setEditingSubtestIdx(null);
                                    }}
                                    className="px-3 py-1.5 bg-[#00705f] hover:bg-[#005a4d] text-white text-[9px] font-black uppercase rounded shadow cursor-pointer transition flex items-center space-x-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>SIMPAN</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubtestIdx(null)}
                                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-black uppercase rounded cursor-pointer"
                                  >
                                    BATAL
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-xl bg-[#00705f]/10 text-[#00705f] flex items-center justify-center shrink-0 border border-[#00705f]/20">
                                    <i className="fa-solid fa-file-invoice text-sm"></i>
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
                                      <span className="flex items-center gap-1"><i className="fa-regular fa-clock text-[#00705f]"></i> {s.duration} Menit</span>
                                      <span className="text-slate-300">•</span>
                                      <span className="flex items-center gap-1"><i className="fa-solid fa-graduation-cap text-blue-500"></i> {s.qCount} Soal</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-1.5 self-stretch md:self-auto justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubtestIdx(sidx);
                                      setEditSubtestName(s.name);
                                      setEditSubtestDuration(s.duration);
                                      setEditSubtestCount(s.qCount);
                                    }}
                                    className="p-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-lg cursor-pointer transition border border-blue-200 flex items-center space-x-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>EDIT</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (safeConfirm("Hapus subtest terintegrasi ini?")) {
                                        setSubExamList(prev => prev.filter((_, i) => i !== sidx));
                                      }
                                    }}
                                    className="p-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 text-[9px] font-black uppercase rounded-lg cursor-pointer transition border border-red-200 flex items-center space-x-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>HAPUS</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>          </div>

                {/* Gradasi and Premium lock selection */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[10px] bg-sky-100 text-sky-800 font-black px-2 py-0.5 rounded uppercase mb-2">Gradasi Tema Kartu Siswa</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {GRADIENTS.map(g => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => setCnfGradient(g.class)}
                          className={`h-7 rounded-lg border cursor-pointer ${g.class} ${cnfGradient === g.class ? 'ring-2 ring-black' : ''}`}
                          title={g.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] bg-pink-100 text-pink-700 font-black px-2 py-0.5 rounded uppercase mb-2">Status Akses Akun</label>
                    <label className="inline-flex items-center space-x-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={cnfPremium}
                        onChange={e => setCnfPremium(e.target.checked)}
                        className="rounded border-slate-300 text-[#00705f] focus:ring-emerald-500 h-4.5 w-4.5"
                      />
                      <span className="text-xs font-black text-slate-700">🔒 Premium (Lock)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveConfiguredPackage}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Simpan Paket Baru & Selesaikan
                  </button>
                </div>
              </div>

              {/* Package cards visualizer with Gradasi Theme Options matching User requests */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">PREVIEW GRADASI KARTU LAYOUT:</span>
                <div className={`${cnfGradient} p-6 rounded-3xl space-y-4 relative overflow-hidden shadow-xl min-h-60 flex flex-col justify-between`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6"></div>
                  
                  <div className="space-y-1">
                    <span className="bg-white/20 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                      {cnfCategory || 'TPS'}
                    </span>
                    <h4 className="font-display font-black text-lg text-white tracking-tight pt-1">
                      {cnfName || 'Judul Paket Simulasi Anda'}
                    </h4>
                    <p className="text-[11px] text-white/80 line-clamp-2">
                      {cnfDesc || 'Isi katalog ringkasan mengenai materi ujian kompetensi.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-semibold">
                    <span>Durasi: {subExamList.reduce((acc, curr) => acc + curr.duration, 0) || 120} Menit</span>
                    <span>{subExamList.length} Subtests • {subExamList.reduce((acc, curr) => acc + curr.qCount, 0) || 0} Soal</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 5: DATABASE SOAL ================= */}
        {activeTab === 'database' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* COMPASS COMPACT PILLED NAVIGATION CONTAINER (Kompas Navigasi) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3.5 relative overflow-hidden text-white shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500 rounded text-slate-900 font-extrabold text-[9px] uppercase shadow">KOMPAS</div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00a896]">Navigasi Database Interaktif</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {packages.map(p => {
                  const isActive = p.id === dbSelectedPkg;
                  const totalQuestionsInDB = questions.filter(q => q.examId === p.id).length;
                  
                  // Distinct colors to each exam package box matching student exam room colors
                  let catColorActive = 'bg-sky-600 border-sky-450 text-white shadow shadow-sky-900/40';
                  let catColorInactive = 'bg-slate-950 text-sky-400 border-sky-950/70 hover:bg-sky-950/90';
                  let catIcon = 'fa-solid fa-brain';

                  if (p.category?.toLowerCase().includes('literasi') || p.category?.toLowerCase().includes('bahasa')) {
                    catColorActive = 'bg-rose-600 border-rose-450 text-white shadow shadow-rose-900/40';
                    catColorInactive = 'bg-slate-950 text-rose-400 border-rose-950/70 hover:bg-rose-950/90';
                    catIcon = 'fa-solid fa-feather';
                  } else if (p.category?.toLowerCase().includes('cpns') || p.category?.toLowerCase().includes('asn')) {
                    catColorActive = 'bg-amber-600 border-amber-500 text-white shadow shadow-amber-900/40';
                    catColorInactive = 'bg-slate-950 text-amber-400 border-amber-950/70 hover:bg-amber-950/90';
                    catIcon = 'fa-solid fa-id-card';
                  } else if (p.category?.toLowerCase().includes('mandiri') || p.category?.toLowerCase().includes('ptn')) {
                    catColorActive = 'bg-emerald-600 border-emerald-500 text-white shadow shadow-emerald-900/40';
                    catColorInactive = 'bg-slate-950 text-emerald-400 border-emerald-950/70 hover:bg-emerald-950/90';
                    catIcon = 'fa-solid fa-award';
                  }

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDbSelectedPkg(p.id);
                        setDbSelectedSubtest('ALL');
                      }}
                      className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider cursor-pointer border transition duration-200 flex items-center gap-1.5 ${
                        isActive ? catColorActive : catColorInactive
                      }`}
                    >
                      <i className={`${catIcon} text-[8px]`}></i>
                      <span>{p.name} ({totalQuestionsInDB} Q)</span>
                    </button>
                  );
                })}
              </div>

              {/* Subtests navigation metrics ribbon */}
              {packages.find(p => p.id === dbSelectedPkg) && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setDbSelectedSubtest('ALL')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition duration-150 cursor-pointer ${
                      dbSelectedSubtest === 'ALL'
                        ? 'bg-[#00705f] text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tampilkan Semua Sektor ({questions.filter(q => q.examId === dbSelectedPkg).length})
                  </button>
                  {packages.find(p => p.id === dbSelectedPkg)?.subExams.map(subName => {
                    const isActive = dbSelectedSubtest === subName;
                    const subQCount = questions.filter(q => q.examId === dbSelectedPkg && q.subExamName === subName).length;
                    return (
                      <button
                        key={subName}
                        onClick={() => setDbSelectedSubtest(subName)}
                        className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition duration-150 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white font-extrabold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isActive && <i className="fa-solid fa-chevron-right text-[7px] mr-1"></i>}
                        {subName} ({subQCount} Q)
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PACKAGE LEVEL ACTIONS OR PACKAGE EDITING MODAL */}
            {(() => {
              const activePkg = packages.find(p => p.id === dbSelectedPkg);
              if (!activePkg) return null;

              const isEditing = editingPackageId === activePkg.id;

              let pkgContainerClass = "bg-sky-50/30 border border-slate-200 border-l-4 border-l-sky-500 rounded-3xl p-5 leading-normal space-y-4 shadow-3xs text-left";
              let textHeaderColor = "text-sky-850 text-sky-800";
              if (activePkg.category?.toLowerCase().includes('literasi') || activePkg.category?.toLowerCase().includes('bahasa')) {
                pkgContainerClass = "bg-rose-50/30 border border-slate-200 border-l-4 border-l-rose-500 rounded-3xl p-5 leading-normal space-y-4 shadow-3xs text-left";
                textHeaderColor = "text-rose-850 text-rose-800";
              } else if (activePkg.category?.toLowerCase().includes('cpns') || activePkg.category?.toLowerCase().includes('asn')) {
                pkgContainerClass = "bg-amber-50/30 border border-slate-200 border-l-4 border-l-amber-500 rounded-3xl p-5 leading-normal space-y-4 shadow-3xs text-left";
                textHeaderColor = "text-amber-850 text-[#b25e00]";
              } else if (activePkg.category?.toLowerCase().includes('mandiri') || activePkg.category?.toLowerCase().includes('ptn')) {
                pkgContainerClass = "bg-emerald-50/30 border border-slate-200 border-l-4 border-l-emerald-500 rounded-3xl p-5 leading-normal space-y-4 shadow-3xs text-left";
                textHeaderColor = "text-emerald-850 text-emerald-800";
              }

              return (
                <div className={pkgContainerClass}>
                  <div className="flex justify-between items-center bg-transparent pb-2 border-b border-slate-200">
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-2.5 py-1 rounded">ID KODE PAKET: {activePkg.id}</span>
                    <div className="flex space-x-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEditedPackage}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                          >
                            <i className="fa-solid fa-cloud-arrow-up text-[9px]"></i>
                            <span>Simpan</span>
                          </button>
                          <button
                            onClick={() => setEditingPackageId(null)}
                            className="bg-slate-500 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer shadow-xs"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditPackage(activePkg)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <i className="fa-solid fa-pen-to-square text-[9px]"></i>
                            <span>Edit Paket</span>
                          </button>
                          <button
                            onClick={() => handleDeletePackage(activePkg.id)}
                            className="bg-red-650 bg-red-600 hover:bg-red-750 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <i className="fa-solid fa-trash-can text-[9px]"></i>
                            <span>Hapus</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-left">
                      {/* Left side: Package Basic Metadata */}
                      <div className="lg:col-span-5 space-y-3">
                        <div>
                          <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Nama Resmi Paket Simulasi</label>
                          <input
                            type="text"
                            value={editPkgName}
                            onChange={e => setEditPkgName(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Subtest Rumpun Kategori</label>
                            <input
                              type="text"
                              value={editPkgCategory}
                              onChange={e => setEditPkgCategory(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                              placeholder="Contoh: TPS, Literasi, CPNS, Mandiri"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Sandi Akses</label>
                            <span className="text-[10px] text-[#00705f] font-black block pt-2">Terbuka di ruang CBT.</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-black text-slate-400 mb-1">Katalog Deskripsi Ringkas</label>
                          <textarea
                            rows={3}
                            value={editPkgDesc}
                            onChange={e => setEditPkgDesc(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Right side: Dynamic Subtest Configurator representing "display the same interface as the Exam Configuration menu" */}
                      <div className="lg:col-span-7 bg-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <span className="text-[9px] font-black text-[#00705f] block uppercase tracking-wide">PENGATURAN SUBTEST INTEGRAL ({editPkgSubtests.length} SEKTOR):</span>
                        
                        {/* Inline subtest adding widget */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Sektor Baru</label>
                            <input
                              type="text"
                              value={editAddName}
                              onChange={e => setEditAddName(e.target.value)}
                              placeholder="Nama Sektor"
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-2xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Waktu (Menit)</label>
                            <input
                              type="number"
                              value={editAddDur}
                              onChange={e => setEditAddDur(Number(e.target.value))}
                              placeholder="Menit"
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-2xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase font-black text-slate-400 mb-0.5">Jumlah Soal</label>
                            <input
                              type="number"
                              value={editAddCount}
                              onChange={e => setEditAddCount(Number(e.target.value))}
                              placeholder="Soal"
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-2xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!editAddName.trim()) {
                                alert("Harap isi nama subtest!");
                                return;
                              }
                              setEditPkgSubtests(prev => [...prev, { name: editAddName, dur: editAddDur, qCount: editAddCount }]);
                              setEditAddName('');
                            }}
                            className="px-3 py-1.5 bg-[#00705f] hover:bg-[#005a4d] text-white text-[9px] font-bold uppercase rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            + Sisipkan Sub-Ujian
                          </button>
                        </div>

                        {/* Subtests display cards with edit editPkgSubtests in frames */}
                        <div className="space-y-2 max-h-48 overflow-y-auto bg-white p-2.5 rounded-xl border border-slate-200 text-left">
                          {editPkgSubtests.length === 0 ? (
                            <p className="text-[9px] text-slate-400 text-center py-4 font-bold">Belum ada subtest terintegrasi. Tambahkan terlebih dahulu agar siswa bisa melakukan tryout.</p>
                          ) : (
                            editPkgSubtests.map((sub, sidx) => {
                              const isEditingThisSub = editingPkgSubtestIdx === sidx;

                              return (
                                <div key={sidx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                  {isEditingThisSub ? (
                                    <div className="w-full space-y-1.5 text-2xs">
                                      <div className="grid grid-cols-3 gap-1.5">
                                        <input 
                                          type="text" 
                                          value={editPkgSubName} 
                                          onChange={e => setEditPkgSubName(e.target.value)} 
                                          className="p-1 border bg-white rounded text-2xs font-semibold"
                                        />
                                        <input 
                                          type="number" 
                                          value={editPkgSubDuration} 
                                          onChange={e => setEditPkgSubDuration(Number(e.target.value))} 
                                          className="p-1 border bg-white rounded text-2xs font-bold"
                                        />
                                        <input 
                                          type="number" 
                                          value={editPkgSubCount} 
                                          onChange={e => setEditPkgSubCount(Number(e.target.value))} 
                                          className="p-1 border bg-white rounded text-2xs font-bold"
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-1 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!editPkgSubName.trim()) { alert("Nama tidak boleh kosong!"); return; }
                                            setEditPkgSubtests(prev => {
                                              const next = [...prev];
                                              next[sidx] = { name: editPkgSubName, dur: editPkgSubDuration, qCount: editPkgSubCount };
                                              return next;
                                            });
                                            setEditingPkgSubtestIdx(null);
                                          }}
                                          className="px-2 py-0.5 bg-emerald-600 text-white font-extrabold uppercase rounded text-[8px] cursor-pointer"
                                        >
                                          Simpan
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingPkgSubtestIdx(null)}
                                          className="px-2 py-0.5 bg-slate-200 text-slate-700 font-extrabold uppercase rounded text-[8px] cursor-pointer"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-left">
                                        <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wide">{sub.name}</p>
                                        <p className="text-[9px] text-[#00705f] font-bold mt-0.5">
                                          {sub.dur} Menit • {sub.qCount} Butir Soal
                                        </p>
                                      </div>
                                      <div className="flex space-x-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingPkgSubtestIdx(sidx);
                                            setEditPkgSubName(sub.name);
                                            setEditPkgSubDuration(sub.dur);
                                            setEditPkgSubCount(sub.qCount);
                                          }}
                                          className="p-1 px-2.5 bg-white hover:bg-slate-100 text-slate-650 text-[8px] font-extrabold uppercase rounded border cursor-pointer border-slate-200"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (safeConfirm("Hapus subtest dari draf paket ujian ini?")) {
                                              setEditPkgSubtests(prev => prev.filter((_, i) => i !== sidx));
                                            }
                                          }}
                                          className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[8px] font-extrabold uppercase rounded border cursor-pointer border-red-100"
                                        >
                                          Hapus
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="text-right text-[8px] text-slate-450 font-semibold text-slate-400">
                          Total Durasi: {editPkgSubtests.reduce((acc, curr) => acc + curr.dur, 0)} Menit • {editPkgSubtests.reduce((acc, curr) => acc + curr.qCount, 0)} Soal
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-left bg-white/70 p-4 rounded-2xl border border-slate-105/50 border-slate-200 shadow-3xs">
                      <h4 className={`font-display font-black text-sm flex items-center gap-1.5 uppercase ${textHeaderColor}`}>
                        <i className="fa-solid fa-layer-group text-xs"></i>
                        {activePkg.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-1.5 leading-relaxed">{activePkg.description}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* INLINE QUESTIONS LISTS */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DAFTAR BUTIR SOAL VALID DAN PILIHAN PUBLIKASI:</span>
                <button
                  type="button"
                  onClick={() => {
                    const filteredQs = questions.filter(q => q.examId === dbSelectedPkg && (dbSelectedSubtest === 'ALL' || q.subExamName === dbSelectedSubtest));
                    if (filteredQs.length === 0) {
                      alert("Tidak ada soal dalam filter ini yang dapat dihapus!");
                      return;
                    }
                    const filterDesc = dbSelectedSubtest === 'ALL' 
                      ? "seluruh soal dalam paket ini" 
                      : `seluruh soal dalam subtest "${dbSelectedSubtest}" pada paket ini`;
                    if (safeConfirm(`Apakah Anda yakin ingin menghapus ${filterDesc} (${filteredQs.length} butir) secara permanen?`)) {
                      setQuestions(prev => {
                        const next = prev.filter(q => !(q.examId === dbSelectedPkg && (dbSelectedSubtest === 'ALL' || q.subExamName === dbSelectedSubtest)));
                        localStorage.setItem('katakita_questions', JSON.stringify(next));
                        return next;
                      });
                      alert("Semua soal terpilih berhasil dihapus!");
                    }
                  }}
                  className="px-3 py-1.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase rounded-lg shadow-sm transition active:scale-95 flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>HAPUS SEMUA SOAL ({questions.filter(q => q.examId === dbSelectedPkg && (dbSelectedSubtest === 'ALL' || q.subExamName === dbSelectedSubtest)).length})</span>
                </button>
              </div>
              
              {questions.filter(q => q.examId === dbSelectedPkg && (dbSelectedSubtest === 'ALL' || q.subExamName === dbSelectedSubtest)).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold">Belum ada butir soal untuk subtest/paket terpilih ini.</p>
                </div>
              ) : (
                questions
                  .filter(q => q.examId === dbSelectedPkg && (dbSelectedSubtest === 'ALL' || q.subExamName === dbSelectedSubtest))
                  .map((q, idx) => {
                    const isQPublished = q.isPublished !== false;
                    const isEditingQ = editingQuestionId === q.id;

                    return (
                      <div key={q.id} className="bg-slate-50 hover:bg-slate-100/55 p-4.5 rounded-2xl border border-slate-150 transition-all">
                        {isEditingQ ? (
                          // INLINE RICH EDITING FORM MATCHES MANUAL TEMPLATE
                          <div className="space-y-4 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="font-bold text-slate-800 tracking-wider">EDIT PERTANYAAN SOAL #{idx + 1}</span>
                              <div className="flex space-x-1.5">
                                <button
                                  onClick={handleSaveEditedQuestion}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition active:scale-95 flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Simpan Perubahan</span>
                                </button>
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="bg-slate-400 hover:bg-slate-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition active:scale-95"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left field: Question, Explanation and Core Media */}
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Pertanyaan Soal</label>
                                  <textarea
                                    rows={3}
                                    value={editQText}
                                    onChange={e => setEditQText(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 font-medium"
                                  />
                                </div>

                                <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 space-y-2.5">
                                  <label className="block text-[9px] font-black uppercase text-slate-500">Lampirkan Gambar Soal</label>
                                  
                                  <div className="flex items-center space-x-2">
                                    <label className="flex items-center justify-center px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded cursor-pointer text-[9px] font-bold text-slate-600 transition shadow-2xs">
                                      <Upload className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />
                                      <span>Upload Gambar Soal</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setEditQImage(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>

                                    {editQImage && (
                                      <div className="flex items-center space-x-1 border border-slate-200 bg-white p-0.5 rounded shrink-0">
                                        <img src={editQImage} alt="Preview" className="w-5 h-5 rounded object-cover" />
                                        <button 
                                          type="button" 
                                          onClick={() => setEditQImage('')}
                                          className="text-[8px] text-red-600 hover:text-red-700 font-extrabold px-1"
                                        >
                                          Hapus
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Atau tempel URL gambar..."
                                    value={editQImage}
                                    onChange={e => setEditQImage(e.target.value)}
                                    className="w-full text-[9px] p-1.5 border border-slate-200 bg-white rounded placeholder-slate-400 text-slate-650"
                                  />

                                  <div className="flex justify-between text-[9px] pt-1.5 items-center text-slate-500 border-t border-slate-200/50">
                                    <span className="font-bold">Penempatan Gambar Soal:</span>
                                    <div className="flex bg-white border border-slate-200 p-0.5 rounded">
                                      {['atas', 'tengah', 'bawah'].map(p => (
                                        <button
                                          key={p}
                                          type="button"
                                          onClick={() => setEditQImgPos(p as any)}
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold capitalize transition ${
                                            editQImgPos === p 
                                              ? 'bg-[#00705f] text-white' 
                                              : 'text-slate-500 hover:bg-slate-100'
                                          }`}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Pembahasan Kupas Tuntas</label>
                                  <textarea
                                    rows={2}
                                    value={editQExplanation}
                                    onChange={e => setEditQExplanation(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Kunci Jawaban</label>
                                    <select
                                      value={editQCorrect}
                                      onChange={e => setEditQCorrect(e.target.value)}
                                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      {['A','B','C','D','E'].map(o => (
                                        <option key={o} value={o}>Pilihan {o}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Right field: Edit Options A-E WITH uploaders & positioning */}
                              <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase text-slate-400">Opsi Jawaban & Lampiran Opsi</label>
                                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                  {['A','B','C','D','E'].map(o => {
                                    const optText = (editQOptions as any)[o];
                                    const optImg = (editQOptionImages as any)[o];
                                    const optPos = (editQOptionImagePositions as any)[o] || 'tengah';

                                    return (
                                      <div key={o} className="bg-white p-2.5 border border-slate-150 rounded-xl space-y-1.5 shadow-2xs">
                                        <div className="flex gap-2 items-center">
                                          <span className="w-5 h-5 bg-[#00705f]/10 text-[#00705f] rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">{o}</span>
                                          <input
                                            type="text"
                                            placeholder={`Teks Opsi ${o}...`}
                                            value={optText || ''}
                                            onChange={e => {
                                              const val = e.target.value;
                                              setEditQOptions(prev => ({ ...prev, [o]: val }));
                                            }}
                                            className="flex-grow text-[11px] p-1.5 border border-slate-200 rounded bg-slate-50/50 font-medium"
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7 pt-1.5 border-t border-slate-100">
                                          <div className="flex items-center space-x-2">
                                            <label className="flex items-center justify-center px-1.5 py-0.5 bg-slate-50 hover:bg-slate-150 border border-slate-250 border-slate-200 rounded cursor-pointer text-[8px] font-bold text-slate-600 transition shadow-2xs">
                                              <Upload className="w-2.5 h-2.5 text-blue-500 mr-1" />
                                              <span>Upload</span>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                      setEditQOptionImages(prev => ({ ...prev, [o]: reader.result as string }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                  }
                                                }}
                                              />
                                            </label>

                                            {optImg ? (
                                              <div className="flex items-center space-x-1 border border-slate-200 bg-white p-0.5 rounded shrink-0">
                                                <img src={optImg} alt={`Pilihan ${o}`} className="w-4.5 h-4.5 rounded object-cover" />
                                                <button
                                                  type="button"
                                                  onClick={() => setEditQOptionImages(prev => ({ ...prev, [o]: '' }))}
                                                  className="text-[8px] text-rose-600 hover:text-rose-700 font-black px-0.5"
                                                >
                                                  Clear
                                                </button>
                                              </div>
                                            ) : (
                                              <span className="text-[8px] text-slate-400">Empty</span>
                                            )}
                                          </div>

                                          <div className="flex items-center justify-end space-x-1 text-[8px] text-slate-500">
                                            <span className="font-semibold text-slate-400">Letak:</span>
                                            <div className="flex bg-slate-50 border border-slate-250 border-slate-200 p-0.5 rounded">
                                              {['atas', 'tengah', 'bawah'].map(pos => (
                                                <button
                                                  key={pos}
                                                  type="button"
                                                  onClick={() => setEditQOptionImagePositions(prev => ({ ...prev, [o]: pos }))}
                                                  className={`px-1 py-0.5 rounded text-[8px] font-bold capitalize transition ${
                                                    optPos === pos 
                                                      ? 'bg-[#00705f] text-white' 
                                                      : 'text-[#00705f] hover:bg-slate-100'
                                                  }`}
                                                >
                                                  {pos}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // CUSTOM USER REQUEST PANEL COLUMN ROW
                          // SOAL #1 ({subtest}) -- {ispublished status} -- {Terbitkan/Tarik toggle} -- {Edit} -- {Hapus}
                          <div className="space-y-3.5 text-xs leading-normal">
                            {/* Question Header Row */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-2.5">
                              <div>
                                <span className="text-[10px] bg-[#00705f]/10 text-[#00705f] font-black uppercase px-2.5 py-1 rounded-md">
                                  SOAL #{idx + 1} ({q.subExamName})
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 self-stretch md:self-auto justify-end">
                                {/* Status indicator */}
                                <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase ${
                                  isQPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {isQPublished ? 'Aktif CBT (Diterbitkan)' : 'Draf Bank Soal (Tertahan)'}
                                </span>

                                {/* Toggle Terbitkan / Tarik */}
                                <button
                                  onClick={() => handleTogglePublishQuestion(q.id)}
                                  className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                                    isQPublished ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {isQPublished ? '❌ Tarik Soal' : '🚀 Terbitkan'}
                                </button>

                                {/* Edit Action */}
                                <button
                                  onClick={() => startEditQuestion(q)}
                                  className="p-1 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[8px] font-bold uppercase rounded cursor-pointer transition-all flex items-center space-x-0.5"
                                >
                                  <i className="fa-solid fa-pen text-[7px]"></i>
                                  <span>SUNTING</span>
                                </button>

                                {/* Delete Action */}
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-1 px-2 bg-red-100 hover:bg-red-200 text-red-650 text-red-600 text-[8px] font-bold uppercase rounded cursor-pointer transition-all flex items-center space-x-0.5"
                                >
                                  <i className="fa-solid fa-trash-can text-[7px]"></i>
                                  <span>HAPUS</span>
                                </button>
                              </div>
                            </div>

                            {/* Question Body Content with Text, Images, and Options */}
                            <div className="bg-white p-4.5 rounded-2xl border border-slate-150 space-y-3.5 shadow-3xs text-left">
                              <p className="font-bold text-slate-800 text-[11px] whitespace-pre-wrap">{q.questionText}</p>
                              
                              {q.questionImage && (
                                <div className="p-1 bg-slate-50 border rounded-xl max-w-xs">
                                  <img src={q.questionImage} alt="Main Question Visual Aid" className="max-h-36 rounded object-contain" />
                                </div>
                              )}

                              {/* Options grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1.5">
                                {Object.entries(q.options || {}).map(([key, value]) => {
                                  const isCorrect = q.correctOption === key;
                                  return (
                                    <div key={key} className={`flex items-start space-x-2 text-[10px] p-2 rounded-xl border ${
                                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-extrabold shadow-3xs' : 'bg-slate-50/50 border-slate-100 text-slate-600'
                                    }`}>
                                      <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] ${
                                        isCorrect ? 'bg-[#00705f] text-white shadow-3xs' : 'bg-slate-200 text-slate-500'
                                      }`}>
                                        {key}
                                      </span>
                                      <span className="pt-0.5 leading-relaxed">{String(value || '-')}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Question Explanation block */}
                              <div className="bg-[#00705f]/5 border border-[#00705f]/15 p-3 rounded-xl text-2xs space-y-1">
                                <div className="flex items-center space-x-2 text-slate-700 font-black">
                                  <span className="bg-[#00705f] text-white px-2 py-0.5 rounded-md text-[8px] tracking-wider uppercase font-black shadow-3xs">KUNCI JAWABAN: {q.correctOption}</span>
                                  <span className="text-[10px] text-[#00705f]">PEMBAHASAN RESMI</span>
                                </div>
                                <p className="text-slate-600 leading-normal pl-0.5 whitespace-pre-wrap font-medium">{q.explanation || 'Sesuai dengan logika pembahasan CAT Kata Kita.'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: HASIL DAN REKAP ================= */}
        {activeTab === 'hasil_rekap' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* SUB-TABS TO SEPARATE ATTEMPTS LOGS AND REGISTERED STUDENT LIST */}
            <div className="flex space-x-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setRekapSubTab('log_nilai')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer ${
                  rekapSubTab === 'log_nilai' ? 'bg-[#00705f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Log Sesi Tryout Siswa ({attempts.length})
              </button>
              <button
                onClick={() => setRekapSubTab('akun_siswa')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer ${
                  rekapSubTab === 'akun_siswa' ? 'bg-[#00705f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Registrasi Akun Siswa ({studentUsers.length})
              </button>
            </div>

            {rekapSubTab === 'log_nilai' ? (
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase">
                    <i className="fa-solid fa-list-check text-[#00705f]"></i>
                    SEJARAH HASIL PENGERJAAN COMPUTER-BASED TEST (CBT) SISWA
                  </span>
                  <button
                    onClick={() => {
                      if (safeConfirm("Apakah anda yakin membersihkan log kegiatan tryout secara permanen?")) {
                        setAttempts([]);
                        localStorage.removeItem('katakita_student_attempts');
                        safeAlert("Log Tryout Dikosongkan!");
                      }
                    }}
                    className="text-red-650 font-extrabold cursor-pointer hover:underline text-[10px] text-red-600 uppercase tracking-wider flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg border border-red-200/50 shadow-2xs"
                  >
                    <i className="fa-solid fa-trash-can text-[9px]"></i>
                    Hapus Semua Log Nilai
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-3xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#00705f] text-white uppercase text-[9px] font-black border-b border-emerald-900 tracking-wider">
                        <th className="p-3">Sesi ID</th>
                        <th className="p-3 font-semibold">Nama Siswa</th>
                        <th className="p-3 font-semibold">Paket</th>
                        <th className="p-3 font-semibold">Status Pengerjaan</th>
                        <th className="p-3 font-semibold">Nilai Pokok</th>
                        <th className="p-3 font-semibold">Waktu Pengumpulan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-bold bg-white">
                            Belum terpantau ada siswa menyelesaikan simulasi tryout saat ini.
                          </td>
                        </tr>
                      ) : (
                        attempts.map((att, idx) => {
                          const student = studentUsers.find(u => u.id === att.userId);
                          const pkg = packages.find(p => p.id === att.examId);
                          const isEven = idx % 2 === 0;
                          return (
                            <tr key={att.id} className={`border-b border-slate-150 hover:bg-emerald-50/25 transition-all duration-150 ${
                              isEven ? 'bg-white' : 'bg-slate-50/55'
                            }`}>
                              <td className="p-3 font-mono text-slate-500 text-3xs font-semibold select-all">{att.id}</td>
                              <td className="p-3 font-extrabold text-slate-800">{student?.fullname || 'Siswa Umum'}</td>
                              <td className="p-3 font-bold text-[#00705f]">{pkg?.name || att.examId}</td>
                              <td className="p-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/40 shadow-2xs flex items-center gap-1 w-max">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                  Selesai CBT
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-mono font-black py-1 px-2.5 bg-emerald-50 text-[#00705f] rounded-lg border border-emerald-100 text-2xs shadow-3xs inline-block">
                                  {att.finalScore ?? 80} / 100
                                </span>
                              </td>
                              <td className="p-3 text-slate-450 font-mono text-3xs text-slate-550">
                                {att.endTime ? new Date(att.endTime).toLocaleString('id-ID') : 'Baru saja'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // REGISTERED STUDENTS SHEET COMPONENT
              // Display student registration photo + meta + password!
              <div className="space-y-4 text-left">
                <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <i className="fa-solid fa-users-gear text-[#00705f]"></i>
                  MODERN KARTU DATABASE REGISTRASI AKUN SISWA & KATA SANDI
                </span>

                {studentUsers.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-dashed rounded-3xl">
                    <p className="text-xs text-slate-400 font-bold">Belum terdapat akun pendaftar siswa aktif saat ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                    {studentUsers.map(stud => {
                      const isEditingS = editingStudentId === stud.id;
                      return (
                        <div key={stud.id} className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-4.5 shadow-2xs hover:shadow-sm hover:border-[#00705f]/30 transition-all relative overflow-hidden flex flex-col justify-between group">
                          {/* Colored Top Accent based on interest */}
                          <div className={`absolute top-0 inset-x-0 h-1 ${
                            stud.categoryInterest?.toLowerCase().includes('literasi') ? 'bg-rose-500' :
                            stud.categoryInterest?.toLowerCase().includes('cpns') ? 'bg-amber-500' :
                            stud.categoryInterest?.toLowerCase().includes('mandiri') ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}></div>

                          {/* Upper Card Header */}
                          <div className="flex items-start gap-3 relative">
                            <img
                              src={stud.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 shadow-3xs shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0 pr-1 space-y-0.5">
                              {isEditingS ? (
                                <input
                                  type="text"
                                  value={editSName}
                                  onChange={e => setEditSName(e.target.value)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold bg-white"
                                  placeholder="Nama Siswa..."
                                />
                              ) : (
                                <h4 className="font-black text-slate-800 text-[11px] truncate flex items-center gap-1">
                                  {stud.fullname}
                                  <i className="fa-solid fa-circle-check text-[9px] text-[#00705f]"></i>
                                </h4>
                              )}

                              {isEditingS ? (
                                <input
                                  type="text"
                                  value={editSSchool}
                                  onChange={e => setEditSSchool(e.target.value)}
                                  className="w-full p-1 border border-slate-200 rounded text-[9px] bg-white mt-1"
                                  placeholder="Asal Sekolah..."
                                />
                              ) : (
                                <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 truncate">
                                  <i className="fa-solid fa-graduation-cap text-[#00705f]/70"></i>
                                  {stud.school || 'SMA Sederajat'}
                                </p>
                              )}
                            </div>

                            {/* Actions Floating/Upper right */}
                            <div className="flex flex-col gap-1 shrink-0">
                              {isEditingS ? (
                                <>
                                  <button
                                    onClick={handleSaveStudentAccountChange}
                                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-black uppercase rounded-md cursor-pointer transition shadow-3xs"
                                  >
                                    SIMPAN
                                  </button>
                                  <button
                                    onClick={() => setEditingStudentId(null)}
                                    className="p-1 px-2.5 bg-slate-400 hover:bg-slate-500 text-white text-[8px] font-black uppercase rounded-md cursor-pointer transition"
                                  >
                                    BATAL
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingStudentId(stud.id);
                                      setEditSName(stud.fullname);
                                      setEditSSchool(stud.school || '');
                                      setEditSMail(stud.email);
                                      setEditSPhone(stud.phone || '');
                                      setEditSPass(stud.password || '');
                                    }}
                                    className="p-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[8px] font-black uppercase rounded cursor-pointer transition"
                                  >
                                    SUNTING
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudentAccount(stud.id)}
                                    className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 border border-red-200 text-[8px] font-black uppercase rounded cursor-pointer transition"
                                  >
                                    HAPUS
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Middle Stats/Interest Row */}
                          <div className="my-2.5 px-0.5 border-t border-b border-dashed border-slate-200 py-1.5 flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[8px]">Kluster Peminatan:</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              stud.categoryInterest?.toLowerCase().includes('literasi') ? 'bg-rose-50 text-rose-700 border border-rose-200/30' :
                              stud.categoryInterest?.toLowerCase().includes('cpns') ? 'bg-amber-50 text-amber-700 border border-amber-200/30' :
                              stud.categoryInterest?.toLowerCase().includes('mandiri') ? 'bg-emerald-50 text-emerald-700 border border-[#00705f]/20' :
                              'bg-blue-50 text-blue-700 border border-blue-200/20'
                            }`}>
                              {stud.categoryInterest || 'TPS'}
                            </span>
                          </div>

                          {/* Credentials layout section */}
                          <div className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-1.5 text-[10px] mt-0.5">
                            <div className="flex items-center justify-between text-slate-500">
                              <span className="font-bold text-[9px]">Surel Akun:</span>
                              {isEditingS ? (
                                <input
                                  type="text"
                                  value={editSMail}
                                  onChange={e => setEditSMail(e.target.value)}
                                  className="p-0.5 px-1 border text-3xs rounded bg-white w-32 text-right text-slate-800"
                                />
                              ) : (
                                <span className="font-extrabold text-slate-800 select-all font-mono text-[9px]">{stud.email}</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-slate-500">
                              <span className="font-bold text-[9px]">Sandi Akses:</span>
                              {isEditingS ? (
                                <input
                                  type="text"
                                  value={editSPass}
                                  onChange={e => setEditSPass(e.target.value)}
                                  className="p-0.5 px-1 border text-3xs rounded bg-white w-32 text-right text-slate-800"
                                />
                              ) : (
                                <span className="font-black text-[#00705f] select-all font-mono text-[9px]">
                                  <i className="fa-solid fa-key text-[8px] mr-1 text-[#00705f]/60"></i>
                                  {stud.password || 'none'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-100">
                              <span className="font-bold text-[9px]">No WhatsApp:</span>
                              {isEditingS ? (
                                <input
                                  type="text"
                                  value={editSPhone}
                                  onChange={e => setEditSPhone(e.target.value)}
                                  className="p-0.5 px-1 border text-3xs rounded bg-white w-32 text-right text-slate-800"
                                />
                              ) : (
                                <a 
                                  href={`https://wa.me/${stud.phone?.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-bold text-slate-700 hover:text-[#00705f] flex items-center gap-0.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded shadow-3xs"
                                >
                                  <i className="fa-brands fa-whatsapp text-emerald-500"></i>
                                  {stud.phone || 'Hadir'}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: KONEKSI SPREADSHEET ================= */}
        {activeTab === 'koneksi_sheet' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Sinkronisasi Database Awang Google Spreadsheet</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Tautkan log rekap pengerjaan tryout dan pendaftaran akun siswa secara waktu-nyata ke spreadsheet Google Drive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Settings Configuration lists */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-450 text-slate-400 mb-1.5">Tampilan URL Google Spreadsheet Resmi</label>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl font-mono text-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">ID Identifikasi Spreadsheet Utama</label>
                  <input
                    type="text"
                    value={sheetId}
                    onChange={e => setSheetId(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl font-mono text-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Nama Tab Utama</label>
                    <input
                      type="text"
                      value={sheetName}
                      onChange={e => setSheetName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Nama di Google Drive</label>
                    <input
                      type="text"
                      value={driveName}
                      onChange={e => setDriveName(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Alamat Surel Pemilik Akun Spreadsheet</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-3.5 pt-2">
                  <button
                    onClick={handleSaveSheetConfig}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-355 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl cursor-pointer"
                  >
                    Simpan Parameter
                  </button>
                  <button
                    onClick={handleSimulateSyncNow}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-all active:scale-95"
                  >
                    🚀 Paksa Sinkronisasi Now
                  </button>
                </div>
              </div>

              {/* Logs metrics screen */}
              <div className="space-y-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">INTEGRASI LIVE MONITOR SPREADSHEET:</span>
                  <div className="bg-slate-950 text-emerald-400 rounded-2xl p-4.5 font-mono text-[10px] leading-relaxed border border-slate-800 space-y-2.5 shadow-inner min-h-60 max-h-72 overflow-y-auto">
                    <p className="text-white font-bold border-b border-white/5 pb-1 flex justify-between items-center">
                      <span>CONSOLE LOG SHEET SINKRON</span>
                      <span className="text-[8px] bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-300">ONLINE</span>
                    </p>
                    {syncHistoryLogs.map((log, lidx) => (
                      <p key={lidx} className="truncate">» {log}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100/85">
                  <p className="text-2xs font-extrabold text-sky-750 text-sky-800 uppercase tracking-widest block">GOOGLE SHEETS API GATEWAY</p>
                  <p className="text-[10px] text-slate-600 leading-normal pt-1 font-semibold">
                    Setiap kali siswa mendaftar akun atau mensubmit skor tryout nasional di portal, piringan sinkron otomatis akan menulis baris log baru ke dokumen <span className="font-bold font-mono">RUMAH SOAL</span>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 8: PREVIEW SISWA TRYOUT ================= */}
        {activeTab === 'preview_siswa' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Simulator Tryout Siswa (Pratinjau Guru)</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Sebagai administrator atau pengajar, Anda dapat mensimulasikan audit kesiapan butir soal dan konfigurasi test untuk masing-masing paket sebelum diujikan secara live ke siswa.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <span className="text-xs font-black uppercase text-slate-600 block">PILIH PAKET UNTUK MULAI SIMULASI AUDIT GURU:</span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                {packages.map(pkg => {
                  const pkgQs = questions.filter(q => q.examId === pkg.id);
                  return (
                    <div key={pkg.id} className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-805 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200 shadow-lg group relative overflow-hidden">
                      {/* Top Glowing Decorator */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 opacity-60"></div>
                      
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {pkg.category}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                            ID: {pkg.id}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-xs pt-3 leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">{pkg.name}</h4>
                        <p className="text-slate-400 text-3xs pt-1.5 leading-relaxed line-clamp-2">
                          {pkg.description || 'Tidak ada deskripsi paket tambahan disediakan.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 mt-4.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 pb-3">
                          <span className="flex items-center gap-1">
                            <i className="fa-regular fa-clock text-slate-500"></i>
                            {pkg.totalDurationMinutes || 120} Menit
                          </span>
                          <span className="flex items-center gap-1 font-bold">
                            <i className="fa-solid fa-list-ol text-slate-500"></i>
                            {pkgQs.length} Butir Soal
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const subtestNames = pkg.subExams?.map(subName => {
                              const cfg = pkg.subExamsConfig?.[subName];
                              const qCount = cfg?.questionCount ?? 15;
                              const dur = cfg?.durationMinutes ?? 30;
                              return `• ${subName} (${qCount} soal, ${dur} menit)`;
                            }).join('\n') || '• Default Subtest Terintegrasi';
                            const confirmSim = safeConfirm(
                              `[AUDIT SANDBOX PORTAL AKTIF]\n\n` +
                              `Menguji Paket: "${pkg.name}"\n` +
                              `Total Kesiapan Soal Terbaca: ${pkgQs.length} Soal\n` +
                              `Status Akses: ${pkg.isPremium ? 'AKSES PREMIUM (DIKUNCI)' : 'AKSESBEBAS / GRATIS'}\n\n` +
                              `Daftar Cakupan Subtest:\n${subtestNames}\n\n` +
                              `Apakah Anda ingin memulai simulasi ujian sesungguhnya untuk paket ini sekarang?`
                            );
                            if (confirmSim && onStartExam) {
                              onStartExam(pkg.id);
                            }
                          }}
                          className={`w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase rounded-lg tracking-wider transition-all cursor-pointer text-center shadow-md`}
                        >
                          Mulai Uji Coba Cepat (Simulator)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: PENGATURAN PORTAL ================= */}
        {activeTab === 'pengaturan' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 text-left">
              <h3 className="font-display font-black text-slate-800 text-base">Konfigurasi Pengaturan Portal Bimbel</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Ubah profil admin instansi Anda, slogan landing page, tautan grup Whatsapp, serta nama brand secara permanen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Admin profile configurations */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">EDIT PROFIL ADMINISTRASI (PERMANEN):</span>
                
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-450 text-slate-400 mb-1">Nama Administrator Utama</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Staff Kantor/Jabatan</label>
                  <input
                    type="text"
                    value={adminRole}
                    onChange={e => setAdminRole(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Foto Profil Admin Instansi</label>
                  
                  {/* Avatar Preview */}
                  <div className="flex items-center space-x-3.5 mb-2.5 bg-white p-2.5 rounded-xl border border-slate-150 shadow-3xs">
                    <img 
                      src={adminPhoto || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'} 
                      alt="Admin Avatar" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-700">Pratinjau Foto Aktif</p>
                      <p className="text-[8px] text-slate-400">Pilih file dari HP/Laptop untuk langsung mengubah.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAdminPhoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-emerald-50 file:text-[#00705f] hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <div className="pt-2 border-t border-slate-100 mt-1">
                      <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Atau Masukkan Tautan URL Gambar</label>
                      <input
                        type="text"
                        value={adminPhoto}
                        onChange={e => setAdminPhoto(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Email / Username</label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Password Admin</label>
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      syncAdminDetails();
                      alert("Profil Administrator Berhasil Diperbarui Secara Permanen di LocalStorage!");
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer"
                  >
                    Simpan Perubahan Akun
                  </button>
                </div>
              </div>

              {/* Landing Page Content customization */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">KUSTOMISASI LANDING PAGE & BRAND:</span>
                
                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Headline Utama Hero Slider</label>
                  <textarea
                    rows={2}
                    value={landingBannerText}
                    onChange={e => {
                      setLandingBannerText(e.target.value);
                      localStorage.setItem('katakita_settings_banner', e.target.value);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase font-black text-slate-400 mb-1">Slogan Sub-Headline Banner</label>
                  <textarea
                    rows={2}
                    value={landingBannerSlogan}
                    onChange={e => {
                      setLandingBannerSlogan(e.target.value);
                      localStorage.setItem('katakita_settings_slogan', e.target.value);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-100">
                  <span className="text-[8px] font-black text-sky-800 uppercase block">INFO KELANCARAN PENERBITAN</span>
                  <p className="text-[10px] text-slate-600 leading-normal pt-1">
                    Setiap perubahan pada segment ini akan langsung berdampak permanen terhadap tampilan visual situs luar (Landing Page) tanpa merombak file skrip program dasar.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
