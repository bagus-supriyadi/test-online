import React, { useState } from 'react';
import { ExamPackage, Question } from '../types';

interface AdminPanelProps {
  packages: ExamPackage[];
  locks: { [packageId: string]: boolean };
  onToggleLock: (packageId: string) => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onImportMockQuestions: () => void;
}

export default function AdminPanel({ 
  packages, 
  locks, 
  onToggleLock, 
  questions, 
  onAddQuestion,
  onImportMockQuestions
}: AdminPanelProps) {
  // Local state for custom question creator
  const [selectedPkg, setSelectedPkg] = useState(packages[0]?.id || '');
  const [subExamName, setSubExamName] = useState('Penalaran Umum');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [explanation, setExplanation] = useState('');

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [newQuestionCount, setNewQuestionCount] = useState(0);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Simulated syncing of Spreadsheet
  const handleSheetSync = () => {
    setIsSyncing(true);
    setShowSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncSuccess(true);
      onImportMockQuestions(); // Adds 2 extra questions dynamically
      setNewQuestionCount(2);
      setTimeout(() => setShowSyncSuccess(false), 5000);
    }, 2000);
  };

  const createQuestionIdx = () => {
    return `Q-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleCreateQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!selectedPkg || !subExamName || !questionText || !optionA || !optionB || !optionC || !optionD || !optionE || !correctOption) {
      setFormError('Harap lengkapi semua field isian utama beserta seluruh pilihan jawaban (A-E)!');
      return;
    }

    const newQ: Question = {
      id: createQuestionIdx(),
      examId: selectedPkg,
      subExamName,
      questionText,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
        E: optionE
      },
      correctOption,
      explanation: explanation || 'Jawaban dihitung berdasarkan penalaran logis akademik.'
    };

    onAddQuestion(newQ);
    setFormSuccess(true);

    // Clear form
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setOptionE('');
    setExplanation('');

    setTimeout(() => setFormSuccess(false), 4500);
  };

  return (
    <div className="space-y-12 py-6 text-left" id="admin-panel-container">
      
      {/* Intro info box */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg" id="admin-intro-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-user-shield text-[10px]"></i>
            <span>Hak Akses Guru / Administrator</span>
          </div>
          <h2 className="font-display font-black text-3xl leading-none text-white">Panel Kontrol Bimbel Kata Kita</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Halaman penyesuaian parameter operational tryout. Di sini pengawas atau pengajar dapat mengunci/membuka akses materi, serta mensinkronkan rilis bank soal terbaru dari database administrasi utama Google Spreadsheet.
          </p>
        </div>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Lock State Control & Spreadsheet Sync */}
        <div className="space-y-8 flex flex-col justify-between">
          
          {/* Lock State Toggles */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-800">Manajemen Status Akses Paket</h3>
              <p className="text-xs text-slate-500 mt-1">Atur ketersediaan akses publik dan monetisasi (Premium) dari kategori tryout.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {packages.map((pkg) => {
                const isLocked = locks[pkg.id] !== undefined ? locks[pkg.id] : pkg.isPremium;
                return (
                  <div key={pkg.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-colors border border-slate-100/50">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-xs">{pkg.name}</p>
                      <p className="text-[10px] text-slate-400">ID Paket: <strong className="font-mono text-[10px] text-slate-500">{pkg.id}</strong></p>
                    </div>

                    <button
                      onClick={() => onToggleLock(pkg.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                        isLocked
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                      }`}
                      id={`lock-toggle-${pkg.id}`}
                    >
                      {isLocked ? (
                        <>
                          <i className="fa-solid fa-lock text-[9px]"></i>
                          <span>Terkunci</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-lock-open text-[9px]"></i>
                          <span>Terbuka</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Google Spreadsheet Integration card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-file-excel text-emerald-600 text-lg"></i>
                <h3 className="font-display font-bold text-lg text-slate-800">Sinkronisasi Google Spreadsheet</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Platform Kata Kita terhubung langsung ke spreadsheet eksternal. Admin dapat melakukan sinkronisasi otomatis agar tryout terbaru dipasang ke aplikasi siswa.
              </p>
            </div>

            {/* Spec card details */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs text-slate-600">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Spreadsheet ID:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-white p-1 rounded border border-slate-100 truncate mt-1 sm:mt-0">1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Pertanyaan Terpasang:</span>
                <span className="font-bold text-slate-800">{questions.length} Soal</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status Koneksi Integrasi:</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping mr-1"></span>
                  Aktif & Stabil
                </span>
              </div>
            </div>

            {showSyncSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-lg text-xs text-emerald-700 flex items-start space-x-2">
                <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0"></i>
                <span>
                  <strong>Sinkronisasi Berhasil!</strong> Menambahkan <strong>{newQuestionCount} soal baru</strong> pre-loaded dari spreadsheet menuju daftar paket secara real-time.
                </span>
              </div>
            )}

            <button
              onClick={handleSheetSync}
              disabled={isSyncing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500/60 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
              id="sheet-sync-button"
            >
              <i className={`fa-solid fa-sync ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Mensinkronkan Spreadsheet...' : 'Sinkronkan Soal Sekarang'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Custom Question Creator Form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-50 pb-3 text-left">
            <h3 className="font-display font-bold text-lg text-slate-800">Tambah Pertanyaan Baru (Form Manual)</h3>
            <p className="text-xs text-slate-500 mt-1">Ubah atau sisipkan pertanyaan secara instan ke database tryout aktif saat sesi ini berjalan.</p>
          </div>

          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-lg text-xs font-semibold text-red-700 flex items-start space-x-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-lg text-xs font-semibold text-emerald-700 flex items-start space-x-2">
              <i className="fa-solid fa-circle-check text-emerald-600 shrink-0 mt-0.5" />
              <span>Pertanyaan berhasil ditambahkan ke paket pilihan Anda!</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestionSubmit} className="space-y-4" id="custom-question-form">
            <div className="grid grid-cols-2 gap-4">
              {/* Select Package target */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Kategori Paket:</label>
                <select
                  value={selectedPkg}
                  onChange={(e) => setSelectedPkg(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Sub-exam Topic */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Subtes:</label>
                <input
                  type="text"
                  value={subExamName}
                  onChange={(e) => setSubExamName(e.target.value)}
                  placeholder="e.g. Penalaran Umum"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pertanyaan (Teks):</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Tuliskan pertanyaan di sini secara komprehensif..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Option Input Fields (A to E) */}
            <div className="space-y-2 border-y border-slate-50 py-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Isian Pilihan Jawaban (A s.d E):</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">A</span>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Pilihan jawaban A"
                    className="w-full p-2 border border-slate-150 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">B</span>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Pilihan jawaban B"
                    className="w-full p-2 border border-slate-150 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">C</span>
                  <input
                    type="text"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Pilihan jawaban C"
                    className="w-full p-2 border border-slate-150 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">D</span>
                  <input
                    type="text"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Pilihan jawaban D"
                    className="w-full p-2 border border-slate-150 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 sm:col-span-2">
                  <span className="font-bold text-slate-400">E</span>
                  <input
                    type="text"
                    value={optionE}
                    onChange={(e) => setOptionE(e.target.value)}
                    placeholder="Pilihan jawaban E"
                    className="w-full p-2 border border-slate-150 rounded-md text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Answer Selector & Explanation */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kunci:</label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Penjelasan Jawaban:</label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Pembahasan rumus atau analogi..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-transform hover:scale-[1.01] mt-4 cursor-pointer"
              id="submit-question-btn"
            >
              <i className="fa-solid fa-save mr-1.5"></i>
              Simpan Soal ke Paket
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
