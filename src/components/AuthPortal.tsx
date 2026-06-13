import React, { useState, useRef } from 'react';
import { UserRegistry } from '../types';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthPortalProps {
  onLoginSuccess: (user: UserRegistry) => void;
  initialRole?: 'student' | 'admin';
  onClose?: () => void;
}

export default function AuthPortal({ onLoginSuccess, initialRole = 'student', onClose }: AuthPortalProps) {
  const [role, setRole] = useState<'student' | 'admin'>(initialRole);
  const [isRegister, setIsRegister] = useState(false);
  
  // Form values
  const [fullname, setFullname] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryInterest, setCategoryInterest] = useState('UTBK SNBT');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile Photo State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Visibility Eyes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status flags
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tryoutCategories = [
    "UTBK SNBT", "Kedinasan", "CPNS", "TNI / Polri", 
    "BUMN", "PPPK", "Psikotes", "TKA Umum", 
    "Bahasa Inggris (SD, SMP, SMA)", "Matematika (SD, SMP, SMA)", "Test Asesmen Nasional (AN)", "Test/Ujian Lainnya"
  ];

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg('Ukuran file foto terlalu besar! Maksimal batas ukuran adalah 3MB.');
        return;
      }
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setErrorMsg(''); // clear error if any
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        setErrorMsg('Harap masukkan email/username dan kata sandi Anda!');
        setIsSubmitting(false);
        return;
      }

      const emailLower = email.toLowerCase().trim();

      if (role === 'admin') {
        const isDefaultAdmin = (emailLower === 'admin' || emailLower === 'admin@katakita.id') && password === 'admin123';
        
        let registeredAdmin: UserRegistry | undefined = undefined;
        try {
          const q = query(collection(db, 'users'), where('role', '==', 'admin'), where('email', '==', emailLower));
          const snap = await getDocs(q);
          if (!snap.empty) {
            registeredAdmin = snap.docs[0].data() as UserRegistry;
          }
        } catch (err) {
          console.warn("Direct Firestore admin look-up failed, falling back to local registry:", err);
        }

        let savedUsers: UserRegistry[] = [];
        try {
          const raw = localStorage.getItem('katakita_users');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) savedUsers = parsed;
          }
        } catch (jErr) {
          savedUsers = [];
        }

        if (!registeredAdmin) {
          registeredAdmin = savedUsers.find(u => u.role === 'admin' && (u.email.toLowerCase() === emailLower || u.fullname.toLowerCase() === emailLower) && u.password === password);
        }

        if (isDefaultAdmin || (registeredAdmin && registeredAdmin.password === password)) {
          setSuccessMsg('Masuk sebagai Administrator berhasil!');
          const adminUser: UserRegistry = registeredAdmin || {
            id: 'ADMIN-DEFAULT',
            email: 'admin@katakita.id',
            fullname: 'Administrator Pusat',
            role: 'admin'
          };
          setIsSubmitting(false);
          setTimeout(() => {
            onLoginSuccess(adminUser);
          }, 1000);
        } else {
          setErrorMsg('Autentikasi admin gagal! Username atau kata sandi pengajar salah.');
          setIsSubmitting(false);
        }
      } else {
        let matchedUser: UserRegistry | undefined = undefined;

        // Fast check from local real-time copy first
        let savedUsers: UserRegistry[] = [];
        try {
          const raw = localStorage.getItem('katakita_users');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) savedUsers = parsed;
          }
        } catch (jErr) {
          savedUsers = [];
        }

        matchedUser = savedUsers.find(u => u.role === 'student' && u.email.toLowerCase() === emailLower);

        if (!matchedUser) {
          try {
            const q = query(collection(db, 'users'), where('role', '==', 'student'), where('email', '==', emailLower));
            const snap = await getDocs(q);
            if (!snap.empty) {
              matchedUser = snap.docs[0].data() as UserRegistry;
            }
          } catch (err) {
            console.warn("Direct Firestore student look-up failed:", err);
          }
        }

        if (!matchedUser) {
          setErrorMsg('Akun siswa belum terdaftar! Silakan daftarkan akun baru di menu pendaftaran.');
          setIsSubmitting(false);
          return;
        }

        if (matchedUser.password !== password) {
          setErrorMsg('Kata sandi salah! Harap periksa kembali penulisan karakter Anda.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Selamat datang kembali, ${matchedUser.fullname}!`);
        setIsSubmitting(false);
        setTimeout(() => {
          onLoginSuccess(matchedUser);
        }, 1000);
      }
    } catch (gErr: any) {
      console.error("Login submission error:", gErr);
      setErrorMsg(`Kesalahan sistem saat masuk: ${gErr.message || gErr}`);
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!fullname || !school || !email || !phone || !password || !confirmPassword) {
        setErrorMsg('Harap lengkapi semua data pendaftaran, termasuk Asal Sekolah dan Nomor HP/WA Anda!');
        setIsSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak sesuai dengan kata sandi asli!');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Kata sandi harus minimal berpola 6 karakter demi pengamanan data.');
        setIsSubmitting(false);
        return;
      }

      const emailLower = email.toLowerCase().trim();
      
      let savedUsers: UserRegistry[] = [];
      try {
        const raw = localStorage.getItem('katakita_users');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) savedUsers = parsed;
        }
      } catch (ex) {
        savedUsers = [];
      }
      
      // Fast check from local cache & real-time Firestore check
      let isEmailTaken = savedUsers.some(u => u.email.toLowerCase() === emailLower);
      
      try {
        const q = query(collection(db, 'users'), where('email', '==', emailLower));
        const snap = await getDocs(q);
        if (!snap.empty) {
          isEmailTaken = true;
        }
      } catch (err) {
        console.warn("Firestore unique email check error:", err);
      }

      if (isEmailTaken) {
        setErrorMsg('Alamat surel ini sudah terdaftar sebelumnya di sistem kami oleh pengguna lain.');
        setIsSubmitting(false);
        return;
      }

      // Register user with base64 Profile Image!
      const newUser: UserRegistry = {
        id: `USER-${Math.floor(100000 + Math.random() * 900000)}`,
        email: emailLower,
        fullname: fullname.trim(),
        role: 'student', // Always enforce student role for self-registration
        categoryInterest,
        password,
        photoUrl: photoUrl || undefined, // Store the uploaded Base64 image
        phone: phone.trim(),
        school: school.trim()
      };

      // Save to local storage cache snapshot instantly so the app acts offline-first
      const updatedUsers = [...savedUsers, newUser];
      localStorage.setItem('katakita_users', JSON.stringify(updatedUsers));

      // Sync non-blockingly to Firebase Firestore in background to bypass network lagging or iframe sandboxing
      setDoc(doc(db, 'users', newUser.id), newUser).catch((err) => {
        console.warn("Firestore sync will complete in backround / retry offline:", err);
      });

      setSuccessMsg('Daftar Akun Berhasil! Akun pendaftaran Anda telah aktif.');
      setIsSubmitting(false);
      
      // Reset forms
      setFullname('');
      setSchool('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setPhotoUrl('');
      setPhotoName('');
      
      // Log the student in directly to give them instant access!
      setTimeout(() => {
        onLoginSuccess(newUser);
        setIsRegister(false);
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      console.error("Registration error details:", err);
      setErrorMsg(`Terjadi kesalahan sistem saat mendaftar: ${err.message || err}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden font-sans text-left transition-all duration-300 transform hover:scale-[1.005] ring-2 ring-black/5" id="auth-portal-card">
      
      {/* Visual top banner with beautiful, vibrant but premium gradient */}
      <div className="bg-gradient-to-tr from-[#021f3d] via-[#005c4e] to-[#f26419] p-7 text-white text-center space-y-3 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/25 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#10b981]/20 rounded-full blur-2xl"></div>
        
        <img 
          src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
          alt="Logo Bimbel" 
          className="h-14 w-auto mx-auto object-contain bg-white/95 p-1 rounded-full shadow-lg border border-white/20 hover:rotate-6 transition-transform"
        />
        
        <div className="space-y-1">
          <h3 className="font-display font-black text-2xl tracking-tight uppercase text-amber-300">Bimbel Kata Kita</h3>
          <p className="text-[10px] text-slate-100 font-extrabold uppercase tracking-widest bg-black/30 w-fit mx-auto px-2.5 py-0.5 rounded-full">Sistem CBT Terintegrasi & Pengawasan Riil</p>
        </div>
      </div>

      {/* Tabs to select role dynamically */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button
          onClick={() => {
            setRole('student');
            setErrorMsg('');
            setSuccessMsg('');
            setIsRegister(false);
          }}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center justify-center space-x-1 ${
            role === 'student'
              ? 'bg-white text-blue-600 border-blue-600 font-black'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
          id="role-tab-student"
        >
          <i className="fa-solid fa-graduation-cap"></i>
          <span>Portal Siswa</span>
        </button>

        <button
          onClick={() => {
            setRole('admin');
            setErrorMsg('');
            setSuccessMsg('');
            setIsRegister(false);
          }}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center justify-center space-x-1 ${
            role === 'admin'
              ? 'bg-white text-indigo-600 border-indigo-600 font-black'
              : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
          id="role-tab-admin"
        >
          <i className="fa-solid fa-user-shield"></i>
          <span>Akses Admin</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Welcome Text */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-450 font-medium">
            {role === 'student' 
              ? (isRegister ? 'Buat akun Anda sekarang juga' : 'Masuk menggunakan detail pendaftaran Anda')
              : 'Gunakan kredensial pengajar pusat Bimbel'
            }
          </p>
        </div>

        {/* Dynamic Inner Dual Sub-tabs for Student (Makes Registration 100% Discoverable & Clickable) */}
        {role === 'student' && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200" id="student-sub-tabs-container">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-center font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl cursor-pointer ${
                !isRegister
                  ? 'bg-[#00705f] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              id="student-sub-tab-login"
            >
              <i className="fa-solid fa-right-to-bracket mr-1.5"></i>
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-center font-extrabold text-xs uppercase tracking-wider transition-all rounded-xl cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              id="student-sub-tab-register"
            >
              <i className="fa-solid fa-user-plus mr-1.5"></i>
              <span>Daftar Baru</span>
            </button>
          </div>
        )}

        {/* Alerts status */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-xs font-semibold text-red-700 flex items-start space-x-1.5 animate-pulse" id="auth-error-alert">
            <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5 shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-lg text-xs font-semibold text-emerald-700 flex items-start space-x-1.5" id="auth-success-alert">
            <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Frame panels */}
        {!isRegister ? (
          /* ================= MODERN LOGIN PANEL ================= */
          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-envelope text-slate-400"></i>
                <span>Alamat Email:</span>
              </label>
              <input
                type={role === 'admin' ? "text" : "email"}
                placeholder={role === 'admin' ? "Username admin" : "nama.siswa@gamil.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 shadow-inner"
                required
              />
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center bg-transparent">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <i className="fa-solid fa-lock text-slate-400"></i>
                  <span>Kata Sandi:</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 shadow-inner"
                  required
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center space-x-2 ${
                role === 'admin' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/15' 
                  : 'bg-[#00705f] hover:bg-[#005a4d] shadow-teal-900/15'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket text-xs"></i>
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ================= REGISTER PANEL (Siswa with Profile Picture Support!) ================= */
          <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
            
            {/* 📸 INTERACTIVE PHOTO ACQUISITION COMPONENT */}
            <div className="flex flex-col items-center justify-center space-y-3 py-3 bg-gradient-to-tr from-slate-50 to-slate-100/70 border border-slate-150 rounded-2xl p-4 text-center shadow-inner" id="profile-picture-upload-section">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block font-display">
                FOTO RESMI SISWA (DISARANKAN)
              </span>
              
              <div 
                onClick={isSubmitting ? undefined : handlePhotoClick}
                className="relative w-24 h-24 rounded-full border-4 border-white ring-4 ring-orange-500/20 hover:ring-orange-500/40 bg-white flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all shadow-md"
                title="Pilih file foto dari perangkat Anda"
              >
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Preview Foto" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-1 text-slate-400">
                    <i className="fa-solid fa-cloud-arrow-up text-xl text-orange-500 group-hover:scale-110 transition-transform"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">Unggah Foto</span>
                  </div>
                )}
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[8px] font-black uppercase tracking-wide">
                    Ubah Foto
                  </div>
                )}
              </div>

              <input 
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                disabled={isSubmitting}
                className="hidden"
              />

              {photoName ? (
                <span className="text-[9px] text-emerald-600 font-bold truncate max-w-[220px]" title={photoName}>
                  <i className="fa-solid fa-circle-check mr-1 animate-pulse"></i> {photoName}
                </span>
              ) : (
                <span className="text-[8px] text-slate-450 font-medium uppercase tracking-wide">
                  Format JPG, PNG Maksimal Batas 3MB
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-user text-slate-400"></i>
                <span>Nama Lengkap Anda:</span>
              </label>
              <input
                type="text"
                placeholder="Nama Lengkap Berdasarkan Ijazah/Identitas"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-school text-slate-400"></i>
                <span>Asal Sekolah:</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: SMAN 1 Jakarta"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-phone text-slate-400 font-bold"></i>
                <span>No. HP / WhatsApp:</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-envelope text-slate-400"></i>
                <span>Alamat Surel (Email):</span>
              </label>
              <input
                type="email"
                placeholder="kontak@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-lock text-slate-400"></i>
                <span>Sandi Akun:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <i className="fa-solid fa-check text-slate-400"></i>
                <span>Konfirmasi Sandi:</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none bg-slate-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 bg-gradient-to-r from-[#00705f] via-[#005a4d] to-orange-500 hover:opacity-95 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-900/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
                  <span>Sedang Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus text-xs"></i>
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer toggles */}
        {role === 'student' && (
          <div className="text-center pt-2 text-xs border-t border-slate-100">
            {!isRegister ? (
              <p className="text-slate-500">
                Belum mendaftarkan akun siswa?{' '}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`text-blue-600 hover:underline font-extrabold cursor-pointer inline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Daftar Akun Baru
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                Sudah memiliki akun pendaftaran?{' '}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`text-blue-600 hover:underline font-extrabold cursor-pointer inline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Masuk Sekarang
                </button>
              </p>
            )}
          </div>
        )}

        {role === 'admin' && (
          <div className="text-center pt-3 text-[10px] text-slate-400 leading-relaxed font-bold italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
            <i className="fa-solid fa-circle-info mr-1.5 text-slate-400"></i>
            <span>Gunakan kredensial admin kantor pusat untuk masuk ke Panel Kontrol.</span>
          </div>
        )}
      </div>
    </div>
  );
}
