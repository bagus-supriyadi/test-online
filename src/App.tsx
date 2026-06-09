import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TryoutDashboard from './components/TryoutDashboard';
import TryoutPlayer from './components/TryoutPlayer';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import AuthPortal from './components/AuthPortal';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';

import { ExamPackage, Question, StudentAttempt, UserRegistry } from './types';
import { DEFAULT_PACKAGES, DEFAULT_QUESTIONS } from './data/sampleQuestions';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // Track continuous authenticated session details
  const [currentUser, setCurrentUser] = useState<UserRegistry | null>(() => {
    const saved = localStorage.getItem('katakita_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const userRole = currentUser?.role || 'student';
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Core Data States
  const [packages, setPackages] = useState<ExamPackage[]>(() => {
    const saved = localStorage.getItem('katakita_packages');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('katakita_questions');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });

  // Sync state changes to storage
  useEffect(() => {
    localStorage.setItem('katakita_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('katakita_questions', JSON.stringify(questions));
  }, [questions]);
  
  // Premium lock status mapping
  const [locks, setLocks] = useState<{ [packageId: string]: boolean }>(() => {
    const initialLocks: { [key: string]: boolean } = {};
    DEFAULT_PACKAGES.forEach(p => {
      initialLocks[p.id] = p.isPremium || false;
    });
    return initialLocks;
  });

  // Load student attempts from localStorage for persistence
  const [attempts, setAttempts] = useState<StudentAttempt[]>(() => {
    const saved = localStorage.getItem('katakita_student_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save attempts to localStorage on changes
  useEffect(() => {
    localStorage.setItem('katakita_student_attempts', JSON.stringify(attempts));
  }, [attempts]);

  // Auth Operations
  const handleLoginSuccess = (user: UserRegistry) => {
    setCurrentUser(user);
    localStorage.setItem('katakita_current_user', JSON.stringify(user));
    // Redirect after login
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('tryouts');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('katakita_current_user');
    setActiveTab('home');
  };

  // Toggle package lock
  const handleToggleLock = (packageId: string) => {
    setLocks((prev) => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  // Submit test scoring
  const handleExamSubmit = (newAttempt: Omit<StudentAttempt, 'id'>) => {
    const completedAttempt: StudentAttempt = {
      ...newAttempt,
      id: `ATTEMPT-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setAttempts((prev) => [completedAttempt, ...prev]);
    setActiveExamId(null);
    setActiveTab('tryouts'); // Shifts view back to dashboard to view results
  };

  // Callback to simulate importing spreadsheet questions (dynamically adds 2 questions)
  const handleImportSpreadsheetQuestions = () => {
    const extraQuestions: Question[] = [
      {
        id: "Q-SHEET-01",
        examId: "PKG-UTBK",
        subExamName: "Literasi Bahasa Indonesia",
        questionText: "Contoh soal hasil sinkronisasi dari Google Spreadsheet ID: 1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE \n\nBagian tubuh tumbuhan yang berfungsi sebagai organ pernafasan khusus pada tanaman bakau di daerah pantai berlumpur Kota Bandar Lampung adalah...",
        options: {
          A: "Akar gantung",
          B: "Pneumatofor (Akar napas)",
          C: "Stomata daun lebar",
          D: "Lentisel batang sekunder",
          E: "Akar serabut tebal"
        },
        correctOption: "B",
        explanation: "Pneumatofor (akar napas) tumbuh tegak lurus ke atas dari lumpur untuk menyerap oksigen langsung dari udara, sangat khas pada tanaman bakau (mangrove) pesisir pantai."
      },
      {
        id: "Q-SHEET-02",
        examId: "PKG-CPNS",
        subExamName: "Tes Inteligensi Umum (TIU)",
        questionText: "Contoh soal hasil sinkronisasi dari Google Spreadsheet ID: 1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE \n\nSemua aparatur sipil negara (ASN) wajib memegang teguh asas netralitas politik dalam pemilu. Sebagian pengajar di Bandar Lampung terpilih menjadi ASN.\n\nSimpulan mana yang PALING SAH?",
        options: {
          A: "Semua pengajar di Bandar Lampung wajib netral secara politik.",
          B: "Sebagian pengajar di Bandar Lampung wajib netral secara politik dalam pemilu.",
          C: "Semua pengajar di Lampung bukanlah bagian dari aparatur negara.",
          D: "Tidak ada pengajar di Bandar Lampung yang mendaftar pemilu legislatif.",
          E: "Sebagian ASN di Lampung berhak memihak salah satu kandidat politik secara terbuka."
        },
        correctOption: "B",
        explanation: "Karena sebagian pengajar adalah ASN, dan seluruh ASN wajib netral, maka sebagian pengajar tersebut otomatis wajib netral."
      }
    ];

    setQuestions((prev) => {
      const exists = prev.some(q => q.id === "Q-SHEET-01");
      if (exists) return prev;
      return [...prev, ...extraQuestions];
    });

    // Update package counts in UI
    setPackages((prev) => {
      return prev.map(p => {
        if (p.id === "PKG-UTBK" || p.id === "PKG-CPNS") {
          return { ...p, totalQuestions: p.totalQuestions + 1 };
        }
        return p;
      });
    });
  };

  const handleAddCustomQuestion = (newQ: Question) => {
    setQuestions((prev) => [...prev, newQ]);
    
    // Update package counts in UI
    setPackages((prev) => {
      return prev.map(p => {
        if (p.id === newQ.examId) {
          return { ...p, totalQuestions: p.totalQuestions + 1 };
        }
        return p;
      });
    });
  };

  // Redirect to a specific category filter on TryoutDashboard
  const handleSelectBentoCategory = (categoryTitle: string) => {
    setActiveTab('tryouts');
  };

  // Custom visual components switch based on Tab State
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onStartTryout={() => {
              if (currentUser) {
                setActiveTab('tryouts');
              } else {
                setActiveTab('auth-student');
              }
            }}
            onSelectCategory={handleSelectBentoCategory}
          />
        );
      case 'tryouts':
        if (!currentUser) {
          return (
            <div className="py-6 flex justify-center">
              <AuthPortal onLoginSuccess={handleLoginSuccess} initialRole="student" />
            </div>
          );
        }
        return (
          <StudentPortal
            currentUser={currentUser}
            packages={packages}
            locks={locks}
            attempts={attempts.filter(a => a.userId === currentUser.id)}
            onStartExam={(id) => setActiveExamId(id)}
            questions={questions}
            onLogout={handleLogout}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'admin') {
          return (
            <div className="py-6 flex justify-center">
              <AuthPortal onLoginSuccess={handleLoginSuccess} initialRole="admin" />
            </div>
          );
        }
        return (
          <AdminPortal
            packages={packages}
            setPackages={setPackages}
            locks={locks}
            onToggleLock={handleToggleLock}
            questions={questions}
            setQuestions={setQuestions}
            onAddQuestion={handleAddCustomQuestion}
            onImportMockQuestions={handleImportSpreadsheetQuestions}
            onLogout={handleLogout}
            onStartExam={(id) => {
              setActiveExamId(id);
              setActiveTab('tryouts');
            }}
            attempts={attempts}
            setAttempts={setAttempts}
          />
        );
      case 'auth-student':
        return (
          <div className="py-6 flex justify-center">
            <AuthPortal onLoginSuccess={handleLoginSuccess} initialRole="student" />
          </div>
        );
      case 'auth-admin':
        return (
          <div className="py-6 flex justify-center">
            <AuthPortal onLoginSuccess={handleLoginSuccess} initialRole="admin" />
          </div>
        );
      default:
        return (
          <Home 
            onStartTryout={() => currentUser ? setActiveTab('tryouts') : setActiveTab('auth-student')} 
            onSelectCategory={handleSelectBentoCategory} 
          />
        );
    }
  };

  // If a student is taking an active test, render full screen player without distractions
  if (activeExamId) {
    const pkg = packages.find(p => p.id === activeExamId);
    const pkgQuestions = questions.filter(q => q.examId === activeExamId);

    if (pkg) {
      return (
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <TryoutPlayer
              pkg={pkg}
              questions={pkgQuestions}
              onSubmit={handleExamSubmit}
              onCancel={() => setActiveExamId(null)}
              currentUser={currentUser}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between">
      {/* Navbar segment */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {renderTabContent()}
      </main>

      {/* Common Footer */}
      {(activeTab !== 'home' && activeTab !== 'tryouts' && activeTab !== 'admin') && (
        <footer className="bg-slate-50 border-t border-slate-100 py-8 text-center text-xs text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
                  alt="Logo Kata Kita" 
                  className="h-6 w-auto object-contain"
                />
                <span className="font-display font-bold text-slate-700">© Bimbingan Belajar Kata Kita. All Rights Reserved.</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a href="https://katakita-group.biz.id/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Website Resmi</a>
                <a href="https://chat.whatsapp.com/K8thJWTEXZk1lOu0OveVel" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">Grup Belajar WA</a>
                <a href="mailto:belajar.katakita@gmail.com" className="hover:text-amber-600 transition-colors">belajar.katakita@gmail.com</a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider pt-2 border-t border-slate-200/50">
              Terhubung Google Spreadsheet ID: 1r_8Hw8paOLI4LuEtOUAterJEU-jsgdr96K5er5bh1PE
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
