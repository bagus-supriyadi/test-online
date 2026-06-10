import React from 'react';

interface HomeProps {
  onStartTryout: () => void;
  onSelectCategory: (category: string) => void;
}

export default function Home({ onStartTryout, onSelectCategory }: HomeProps) {
  const waGroupLink = "https://chat.whatsapp.com/K8thJWTEXZk1lOu0OveVel";

  // 12 bento cards data matching Image 2 with fixed colors and clean icons
  const examsGrid = [
    { 
      no: "01", 
      title: "UTBK SNBT", 
      desc: "7 Sub-Tes, 195 Menit, 160 Soal", 
      bullet: "fa-solid fa-graduation-cap",
      bgClass: "from-purple-600 via-indigo-600 to-indigo-800" 
    },
    { 
      no: "02", 
      title: "Kedinasan", 
      desc: "SKD Terpadu: TWK-TIU-TKP", 
      bullet: "fa-solid fa-building-columns",
      bgClass: "from-red-600 to-rose-600" 
    },
    { 
      no: "03", 
      title: "CPNS", 
      desc: "SKD Terpadu: TWK-TIU-TKP", 
      bullet: "fa-solid fa-user-tie",
      bgClass: "from-amber-500 to-orange-550" 
    },
    { 
      no: "04", 
      title: "TNI / Polri", 
      desc: "Akademik & Kebangsaan", 
      bullet: "fa-solid fa-shield-halved",
      bgClass: "from-teal-600 to-emerald-700" 
    },
    { 
      no: "05", 
      title: "BUMN", 
      desc: "TKD & Core Values AKHLAK", 
      bullet: "fa-solid fa-briefcase",
      bgClass: "from-indigo-600 via-purple-600 to-pink-600" 
    },
    { 
      no: "06", 
      title: "PPPK", 
      desc: "Asesmen Kompetensi Teknis", 
      bullet: "fa-solid fa-id-card-clip",
      bgClass: "from-pink-600 to-rose-700" 
    },
    { 
      no: "07", 
      title: "Psikotes", 
      desc: "Kognitif & Kepribadian", 
      bullet: "fa-solid fa-brain",
      bgClass: "from-sky-500 to-blue-600" 
    },
    { 
      no: "08", 
      title: "TKA Umum", 
      desc: "SD, SMP, SMA Semua Mapel", 
      bullet: "fa-solid fa-book-bookmark",
      bgClass: "from-emerald-500 to-green-600" 
    },
    { 
      no: "09", 
      title: "Bahasa Inggris (SD, SMP, SMA)", 
      desc: "Grammar, Reading, Structure", 
      bullet: "fa-solid fa-language",
      bgClass: "from-rose-500 via-pink-500 to-pink-700" 
    },
    { 
      no: "10", 
      title: "Matematika (SD, SMP, SMA)", 
      desc: "Aljabar, Logika & Analitis", 
      bullet: "fa-solid fa-calculator",
      bgClass: "from-blue-600 via-indigo-600 to-indigo-800" 
    },
    { 
      no: "11", 
      title: "Test Asesmen Nasional (AN)", 
      desc: "AKM, Survei Karakter & Lingkungan", 
      bullet: "fa-solid fa-award",
      bgClass: "from-slate-700 to-slate-900" 
    },
    { 
      no: "12", 
      title: "Test/Ujian Lainnya", 
      desc: "Tryout Ujian Saringan Masuk Lainnya", 
      bullet: "fa-solid fa-plus-minus",
      bgClass: "from-purple-700 via-indigo-800 to-indigo-950" 
    }
  ];

  const handleLearnMore = () => {
    const el = document.getElementById('profil-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-20 py-4" id="home-view-container">
      
      {/* 1. HERO SECTION (Image 1 Implementation) */}
      <section className="relative" id="hero-section">
        {/* Main Banner styled text and gradients from Image 1 */}
        <div className="bg-gradient-to-r from-[#031d44] via-[#053066] to-[#041a35] text-white p-8 sm:p-12 md:p-16 rounded-3xl relative overflow-hidden shadow-2xl">
          {/* Subtle light visual gradient elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-505/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headings & Subtitles */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6 text-left">
              {/* Special Badge from Image 1 */}
              <div className="inline-flex items-center bg-black/40 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-white tracking-wide shadow-sm" id="hero-badge">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2 shrink-0 animate-pulse"></span>
                <span>Pusat Simulasi Ujian CAT Terupdate, Akurat, & Terbukti Meloloskan Ribuan Peserta ke PTN Impian, CPNS, & Kedinasan!</span>
              </div>

              {/* Exact Main Text Heading from Image 1 */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight" id="hero-title">
                {localStorage.getItem('katakita_settings_banner') || (
                  <>
                    Jangan Cuma Bermimpi, <span className="text-orange-400">Garansi Sukses Sekali Tes!</span> Taklukkan UTBK, CPNS, & Kedinasan Bersama Bimbel Kata Kita
                  </>
                )}
              </h1>

              {/* Exact Description text from Image 1 */}
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-sans max-w-2xl font-semibold" id="hero-description">
                {localStorage.getItem('katakita_settings_slogan') || "Satu-satunya sistem Computer Assisted Test (CAT) dengan akurasi prediksi kisi-kisi hingga 99.8%! Pecahkan rekor kelulusan Anda melalui simulasi Tryout Akbar berstandar nasional. Dilengkapi pendeteksi kecurangan real-time yang ketat, pembahasan detail super mendalam, bimbingan langsung mentor andalan, didukung atmosfer ruang belajar super nyaman!"}
              </p>

              {/* Action buttons from Image 1 */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  id="btn-hero-start-exam"
                  onClick={onStartTryout}
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-950/20 hover:scale-103 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer text-xs sm:text-sm shadow-orange-500/20"
                >
                  <span>Mulai Ujian Sekarang</span>
                  <i className="fa-solid fa-play text-xs"></i>
                </button>

                <a
                  id="btn-hero-learn-more"
                  href={waGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/20 hover:scale-103 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer text-xs sm:text-sm shadow-emerald-650/20"
                >
                  <span>Gabung Ke Grup WA</span>
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                </a>
              </div>
            </div>

            {/* Right Column: Keunggulan Sistem Card from Image 1 */}
            <div className="lg:col-span-12 xl:col-span-5 w-full relative space-y-4 animate-fade-in" id="hero-feature-card">
              {/* Dynamic Accreditation Badge on Top Right */}
              <div className="absolute -top-3.5 -right-2 bg-orange-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-xl tracking-wider shadow-lg shadow-orange-900/30 rotate-3 z-30">
                Akreditasi Nasional
              </div>

              {/* Unique Tryout Akbar Live Action Image with Official Logo Overlay */}
              <div className="relative group overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl bg-slate-900/40 transition-all duration-300">
                <img 
                  src="/src/assets/images/tryout_akbar_live_action_1781063573763.png"
                  alt="Suasana Pelaksanaan Tryout Akbar Nyaman & Kondusif"
                  className="w-full h-auto object-cover rounded-xl group-hover:scale-103 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Embedded Official Logo Brand Header Overlay (using their exact logo url) */}
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center space-x-2 shadow-lg z-20 max-w-[210px] sm:max-w-xs">
                  <img 
                    src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
                    alt="Logo Resmi Bimbel Kata Kita" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-white rounded-full p-0.5 border border-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <h4 className="text-[9px] sm:text-[10px] font-black text-amber-300 uppercase tracking-tight leading-none">
                      Bimbel Kata Kita
                    </h4>
                    <span className="text-[7px] sm:text-[8px] text-white font-bold leading-tight block mt-0.5">
                      Pelaksanaan Tryout Akbar
                    </span>
                  </div>
                </div>

                {/* Ambient dynamic caption with details at bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-4 pt-12 text-left">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[8.5px] uppercase mb-1 bg-black/60 px-2.5 py-0.5 rounded w-fit">
                    <i className="fa-solid fa-graduation-cap text-[9px] animate-pulse"></i>
                    <span>Siswa-Siswi Usia 16-18 Tahun</span>
                  </div>
                  <p className="text-[10.5px] text-slate-100 font-semibold leading-normal text-left">
                    Suasana nyaman & tertib di gedung serbaguna berfasilitas lengkap. Didukung tryout berkala, soal kisi-kisi akurat, dan bimbingan tutor andal.
                  </p>
                </div>
              </div>

              {/* Glassmorphic premium features card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl text-left" id="advantages-glass-plate">
                <div className="grid grid-cols-3 gap-3">
                  {/* Item 1 */}
                  <div className="flex items-center space-x-2 border-r border-white/10 pr-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-award text-xs"></i>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-350 font-black block uppercase tracking-wide">LULUS</span>
                      <span className="text-[10px] font-black text-white">92.4%</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center space-x-2 border-r border-white/10 pr-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-circle-check text-xs"></i>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-350 font-black block uppercase tracking-wide">KISI-KISI</span>
                      <span className="text-[10px] font-black text-white">100%</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-shield-halved text-xs"></i>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-350 font-black block uppercase tracking-wide">SISTEM</span>
                      <span className="text-[10px] font-black text-white">Anti-Cheat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PROFIL BIMBEL KATA KITA */}
      <section className="space-y-10 py-4 text-center max-w-7xl mx-auto" id="profil-section">
        <div className="space-y-3">
          <p className="text-xs text-blue-650 font-black uppercase tracking-widest">Profil Bimbel Kata Kita</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">Mengapa Memilih Bimbel Kami?</h2>
          <p className="text-slate-500 max-w-4xl mx-auto text-xs sm:text-sm leading-relaxed font-sans">
            BIMBEL KATA KITA adalah lembaga bimbingan belajar profesional terkemuka yang berfokus pada pendampingan calon pelamar kerja aparatur negara, taruna kedinasan, taruna militer/kepolisian, serta para pejuang UTBK perguruan tinggi negeri. Kami mengintegrasikan metode pembelajaran praktis dengan platform digital tercanggih.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 text-left hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <h3 className="font-display font-black text-slate-800 text-lg">Paket Ujian Komprehensif</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Tersedia 11 kategori paket ujian standar tertinggi untuk memastikan penguasaan komprehensif pada setiap sub-tes secara berkala.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 text-left hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-desktop"></i>
            </div>
            <h3 className="font-display font-black text-slate-800 text-lg">Simulasi Kondisi Riil (CBT)</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Dilengkapi pembagian waktu sub-ujian dan sistem pengawasan ketat seperti pendeteksi keluar-tab yang melatih kesiapan mental serta fokus peserta.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-4 text-left hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3 className="font-display font-black text-slate-800 text-lg">Analisis Kinerja Detil</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Mendapatkan pembahasan mendetail, saran kelemahan dan kekuatan, serta ranking pengerjaan langsung setelah menaruh jawaban untuk dipelajari kembali.
            </p>
          </div>
        </div>
      </section>

      {/* 3. VISI & MISI BANNER */}
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-8 shadow-lg max-w-7xl mx-auto relative overflow-hidden" id="visi-misi-section">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>

        <div className="space-y-2">
          <p className="text-xs text-orange-400 font-extrabold uppercase tracking-widest">Visi & Misi Kami</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl">Komitmen Mendidik Bangsa</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
          {/* Visi */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10 text-left space-y-4">
            <h3 className="font-display font-bold text-lg text-orange-400 flex items-center gap-2">
              <i className="fa-solid fa-eye text-orange-400"></i>
              <span>VISI</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              Menjadi lembaga bimbingan belajar berbasis inovasi digital yang terpercaya untuk melahirkan sumber daya manusia unggul yang cakap lolos saringan tes standar nasional, berdaya saing global, dan berkarakter akhlak mulia.
            </p>
          </div>

          {/* Misi */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/10 text-left space-y-4">
            <h3 className="font-display font-bold text-lg text-orange-400 flex items-center gap-2">
              <i className="fa-solid fa-bullseye text-orange-400"></i>
              <span>MISI</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-200 font-sans">
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 mr-2 shrink-0"></i>
                <span>Menyelenggarakan simulasi uji coba berbasis website yang andal dan selaras dengan regulasi pemerintah.</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 mr-2 shrink-0"></i>
                <span>Menyediakan bank soal yang progresif dengan relevansi kisi-kisi terakurat.</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 mr-2 shrink-0"></i>
                <span>Melatih kemandirian dan kesiapan mental belajar siswa melalui sistem kontrol ujian berintegritas tinggi.</span>
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 mr-2 shrink-0"></i>
                <span>Mendedikasikan pelayanan bimbingan bermutu optimal dengan harga yang inklusif untuk seluruh wilayah Nusantara.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. KATEGORI LAYANAN / BENTO GRID (Image 2 Implementation) */}
      <section className="space-y-8 py-4 max-w-7xl mx-auto text-center" id="service-categories-section">
        <div className="space-y-3">
          <p className="text-xs text-orange-600 font-extrabold uppercase tracking-widest">KATEGORI LAYANAN</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">Lebih dari 10 Pilihan Paket Ujian Premium</h2>
          <p className="text-slate-500 max-w-3xl mx-auto text-xs sm:text-sm leading-relaxed">
            Seluruh kategori di bawah dirancang secara detail dengan visualisasi dinamis. Warna degradasi mencolok yang bervariasi membantu Anda menavigasi fokus ke setiap sektor akademis secara optimal.
          </p>
        </div>

        {/* 12 colorful bento cards looping cleanly with NO transparent/white typo grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6 text-left" id="categories-gradient-mesh">
          {examsGrid.map((exam, i) => (
            <button
              key={i}
              onClick={() => onSelectCategory(exam.title)}
              className={`bg-gradient-to-br ${exam.bgClass} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-104 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden group`}
              id={`home-exam-card-${exam.no}`}
            >
              {/* Overlay highlight */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex justify-between items-start w-full">
                <span className="text-[9px] font-extrabold tracking-widest bg-white/20 px-2.5 py-1 rounded-lg uppercase">
                  PAKET {exam.no}
                </span>
                <span className="text-white/40 group-hover:text-white/90 transition-colors text-xs">
                  <i className="fa-solid fa-sparkles"></i>
                </span>
              </div>

              <div className="space-y-3 w-full">
                <div className="flex items-center space-x-2">
                  <i className={`${exam.bullet} text-white/80 text-sm`}></i>
                  <h4 className="font-display font-black text-base sm:text-lg tracking-tight leading-tight">
                    {exam.title}
                  </h4>
                </div>
                {/* Fixed "S8 " prefix to use checklist icon directly instead of text artifacts */}
                <div className="text-[10px] font-bold py-1 px-2.5 bg-black/20 text-white rounded-lg flex items-center space-x-1.5 w-fit">
                  <i className="fa-solid fa-list-check text-orange-300 text-[10px]"></i>
                  <span>{exam.desc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action callout banner beneath categories */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto mt-8">
          <div className="text-left space-y-1">
            <h4 className="font-display font-black text-slate-800 text-sm">Siap untuk menguji kesiapan Anda?</h4>
            <p className="text-xs text-slate-500">Gunakan akun simulasi siswa dan rasakan sistem ujian berintegritas tinggi Bimbel Kata Kita.</p>
          </div>
          <button
            onClick={onStartTryout}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center space-x-1"
          >
            <span>Mulai Sekarang</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </section>

      {/* 5. BRAND FOOTER (Image 3 Implementation) */}
      <footer className="bg-[#0b172a] rounded-3xl text-slate-350 p-8 sm:p-12 space-y-12 shadow-2xl max-w-7xl mx-auto font-sans text-left" id="home-official-footer">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Logo & Slogan Column */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <div className="flex items-center space-x-3">
              <img 
                src="https://bagus-supriyadi.biz.id/uploads/logo-bimbel-kata-kita-utbk-snbt.png" 
                alt="Logo Bimbel Kata Kita" 
                className="h-14 w-auto object-contain bg-white/95 p-1 rounded-full shadow-lg"
              />
              <div className="flex flex-col text-left">
                <span className="font-display font-black text-white text-lg tracking-tight leading-none">BIMBEL KATA KITA</span>
                <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest mt-1.5 leading-none">TRYOUT ONLINE NASIONAL</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Lembaga bimbingan belajar profesional pionir platform simulasi computer-assisted test (CBT) berintegritas tinggi dengan bank soal ujian terpadu terlengkap dan tervalidasi nasional.
            </p>

            <p className="text-xs text-slate-400 italic">
              Mitra Utama Sukses Akademis & Karir Abdi Negara
            </p>
          </div>

          {/* Official Contacts Column */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <h4 className="font-display font-black text-white text-xs tracking-wider uppercase border-b border-white/10 pb-2">
              KONTAK RESMI
            </h4>
            
            <ul className="space-y-5 text-xs">
              <li className="flex items-start text-xs leading-relaxed">
                <i className="fa-solid fa-map-location-dot text-orange-400 text-sm mt-0.5 mr-2 shrink-0"></i>
                <div>
                  <strong className="text-white block mb-0.5 text-xs">ALAMAT KANTOR</strong>
                  <span className="text-slate-300">Belakang Welau Kaos Lampung, Jl. Wolter Monginsidi Gg. H. Musa, Kelurahan Pengajaran, Kec. Tlk. Betung Utara, Kota Bandar Lampung, Lampung 35215</span>
                </div>
              </li>

              <li className="flex items-start text-xs">
                <i className="fa-solid fa-phone text-orange-400 text-sm mt-0.5 mr-2 shrink-0"></i>
                <div>
                  <strong className="text-white block mb-1 text-xs">Hubungi atau WhatsApp</strong>
                  <div className="text-slate-300 space-y-1 font-mono text-xs flex flex-col">
                    <a href="tel:085179973232" className="hover:text-orange-400 hover:underline transition-colors">0851-7997-3232</a>
                    <a href="tel:083151572671" className="hover:text-orange-400 hover:underline transition-colors">0831-5157-2671</a>
                  </div>
                </div>
              </li>

              <li className="flex items-start text-xs">
                <i className="fa-solid fa-envelope text-orange-400 text-sm mt-0.5 mr-2 shrink-0"></i>
                <div>
                  <strong className="text-white block mb-0.5 text-xs">Surel Resmi</strong>
                  <a href="mailto:belajar.katakita@gmail.com" className="text-blue-400 hover:text-orange-400 hover:underline">
                    belajar.katakita@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start text-xs">
                <i className="fa-solid fa-globe text-orange-400 text-sm mt-0.5 mr-2 shrink-0"></i>
                <div>
                  <strong className="text-white block mb-0.5 text-xs">Portal Website Resmi</strong>
                  <a href="https://katakita-group.biz.id/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-orange-450 hover:underline leading-relaxed block">
                    https://katakita-group.biz.id/
                  </a>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    WEBSITE PENGEMBANG <br />
                    <span className="text-slate-400">website : </span>
                    <a href="https://bagus-supriyadi.biz.id/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:underline">
                      https://bagus-supriyadi.biz.id/
                    </a>
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Branch Info and Social icons from Image 3 */}
          <div className="lg:col-span-3 space-y-6 text-left">
            <h4 className="font-display font-black text-white text-xs tracking-wider uppercase border-b border-white/10 pb-2">
              KANTOR CABANG (GOOGLE MAPS)
            </h4>

            {/* Branch 1 */}
            <a 
              href="https://maps.google.com/?q=Bimbel+Kata+Kita" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-3 hover:bg-slate-800 hover:border-white/10 transition-all cursor-pointer block"
            >
              <i className="fa-solid fa-location-dot text-rose-500 text-sm mt-0.5"></i>
              <div className="text-left leading-snug">
                <strong className="text-white text-xs block font-bold">Kantor Cabang Utama 1</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Klik untuk rute petunjuk peta</span>
              </div>
            </a>

            {/* Branch 2 */}
            <a 
              href="https://maps.google.com/?q=Bimbel+Kata+Kita" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-3 hover:bg-slate-800 hover:border-white/10 transition-all cursor-pointer block"
            >
              <i className="fa-solid fa-location-dot text-rose-500 text-sm mt-0.5"></i>
              <div className="text-left leading-snug">
                <strong className="text-white text-xs block font-bold">Kantor Cabang Utama 2</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Klik untuk rute petunjuk peta</span>
              </div>
            </a>

            {/* Media Sosial section from Image 3 with tiny colored branding buttons */}
            <div className="space-y-3.5 pt-2">
              <h5 className="font-display font-black text-white text-xs uppercase tracking-wider">
                MEDIA SOSIAL RESMI
              </h5>
              
              {/* Row of tiny colored icons directly based on branding as explicitly requested */}
              <div className="flex flex-wrap gap-2" id="branded-social-logos">
                <a 
                  href="https://www.instagram.com/belajarkatakita/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Instagram Bimbel"
                >
                  <i className="fa-brands fa-instagram text-sm"></i>
                </a>
                <a 
                  href="https://www.instagram.com/smabintangplus_bdl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Instagram Bintang Plus"
                >
                  <i className="fa-brands fa-instagram text-sm"></i>
                </a>
                <a 
                  href="https://www.instagram.com/belajarkatakita/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Instagram Official"
                >
                  <i className="fa-brands fa-instagram text-sm"></i>
                </a>
                <a 
                  href="https://www.facebook.com/belajarkatakita/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Facebook Bimbel"
                >
                  <i className="fa-brands fa-facebook-f text-xs"></i>
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61586034206310" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#3b5998] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Facebook SMA"
                >
                  <i className="fa-brands fa-facebook-f text-xs"></i>
                </a>
                <a 
                  href="https://www.facebook.com/belajarkatakita/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#0e3a8c] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  title="Facebook Group"
                >
                  <i className="fa-brands fa-facebook-f text-xs"></i>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Citation Ribbon from Image 3 */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4" id="footer-ribbon">
          <p className="font-semibold text-slate-400">
            BIMBEL KATA KITA GROUP. Hak Cipta Dilindungi Undang-Undang
          </p>
          <p className="font-bold text-slate-400">
            design by. <span className="text-orange-400">Bagus_Supriyadi</span>
          </p>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:underline hover:text-white">Syarat Ketentuan Layanan</a>
            <span>•</span>
            <a href="#" className="hover:underline hover:text-white">Kebijakan Privasi CBT</a>
          </div>
        </div>

      </footer>
    </div>
  );
}
