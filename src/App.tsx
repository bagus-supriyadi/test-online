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
import { collection, doc, onSnapshot, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // Track continuous authenticated session details
  const [currentUser, setCurrentUser] = useState<UserRegistry | null>(() => {
    const saved = localStorage.getItem('katakita_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const userRole = currentUser?.role || 'student';
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Core Data States with defaults till loaded from Firestore
  const [packages, setPackages] = useState<ExamPackage[]>(() => {
    const saved = localStorage.getItem('katakita_packages');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('katakita_questions');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });
  const [attempts, setAttempts] = useState<StudentAttempt[]>(() => {
    const saved = localStorage.getItem('katakita_student_attempts');
    return saved ? JSON.parse(saved) : [];
  });
  const [studentUsers, setStudentUsers] = useState<UserRegistry[]>(() => {
    const saved = localStorage.getItem('katakita_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [locks, setLocks] = useState<{ [packageId: string]: boolean }>(() => {
    const initialLocks: { [key: string]: boolean } = {};
    DEFAULT_PACKAGES.forEach(p => {
      initialLocks[p.id] = p.isPremium || false;
    });
    return initialLocks;
  });

  // Real-time synchronization layer with Firestore (seeding + subscribing)
  useEffect(() => {
    const initializeAndSubscribe = async () => {
      try {
        // Seed default packages if empty on Cloud DB
        const pkgsSnap = await getDocs(collection(db, 'packages'));
        if (pkgsSnap.empty) {
          console.log('Database empty! Seeding default packages to Firestore...');
          for (const p of DEFAULT_PACKAGES) {
            await setDoc(doc(db, 'packages', p.id), p);
          }
          for (const q of DEFAULT_QUESTIONS) {
            await setDoc(doc(db, 'questions', q.id), q);
          }
          for (const p of DEFAULT_PACKAGES) {
            await setDoc(doc(db, 'locks', p.id), { packageId: p.id, isPremium: p.isPremium || false });
          }
        }
      } catch (err) {
        console.warn('Silent fallback: Not yet configured or seed failed or read limits reached:', err);
      }

      // Realtime listeners
      try {
        const unsubPkgs = onSnapshot(collection(db, 'packages'), (snap) => {
          const list: ExamPackage[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as ExamPackage));
          if (list.length > 0) {
            setPackages(list);
            localStorage.setItem('katakita_packages', JSON.stringify(list));
          }
        });

        const unsubQs = onSnapshot(collection(db, 'questions'), (snap) => {
          const list: Question[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as Question));
          if (list.length > 0) {
            setQuestions(list);
            localStorage.setItem('katakita_questions', JSON.stringify(list));
          }
        });

        const unsubLocks = onSnapshot(collection(db, 'locks'), (snap) => {
          const list: { [key: string]: boolean } = {};
          snap.forEach(docSnap => {
            const d = docSnap.data();
            list[d.packageId] = d.isPremium;
          });
          setLocks(prev => ({ ...prev, ...list }));
          localStorage.setItem('katakita_subtest_locks', JSON.stringify(list));
        });

        const unsubAttempts = onSnapshot(collection(db, 'attempts'), (snap) => {
          const list: StudentAttempt[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as StudentAttempt));
          list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          setAttempts(list);
          localStorage.setItem('katakita_student_attempts', JSON.stringify(list));
        });

        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
          const list: UserRegistry[] = [];
          snap.forEach(docSnap => list.push(docSnap.data() as UserRegistry));
          setStudentUsers(list);
          localStorage.setItem('katakita_users', JSON.stringify(list));
        });

        return () => {
          unsubPkgs();
          unsubQs();
          unsubLocks();
          unsubAttempts();
          unsubUsers();
        };
      } catch (subErr) {
        console.error('Snapshot listener subscription error:', subErr);
      }
    };

    let unsubscriberPromise = initializeAndSubscribe();
    return () => {
      unsubscriberPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

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
  const handleToggleLock = async (packageId: string) => {
    const nextVal = !locks[packageId];
    setLocks((prev) => ({
      ...prev,
      [packageId]: nextVal
    }));
    try {
      await setDoc(doc(db, 'locks', packageId), { packageId, isPremium: nextVal });
    } catch (err) {
      console.error("Failed to update lock on Firestore:", err);
    }
  };

  // Submit test scoring
  const handleExamSubmit = async (newAttempt: Omit<StudentAttempt, 'id'>) => {
    const completedAttempt: StudentAttempt = {
      ...newAttempt,
      id: `ATTEMPT-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setAttempts((prev) => [completedAttempt, ...prev]);
    setActiveExamId(null);
    setActiveTab('tryouts'); // Shifts view back to dashboard to view results

    // Save directly to Firestore for global access
    try {
      await setDoc(doc(db, 'attempts', completedAttempt.id), completedAttempt);
    } catch (err) {
      console.error("Failed to write student attempt to Firestore:", err);
    }
  };

  // Callback to simulate importing spreadsheet questions (dynamically adds 2 questions)
  const handleImportSpreadsheetQuestions = async () => {
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
        explanation: "Because sebagian pengajar is ASN, and all ASN has to be neutral, then sebagian pengajar is netral."
      }
    ];

    try {
      // 1. Write the questions to Firestore
      for (const q of extraQuestions) {
        await setDoc(doc(db, 'questions', q.id), q);
      }

      setQuestions((prev) => {
        const exists = prev.some(q => q.id === "Q-SHEET-01");
        if (exists) return prev;
        return [...prev, ...extraQuestions];
      });

      // 2. Adjust package total questions and write updated packages to Firestore
      const pkgsToUpdate = packages.map(p => {
        if (p.id === "PKG-UTBK" || p.id === "PKG-CPNS") {
          return { ...p, totalQuestions: p.totalQuestions + 1 };
        }
        return p;
      });

      for (const p of pkgsToUpdate) {
        await setDoc(doc(db, 'packages', p.id), p);
      }

      setPackages(pkgsToUpdate);
    } catch (err) {
      console.error("Firestore error importing spreadsheet questions:", err);
    }
  };
  const handleAddCustomQuestion = async (newQ: Question) => {
    try {
      // 1. Save question to Firestore
      await setDoc(doc(db, 'questions', newQ.id), newQ);

      // 2. Update package count in Firestore
      const targetPkg = packages.find(p => p.id === newQ.examId);
      if (targetPkg) {
        const updatedPkg = { ...targetPkg, totalQuestions: targetPkg.totalQuestions + 1 };
        await setDoc(doc(db, 'packages', targetPkg.id), updatedPkg);
      }
    } catch (err) {
      console.error("Firestore error adding custom question:", err);
    }
  };

  const handleSetPackagesByAdmin = async (newPackages: React.SetStateAction<ExamPackage[]>) => {
    const resolvedPackages = typeof newPackages === 'function' ? newPackages(packages) : newPackages;
    setPackages(resolvedPackages);
    try {
      for (const p of resolvedPackages) {
        await setDoc(doc(db, 'packages', p.id), p);
      }
    } catch (err) {
      console.error("Failed to sync packages update to Firestore:", err);
    }
  };

  const handleSetQuestionsByAdmin = async (newQuestions: React.SetStateAction<Question[]>) => {
    const resolvedQuestions = typeof newQuestions === 'function' ? newQuestions(questions) : newQuestions;
    setQuestions(resolvedQuestions);
    try {
      for (const q of resolvedQuestions) {
        await setDoc(doc(db, 'questions', q.id), q);
      }
    } catch (err) {
      console.error("Failed to sync questions update to Firestore:", err);
    }
  };

  const handleSetAttemptsByAdmin = async (newAttempts: React.SetStateAction<StudentAttempt[]>) => {
    const resolvedAttempts = typeof newAttempts === 'function' ? newAttempts(attempts) : newAttempts;
    setAttempts(resolvedAttempts);
    try {
      const existingSnap = await getDocs(collection(db, 'attempts'));
      for (const docSpec of existingSnap.docs) {
        const id = docSpec.id;
        const existsInNew = resolvedAttempts.some(ra => ra.id === id);
        if (!existsInNew) {
          await deleteDoc(doc(db, 'attempts', id));
        }
      }
    } catch (err) {
      console.error("Failed to delete attempts on Firestore:", err);
    }
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
            allAttempts={attempts}
            studentUsers={studentUsers}
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
            setPackages={handleSetPackagesByAdmin}
            locks={locks}
            onToggleLock={handleToggleLock}
            questions={questions}
            setQuestions={handleSetQuestionsByAdmin}
            onAddQuestion={handleAddCustomQuestion}
            onImportMockQuestions={handleImportSpreadsheetQuestions}
            onLogout={handleLogout}
            onStartExam={(id) => {
              setActiveExamId(id);
              setActiveTab('tryouts');
            }}
            attempts={attempts}
            setAttempts={handleSetAttemptsByAdmin}
            studentUsers={studentUsers}
            setStudentUsers={setStudentUsers}
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
