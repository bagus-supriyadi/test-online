import React, { useState } from 'react';
import { ExamPackage, StudentAttempt } from '../types';

interface TryoutDashboardProps {
  packages: ExamPackage[];
  locks: { [packageId: string]: boolean };
  attempts: StudentAttempt[];
  onStartExam: (packageId: string) => void;
  userRole: 'admin' | 'student';
}

// Elegant dark gradients and responsive contrasted pairings to satisfy high readability
const getCategoryTheme = (category: string) => {
  switch (category) {
    case 'UTBK SNBT':
      return {
        cardBg: 'bg-gradient-to-br from-[#0c142c] via-[#101e45] to-[#070b19] border-blue-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-slate-300',
        metaColor: 'text-blue-300',
        metaIcon: 'text-blue-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-blue-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'Kedinasan':
      return {
        cardBg: 'bg-gradient-to-br from-[#1c080a] via-[#321114] to-[#140405] border-rose-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-rose-100/90',
        metaColor: 'text-rose-300',
        metaIcon: 'text-rose-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-rose-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'CPNS':
      return {
        cardBg: 'bg-gradient-to-br from-[#211305] via-[#381f08] to-[#120a02] border-amber-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-amber-100/90',
        metaColor: 'text-amber-300',
        metaIcon: 'text-amber-401',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-amber-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'TNI / Polri':
      return {
        cardBg: 'bg-gradient-to-br from-[#041913] via-[#072c21] to-[#020e0a] border-emerald-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-emerald-100/90',
        metaColor: 'text-emerald-300',
        metaIcon: 'text-emerald-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-emerald-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'BUMN':
      return {
        cardBg: 'bg-gradient-to-br from-[#051121] via-[#0b2447] to-[#020810] border-sky-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-sky-100/90',
        metaColor: 'text-sky-300',
        metaIcon: 'text-sky-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-sky-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'PPPK':
      return {
        cardBg: 'bg-gradient-to-br from-[#1e050f] via-[#350d1d] to-[#100208] border-pink-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-pink-100/90',
        metaColor: 'text-pink-300',
        metaIcon: 'text-pink-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-pink-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'Psikotes':
      return {
        cardBg: 'bg-gradient-to-br from-[#051325] via-[#0c2444] to-[#010812] border-blue-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-slate-300',
        metaColor: 'text-blue-300',
        metaIcon: 'text-blue-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-blue-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'TKA Umum':
      return {
        cardBg: 'bg-gradient-to-br from-[#011400] via-[#042802] to-[#000a00] border-green-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-green-100/90',
        metaColor: 'text-green-300',
        metaIcon: 'text-green-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-green-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'Bahasa Inggris':
      return {
        cardBg: 'bg-gradient-to-br from-[#19091f] via-[#2f133a] to-[#0e0412] border-fuchsia-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-purple-100/90',
        metaColor: 'text-purple-200',
        metaIcon: 'text-fuchsia-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-fuchsia-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'Matematika':
      return {
        cardBg: 'bg-gradient-to-br from-[#0c0521] via-[#160a3d] to-[#060210] border-indigo-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-indigo-100/90',
        metaColor: 'text-indigo-300',
        metaIcon: 'text-indigo-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-indigo-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    case 'Asesmen Nasional':
      return {
        cardBg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] border-slate-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-slate-300',
        metaColor: 'text-slate-400',
        metaIcon: 'text-slate-300',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-slate-205',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
    default:
      return {
        cardBg: 'bg-gradient-to-br from-[#120021] via-[#240042] to-[#08000f] border-purple-500/25 text-white',
        titleColor: 'text-white font-black',
        descColor: 'text-purple-100/90',
        metaColor: 'text-purple-305',
        metaIcon: 'text-purple-400',
        subSectionBg: 'bg-white/5 border-white/5',
        subLabel: 'text-purple-200',
        subBadge: 'text-white bg-white/10 border-white/5'
      };
  }
};

export default function TryoutDashboard({ 
  packages, 
  locks, 
  attempts, 
  onStartExam, 
  userRole 
}: TryoutDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All', 
    'UTBK SNBT', 
    'Kedinasan & CPNS', 
    'TNI / Polri & BUMN', 
    'PPPK & Psikotes', 
    'TKA Umum', 
    'Bahasa Inggris & Matematika', 
    'Asesmen Nasional', 
    'Lainnya'
  ];

  // Filter packages based on Search query & selected Category
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Custom mapping of category tab to object metadata category
    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'UTBK SNBT') {
        matchesCategory = pkg.category === 'UTBK SNBT';
      } else if (selectedCategory === 'Kedinasan & CPNS') {
        matchesCategory = pkg.category === 'Kedinasan' || pkg.category === 'CPNS';
      } else if (selectedCategory === 'TNI / Polri & BUMN') {
        matchesCategory = pkg.category === 'TNI / Polri' || pkg.category === 'BUMN';
      } else if (selectedCategory === 'PPPK & Psikotes') {
        matchesCategory = pkg.category === 'PPPK' || pkg.category === 'Psikotes';
      } else if (selectedCategory === 'TKA Umum') {
        matchesCategory = pkg.category === 'TKA Umum';
      } else if (selectedCategory === 'Bahasa Inggris & Matematika') {
        matchesCategory = pkg.category === 'Bahasa Inggris' || pkg.category === 'Matematika';
      } else if (selectedCategory === 'Asesmen Nasional') {
        matchesCategory = pkg.category === 'Asesmen Nasional';
      } else if (selectedCategory === 'Lainnya') {
        matchesCategory = pkg.category === 'Test/Ujian Lainnya';
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // Check if a package is locked
  const isLocked = (pkg: ExamPackage) => {
    if (locks[pkg.id] !== undefined) {
      return locks[pkg.id];
    }
    return pkg.isPremium || false;
  };

  return (
    <div className="space-y-12 py-6 text-left" id="tryout-dashboard-container">
      
      {/* Upper header action with Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6" id="dashboard-search-bar">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-slate-800">
            <i className="fa-solid fa-graduation-cap text-blue-600 mr-2"></i>
            Portal Ujian Bimbel Kata Kita
          </h2>
          <p className="text-sm text-slate-500 mt-1">Ukur kemampuan Anda secara objektif dengan simulasi standard nasional.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            type="text"
            placeholder="Cari paket tryout..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white shadow-inner"
            id="search-input"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4" id="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
            id={`tab-btn-${cat.replace(/[\s&/]+/g, '-').toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Available Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="packages-mesh">
        {filteredPackages.map((pkg) => {
          const locked = isLocked(pkg);
          const theme = getCategoryTheme(pkg.category);
          
          return (
            <div 
              key={pkg.id} 
              className={`${theme.cardBg} rounded-2xl border p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between space-y-6 group overflow-hidden`}
              id={`package-card-${pkg.id}`}
            >
              {/* Subtle light overlay inside card */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex justify-between items-center bg-transparent">
                  <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-white/10 text-white border border-white/10">
                    <i className="fa-solid fa-folder-open mr-1.5 text-xs text-white"></i>
                    {pkg.category}
                  </span>

                  {/* Lock Indicator */}
                  <div className="flex items-center space-x-1.5 text-xs bg-transparent">
                    {locked ? (
                      <span className="flex items-center space-x-1 text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/25 font-bold">
                        <i className="fa-solid fa-lock text-[10px] mr-1"></i>
                        <span>Premium</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 font-bold">
                        <i className="fa-solid fa-lock-open text-[10px] mr-1"></i>
                        <span>Gratis</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className={`font-display font-extrabold text-xl ${theme.titleColor} leading-tight`}>
                  {pkg.name}
                </h3>

                {/* Description */}
                <p className={`text-xs ${theme.descColor} leading-relaxed font-sans`}>
                  {pkg.description}
                </p>

                {/* Metadata details */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold">
                  <span className={`flex items-center space-x-1.5 ${theme.metaColor}`}>
                    <i className={`fa-regular fa-clock ${theme.metaIcon}`}></i>
                    <span>{pkg.totalDurationMinutes} Menit</span>
                  </span>
                  <span className={`flex items-center space-x-1.5 ${theme.metaColor}`}>
                    <i className={`fa-regular fa-file-lines ${theme.metaIcon}`}></i>
                    <span>{pkg.totalQuestions} Soal Sampel</span>
                  </span>
                </div>

                {/* List of sub tests */}
                <div className={`${theme.subSectionBg} rounded-xl p-3.5 border`}>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${theme.subLabel} mb-2`}>
                    <i className="fa-solid fa-list-check mr-1 text-[9px]"></i> Detail Struktur Ujian:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.subExams.map((sub, i) => (
                      <span key={i} className={`text-[10px] font-bold border px-2.5 py-1 rounded-lg ${theme.subBadge}`}>
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button & Admin Override */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-4">
                {locked && userRole !== 'admin' ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <span className="text-amber-250 leading-snug font-semibold text-center sm:text-left flex items-start space-x-2">
                      <i className="fa-solid fa-triangle-exclamation text-amber-400 mt-0.5" />
                      <span>Paket premium terkunci. Silakan hubungi CS Bimbel Kata Kita untuk membuka akses.</span>
                    </span>
                    <a
                      href="https://wa.me/6285179973232?text=Halo%20Admin%20Bimbel%20Kata%20Kita,%20saya%20tertarik%20membuka%20paket%20tryout%20Premium%20ini."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all hover:scale-105 shrink-0 flex items-center space-x-1 shadow-md shadow-amber-900/10 text-xs"
                    >
                      <span>Beli Akses</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-white/60 leading-none">
                      {locked && userRole === 'admin' && (
                        <span className="text-[10px] text-purple-305 font-extrabold bg-purple-555/20 px-2 py-1 rounded-md uppercase tracking-wider border border-purple-500/20">
                          <i className="fa-solid fa-user-gear mr-1"></i> Admin Override
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onStartExam(pkg.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-900/20 flex items-center space-x-2 transition-transform hover:scale-102 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <i className="fa-solid fa-play"></i>
                      <span>Mulai Tryout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredPackages.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 space-y-2">
            <i className="fa-solid fa-ghost text-slate-350 text-2xl mx-auto block"></i>
            <p className="font-bold">Tidak ada paket tryout yang ditemukan</p>
            <p className="text-xs">Coba cari dengan kata kunci lain atau pilih tab kriteria yang berbeda.</p>
          </div>
        )}
      </div>

      {/* History of Completed Tryouts */}
      {attempts.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 animate-fade-in" id="attempts-history">
          <div className="flex items-center space-x-2.5">
            <i className="fa-solid fa-clock-rotate-left text-blue-600 text-lg"></i>
            <h3 className="font-display font-extrabold text-2xl text-slate-800">Riwayat Nilai Tryout Siswa</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Paket & Tanggal</th>
                  <th className="py-3 px-4 text-center">Durasi Mulai</th>
                  <th className="py-3 px-4 text-center">Tab Melanggar</th>
                  <th className="py-3 px-4 text-center">Benar / Salah</th>
                  <th className="py-3 px-4 text-right">Nilai Akhir (Skala 100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attempts.map((att) => {
                  const pkg = packages.find(p => p.id === att.examId);
                  const formattedDate = new Date(att.startTime).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{pkg ? pkg.name : att.examId}</p>
                        <p className="text-xs text-slate-400 mt-1">{formattedDate}</p>
                      </td>
                      <td className="py-4 px-4 text-center text-xs">
                        {att.status === 'SUBMITTED' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Selesai</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold animate-pulse">Berjalan</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          att.tabSwitchViolations > 0 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {att.tabSwitchViolations} Kali
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs flex justify-center items-center space-x-3 mt-1.5 border-none">
                        <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                          <i className="fa-solid fa-circle-check text-xs"></i>
                          <span>{att.correctCount ?? 0}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-red-500 font-bold">
                          <i className="fa-solid fa-circle-xmark text-xs"></i>
                          <span>{att.incorrectCount ?? 0}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-400 font-bold">
                          <i className="fa-solid fa-circle-minus text-xs"></i>
                          <span>{att.emptyCount ?? 0}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-slate-800 text-lg">
                          {att.finalScore !== undefined ? att.finalScore.toFixed(0) : "0"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
