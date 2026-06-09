import React, { useState, useEffect, useRef } from 'react';
import { ExamPackage, Question, StudentAttempt, UserRegistry } from '../types';

interface TryoutPlayerProps {
  pkg: ExamPackage;
  questions: Question[];
  onSubmit: (attempt: Omit<StudentAttempt, 'id'>) => void;
  onCancel: () => void;
  currentUser: UserRegistry | null;
}

export default function TryoutPlayer({ pkg, questions, onSubmit, onCancel, currentUser }: TryoutPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [doubtfuls, setDoubtfuls] = useState<{ [qId: string]: boolean }>({});
  const [tabViolations, setTabViolations] = useState(0);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(pkg.totalDurationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showViolationAlert, setShowViolationAlert] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tab switching surveillance - Anti Cheating Engine
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const updated = prev + 1;
          setShowViolationAlert(true);
          return updated;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabViolations((prev) => {
        const updated = prev + 1;
        setShowViolationAlert(true);
        return updated;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Countdown Timer Loop
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerAutoSubmit = () => {
    alert("Waktu pengerjaan tryout Anda telah habis! Sistem mengirimkan jawaban Anda secara otomatis.");
    handleFinalSubmit();
  };

  const handleOptionSelect = (option: string) => {
    const qId = questions[currentIdx].id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const toggleDoubtful = () => {
    const qId = questions[currentIdx].id;
    setDoubtfuls((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const clearAnswer = () => {
    const qId = questions[currentIdx].id;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Grade calculate on completion
  const handleFinalSubmit = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let emptyCount = 0;

    questions.forEach((q) => {
      const chosen = answers[q.id];
      if (!chosen) {
        emptyCount++;
      } else if (chosen === q.correctOption) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const finalScore = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    onSubmit({
      userId: currentUser?.id || "USER-DEMO-STUDENT",
      examId: pkg.id,
      status: 'SUBMITTED',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      answers,
      doubtfulAnswers: doubtfuls,
      tabSwitchViolations: tabViolations,
      finalScore,
      correctCount,
      incorrectCount,
      emptyCount
    });
  };

  const activeQuestion = questions[currentIdx];

  // Helper count status
  const answeredCount = Object.keys(answers).length;
  const doubtfulCount = Object.values(doubtfuls).filter(Boolean).length;

  return (
    <div className="space-y-6 py-4 text-left font-sans" id="exam-taker-container">
      
      {/* Tab Violating Pop-up Toast Alert */}
      {showViolationAlert && (
        <div id="violation-toast" className="bg-red-50 border-l-4 border-red-505 p-4 rounded-xl shadow-md flex items-start justify-between border border-red-105">
          <div className="flex space-x-3">
            <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1 shrink-0 text-base"></i>
            <div>
              <p className="font-extrabold text-red-800 text-sm">Peringatan Integritas Akademik!</p>
              <p className="text-xs text-red-700 mt-1">
                Sistem mendeteksi Anda meninggalkan layar ujian atau berganti tab ({tabViolations} kali). Pelanggaran dicatat dalam log ujian dan mempengaruhi keabsahan penilaian. Mohon tetap fokus berjalan di platform!
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowViolationAlert(false)} 
            className="text-red-400 hover:text-red-700 text-xs font-black cursor-pointer bg-red-100 hover:bg-red-200/60 px-2 py-1 rounded"
          >
            SAYA MENGERTI
          </button>
        </div>
      )}

      {/* Taker Main Area Grid */}
      <div className="flex flex-col lg:flex-row gap-8" id="exam-grid">
        
        {/* Left column: Active Question detail body */}
        <div className="flex-1 flex flex-col justify-between space-y-6 min-h-[500px] bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          
          {/* Header row */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-md tracking-wide uppercase">
                {pkg.category}
              </span>
              <h3 className="font-display font-black text-xl text-slate-800 tracking-tight leading-none mt-1">
                {pkg.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Subtes Aktif: <strong className="text-slate-600 font-semibold">{activeQuestion?.subExamName}</strong>
              </p>
            </div>

            {/* Live timer block */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-mono text-sm font-bold text-slate-850">
              <i className="fa-regular fa-clock text-blue-500 mr-0.5"></i>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Text block */}
          {activeQuestion ? (
            <div className="space-y-6 py-4 flex-1">
              <div className="flex items-start space-x-3">
                <span className="font-display bg-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                  {currentIdx + 1}
                </span>
                <div className="text-slate-800 text-base font-semibold leading-relaxed whitespace-pre-wrap">
                  {activeQuestion.questionText}
                </div>
              </div>

              {/* Input choices list (A to E) */}
              <div className="space-y-3 pl-11">
                {Object.entries(activeQuestion.options).map(([key, optText]) => {
                  const isSelected = answers[activeQuestion.id] === key;
                  return (
                    <button
                      key={key}
                      id={`option-btn-${activeQuestion.id}-${key}`}
                      onClick={() => handleOptionSelect(key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 text-blue-808 font-semibold shadow-sm'
                          : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-lg border font-bold text-xs ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {key}
                      </span>
                      <span className="text-sm leading-snug">{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs">Menunggu muatan soal...</div>
          )}

          {/* Action Row at bottom */}
          <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 border border-slate-203 hover:border-slate-400 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 disabled:opacity-30 cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={toggleDoubtful}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 cursor-pointer ${
                doubtfuls[activeQuestion?.id]
                  ? 'bg-yellow-400 border-yellow-400 text-slate-900 shadow-md shadow-yellow-100'
                  : 'bg-white border-slate-200 hover:border-slate-400 text-slate-600'
              }`}
            >
              <i className="fa-solid fa-flag text-[10px]"></i>
              <span>Ragu-Ragu</span>
            </button>

            {answers[activeQuestion?.id] && (
              <button
                onClick={clearAnswer}
                className="text-xs text-red-505 hover:text-red-700 font-black hover:underline cursor-pointer"
              >
                Hapus Jawab
              </button>
            )}

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-circle-check"></i>
                <span>Selesai Ujian</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Berikutnya</span>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            )}
          </div>
        </div>

        {/* Right column: Navigation indicators & statistics */}
        <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <h3 className="font-display font-extrabold text-lg text-slate-805">Navigasi Soal</h3>

            {/* Quick stats indicator */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex flex-col text-left">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Terjawab:</span>
                <span className="font-black text-slate-800 text-sm mt-0.5">{answeredCount} Soal</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Ragu-ragu:</span>
                <span className="font-black text-yellow-600 text-sm mt-0.5">{doubtfulCount} Soal</span>
              </div>
            </div>

            {/* Grid layout indices */}
            <div className="grid grid-cols-5 gap-2.5" id="nav-idx-grid">
              {questions.map((q, idx) => {
                const hasAnswer = !!answers[q.id];
                const isDoubtful = doubtfuls[q.id];
                const isActive = currentIdx === idx;

                let btnClass = "border-slate-100 bg-white text-slate-500 hover:border-slate-300";
                
                if (isActive) {
                  btnClass = "border-blue-600 bg-blue-600 text-white font-black scale-110 shadow-sm shadow-blue-100";
                } else if (isDoubtful) {
                  btnClass = "border-yellow-400 bg-yellow-400 text-slate-900 font-bold";
                } else if (hasAnswer) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    id={`nav-idx-btn-${idx}`}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-10 h-10 rounded-lg border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick exit */}
          <div className="border-t border-slate-100 pt-6 space-y-3 text-center">
            <p className="text-slate-400 text-[9px] leading-relaxed uppercase tracking-wider font-extrabold">
              <i className="fa-solid fa-desktop mr-1"></i> Pengawasan Akurat Aktif
            </p>
            <button
              onClick={onCancel}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
            >
              Keluar Sesi Ujian
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-left animate-scale-up">
            <div className="space-y-2">
              <div className="p-3 bg-red-50 text-red-600 rounded-full w-12 h-12 flex items-center justify-center text-lg">
                <i className="fa-solid fa-circle-question"></i>
              </div>
              <h3 className="font-display font-black text-2xl text-slate-800">Selesaikan Tryout?</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Apakah Anda yakin ingin mengakhiri simulasi ini? Jawaban Anda akan dihitung dan direkam secara permanen dalam data siswa.
              </p>
            </div>

            {/* Summary statistics inside modal */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
              <div className="flex justify-between">
                <span>Total Soal:</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Soal Terjawab:</span>
                <span className="text-emerald-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Belum Terjawab:</span>
                <span className="text-red-500">{questions.length - answeredCount}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold border-t border-slate-205 pt-2 mt-2">
                <span>Jumlah Keluar Tab:</span>
                <span>{tabViolations} Kali</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  handleFinalSubmit();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-100 cursor-pointer"
              >
                Ya, Selesai!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
