import React, { useState } from 'react';
import { UserRegistry } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserRegistry | null;
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { label: 'Beranda', type: 'anchor', target: 'hero-section', iconClass: 'fa-solid fa-house' },
    { label: 'Profil', type: 'anchor', target: 'profil-section', iconClass: 'fa-solid fa-circle-info' },
    { label: 'Visi Misi', type: 'anchor', target: 'visi-misi-section', iconClass: 'fa-solid fa-bullseye' },
    { label: 'Paket Ujian', type: 'anchor', target: 'service-categories-section', iconClass: 'fa-solid fa-file-signature' }
  ];

  const handleItemClick = (item: typeof navigationItems[0]) => {
    if (item.type === 'anchor') {
      setActiveTab('home');
      setTimeout(() => {
        const element = document.getElementById(item.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setActiveTab(item.target);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand text on left */}
          <div className="flex items-center">
            <button 
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="flex items-center space-x-3 cursor-pointer group text-left"
              id="brand-logo-btn"
            >
              <img 
                src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
                alt="Logo Bimbel Kata Kita" 
                className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col text-left">
                <span className="font-display font-black text-slate-800 tracking-tight text-xs sm:text-xs leading-tight uppercase">
                  BIMBEL KATA KITA
                </span>
                <span className="font-sans text-[8px] text-[#00705f] font-extrabold uppercase tracking-wider leading-none">
                  Tryout Online Nasional
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation (Centered) */}
          <div className="hidden md:flex items-center space-x-1 flex-grow justify-center">
            {navigationItems.map((item, idx) => {
              const isActive = (item.type === 'tab' && activeTab === item.target) || 
                               (item.type === 'anchor' && activeTab === 'home' && idx === 0); // fallback simple estimation

              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300 px-1 select-none text-xs font-light">|</span>}
                  <button
                    id={`nav-anchor-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'text-blue-600 bg-blue-50/50' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`${item.iconClass} text-xs`}></i>
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* User Profile / Status on Right side */}
          <div className="hidden md:flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'tryouts')}
                  className="flex items-center space-x-2 hover:bg-white p-1 rounded-lg transition-all text-left cursor-pointer"
                  title="Buka Portal Anda"
                >
                  {currentUser.photoUrl ? (
                    <img 
                      src={currentUser.photoUrl} 
                      alt={currentUser.fullname} 
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#00705f] text-white flex items-center justify-center font-black uppercase text-xs">
                      {currentUser.fullname.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col text-left px-1">
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[100px]" title={currentUser.fullname}>
                      {currentUser.fullname.split(' ')[0]}
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-widest text-[#00705f] flex items-center font-mono">
                      <span>{currentUser.role === 'admin' ? 'Admin' : 'Portal'}</span>
                      <i className="fa-solid fa-arrow-right text-[7px] ml-1"></i>
                    </span>
                  </div>
                </button>
                <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                <button
                  onClick={onLogout}
                  className="p-1 px-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                  title="Keluar"
                >
                  Keluar <i className="fa-solid fa-right-from-bracket ml-0.5"></i>
                </button>
              </div>
            ) : (
              <button
                id="nav-signin-dashboard"
                onClick={() => setActiveTab('auth-student')}
                className="px-4 py-2 bg-[#00705f] hover:bg-[#005a4d] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all hover:scale-103 cursor-pointer flex items-center space-x-1 border border-[#00705f] shadow-sm"
              >
                <i className="fa-solid fa-user-check text-[10px] mr-1"></i>
                <span>Masuk Portal</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              aria-label="Toggle menu"
              id="mobile-menu-btn"
            >
              {isOpen ? <i className="fa-solid fa-xmark text-lg"></i> : <i className="fa-solid fa-bars text-lg"></i>}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu layout */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-3 pt-2 pb-4 space-y-2 shadow-lg text-left" id="mobile-menu">
          {navigationItems.map((item, idx) => (
            <button
              key={idx}
              id={`nav-mob-anchor-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                handleItemClick(item);
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <i className={`${item.iconClass} w-5 text-sm`}></i>
              <span>{item.label}</span>
            </button>
          ))}

          {currentUser && (
            <button
              id="nav-mob-tab-tryouts-active"
              onClick={() => {
                setActiveTab('tryouts');
                setIsOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'tryouts' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <i className="fa-solid fa-square-poll-vertical w-5 text-sm"></i>
              <span>CBT Simulator</span>
            </button>
          )}

          {currentUser && (
            <button
              id="nav-mob-tab-aitutor-active"
              onClick={() => {
                setActiveTab('ai-tutor');
                setIsOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'ai-tutor' ? 'bg-emerald-50 text-emerald-700' : ''
              }`}
            >
              <i className="fa-solid fa-robot w-5 text-sm"></i>
              <span>Tutor AI</span>
            </button>
          )}

          {/* Admin Panel button inside mobile menu */}
          {currentUser?.role === 'admin' && (
            <button
              id="nav-mob-tab-admin-active"
              onClick={() => {
                setActiveTab('admin');
                setIsOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'admin'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-indigo-600 hover:bg-indigo-50/20'
              }`}
            >
              <i className="fa-solid fa-crown w-5"></i>
              <span>Panel Kontrol</span>
            </button>
          )}

          <div className="h-[1px] bg-slate-100 my-2"></div>

          {/* User Profile session button under mobile */}
          <div className="px-3">
            {currentUser ? (
              <div className="space-y-3.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black uppercase text-sm">
                    {currentUser.fullname.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">{currentUser.fullname}</span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{currentUser.role === 'admin' ? 'Admin / Tentor' : 'Siswa'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  <i className="fa-solid fa-right-from-bracket mr-1.5"></i> Keluar Akun
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('auth-student');
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-[#00705f] hover:bg-[#005a4d] text-white font-black rounded-lg text-sm text-center flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Masuk Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
