import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Halo! Saya Tutor AI Kata Kita, asisten belajar pintar virtual Anda. 🎓\n\nSaya siap membantu mendiskusikan trik pengerjaan cepat soal UTBK SNBT, materi logika TIU CPNS, psikotes TNI/Polri, maupun pemecahan rumus matematika dan tata bahasa Inggris. \n\nTanyakan apa saja materi yang sedang Anda pelajari hari ini!",
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const promptSuggestions = [
    "Tips taklukkan Penalaran Kuantitatif UTBK",
    "Trik cepat deret angka logika TIU SKD",
    "Jelaskan strategi penalaran silogisme",
    "Bagaimana menguasai Reading Comprehension Inggris?"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // High quality Indonesian expert response database
  const getPreprogrammedResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('tips') || q.includes('kuantitatif') || q.includes('matematika')) {
      return `### 💡 Strategi Jitu Menguasai Penalaran Kuantitatif UTBK SNBT:
1. **Ubah Cerita Menjadi Matematika:** Cari tahu apa info yang diberikan, dan apa yang ditanyakan. Bangun sistem variabel sederhana (x, y, dst.).
2. **Kuasai Aljabar Dasar:** Operasi pecahan, pemfaktoran kuadrat, dan perbandingan senilai/berbalik nilai adalah menu wajib yang menyumbang 60% soal matematika.
3. **Gunakan Metode Eliminasi & Substitusi Cepat:** Di tryout online Kata Kita, Anda dapat menguji nilai terkecil/terbesar dari kelima pilihan opsi A-E untuk menghemat waktu daripada mencakar rumus panjang.
4. **Hafalkan Rumus Geometri Pokok:** Luas segitiga (1/2 alas * tinggi), lingkaran (pi * r²), persegi panjang, dan teorema Phytagoras seringkali disamarkan dalam bentuk soal bento-boks.`;
    }

    if (q.includes('deret') || q.includes('tiu') || q.includes('angka')) {
      return `### 🔢 Trik Super Cepat Menyelesaikan Soal Deret Angka (TIU CPNS / Psikotes):
* **Analisis Lompatan Angka:** Cek terlebih dahulu beda antar angka yang berdampingan (misal +2, +4, +6). Jika tidak konstan, cek pola **lompat satu** atau **lompat dua** angka.
* **Deret Kuadrat atau Fibonacci:** Selalu waspada dengan susunan angka kuadrat (1, 4, 9, 16, 25) atau pola fibonacci (suku berikut merupakan jumlah dari 2 suku sebelumnya).
* **Kerjakan Dari Belakang:** Jika pola depan terasa sangat membingungkan, bandingkan pola 3 angka paling belakang untuk mendeteksi pengali atau pembagi konstan. Belajar secara santai dan persiapkan konsentrasi tinggi!`;
    }

    if (q.includes('silogisme') || q.includes('penalaran') || q.includes('logika')) {
      return `### 🧠 Panduan Praktis Menjawab Soal Penalaran Logis (Silogisme):
Dalam UTBK maupun TIU Kedinasan, terdapat tiga aturan mutlak menarik kesimpulan:
1. **Modus Ponens:** Jika P maka Q. Ternyata P. Kesimpulan: **Q**.
2. **Modus Tollens:** Jika P maka Q. Ternyata bukan Q. Kesimpulan: **bukan P**.
3. **Silogisme:** Jika P maka Q, dan jika Q maka R. Kesimpulan: **Jika P maka R**.

*Penting:* Jika premis diawali dengan kata 'Semua siswa...', dan premis kedua bernada 'Sebagian siswa...', maka kesimpulan akhirnya **harus selalu** bernada **'Sebagian/Ada...'**. Jangan terjebak membuat generalisasi berlebih!`;
    }

    if (q.includes('comprehension') || q.includes('bahasa inggris') || q.includes('reading') || q.includes('inggris')) {
      return `### 🇬🇧 Strategi Menjawab Soal Reading Comprehension Bahasa Inggris:
1. **Main Idea (Ide Pokok):** Jangan membaca keseluruhan paragraf baris per baris. Fokuslah pada **kalimat pertama** dan **kalimat terakhir** setiap paragraf (teknik Skimming).
2. **Vocabulary in Context (Arti Kata):** Jika ditanyakan arti kata yang sulit, baca kalimat sebelum dan sesudahnya untuk menduga sentimen (apakah bernada positif, negatif, atau netral) agar bisa mengeliminasi opsi salah.
3. **Specific Details / Menurut Teks:** Jalankan teknik *Scanning* dengan mencari kata kunci (angka tahun, nama orang, istilah khusus) langsung menuju lokasi teks agar tidak habis waktu.`;
    }

    return `Menarik sekali pertanyaan Anda tentang **"${query}"**! 

Sebagai siswa berprestasi di **Bimbel Kata Kita**, asahan pemahaman materi secara konsisten merupakan kunci utama kelulusan. 

Tutor menyarankan Anda untuk:
1. Mencoba mengerjakan set pertanyaan interaktif pada subtes bersesuaian di menu **"Portal Tryout"**.
2. Hubungi admin WhatsApp kami (di Beranda) untuk mendapatkan bimbingan tutor tatap muka intensif di Bandar Lampung!

Apakah ada detail spesifik lain terkait soal ujian yang ingin Anda diskusikan lebih mendalam?`;
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Call simulated/real AI response with standard time delay
    setTimeout(() => {
      const responseText = getPreprogrammedResponse(text);
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 text-left font-sans flex flex-col md:flex-row gap-6 animate-fade-in" id="ai-assistant-container">
      
      {/* Suggestions and Preset Prompts Column */}
      <div className="w-full md:w-72 space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="p-2.5 bg-white/10 rounded-xl w-fit">
            <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg">Asisten Edukasi AI</h4>
            <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
              Ditenagai basis logika penalaran guru, asisten virtual ini membantu Anda memahami trik menjawab soal secara cepat, lugas dan taktis.
            </p>
          </div>
        </div>

        {/* Suggestion pills container */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Pertanyaan Populer Siswa:</p>
          <div className="flex flex-col gap-2">
            {promptSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="text-left p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg transition-colors border border-slate-100/50 flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate mr-2">{sug}</span>
                <i className="fa-solid fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 translate-x-[-2px] group-hover:translate-x-0 transition-all shrink-0"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden justify-between">
        
        {/* Header Indicator */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Tutor AI Kata Kita</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              <span>Siaga membantu diskusi pembelajaran</span>
            </p>
          </div>
        </div>

        {/* Scrollable conversation history */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20">
          {messages.map((msg, i) => {
            const isAI = msg.sender === 'ai';
            return (
              <div key={i} className={`flex items-start space-x-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-sm font-sans ${
                  isAI
                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[9px] text-right mt-1 leading-none ${isAI ? 'text-slate-400' : 'text-blue-200'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing simulation view */}
          {isTyping && (
            <div className="flex items-start space-x-2.5 justify-start">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs' shrink-0 mt-1">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 border border-slate-100 flex items-center space-x-1 font-semibold text-slate-400 text-xs shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input box form */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder="Tuliskan pertanyaan materi ujian Anda..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              id="chat-input"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100 hover:shadow transition-transform hover:scale-105 shrink-0 flex items-center justify-center cursor-pointer"
              id="send-chat-btn"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
