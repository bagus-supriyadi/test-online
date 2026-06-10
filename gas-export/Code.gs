/**
 * ==========================================
 * BACKEND ENGINE: GOOGLE APPS SCRIPT (CBT)
 * ==========================================
 * Nama File: Code.gs
 * Tempatkan file ini dengan nama "Code.gs" di Google Apps Script editor Anda.
 * 
 * PENTING:
 * - Jika Anda membuat script ini melalui "Ekstensi -> Apps Script" dari dalam Google Spreadsheet (Bound Script),
 *   Anda tidak perlu mengubah SPREADSHEET_ID di bawah ini.
 * - Jika Anda membuat script ini secara mandiri (Standalone Script di script.google.com),
 *   ganti SPREADSHEET_ID dengan ID Google Spreadsheet Anda yang baru. (Ambil dari URL Spreadsheet).
 */

const SPREADSHEET_ID = '13aDT1vc6yobzGlBKrfPDlXeoh2QEZNiIcfaKtpr6kPY';

/**
 * Pembersih ID Spreadsheet otomatis jika pengguna tidak sengaja memasukkan URL lengkap
 */
function getCleanSpreadsheetId(idOrUrl) {
  if (!idOrUrl) return '';
  const match = idOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return idOrUrl.trim();
}

/**
 * Endpoint Utama Aplikasi Web GAS
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('KataKita CBT - Web Portal')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Mengakses Google Spreadsheet Utama dengan Proteksi Error Mandiri.
 * Fungsi ini otomatis mendeteksi jika script dijalankan melekat pada Spreadsheet (Container-Bound)
 * atau secara mandiri (Standalone) agar bebas dari error izin akses silang.
 */
function getSpreadsheet() {
  // 1. Prioritas Utama: Jika ini Script Melekat (Container-Bound), selalu gunakan Active Spreadsheet!
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId()) {
      return active;
    }
  } catch (e) {
    // Bukan container-bound, kita lanjut ke mode standalone di bawah
  }

  // 2. Mode Standalone: Gunakan SPREADSHEET_ID yang ditulis pengguna
  const cleanId = getCleanSpreadsheetId(SPREADSHEET_ID);
  if (cleanId === 'MASUKKAN_ID_SPREADSHEET_ANDA_DISINI' || !cleanId) {
    throw new Error('Script Standalone terdeteksi! Anda harus mengisi SPREADSHEET_ID di baris ke-15 file Code.gs dengan ID Spreadsheet Anda agar database dapat terhubung.');
  }
  try {
    return SpreadsheetApp.openById(cleanId);
  } catch (e) {
    throw new Error('Gagal membuka Spreadsheet ID: "' + cleanId + '". Pastikan ID tersebut benar dan akun Google Anda sudah memiliki hak akses edit ke spreadsheet ini.');
  }
}

/**
 * Inisialisasi Struktur Tabel Ke Google Sheet (Database Setup)
 * Silakan JALANKAN fungsi ini sekali di editor Apps Script sebelum membuka aplikasi web.
 */
function initSpreadsheet() {
  try {
    const ss = getSpreadsheet();
    
    // 1. Sheet Users
    let sheetUsers = ss.getSheetByName('users');
    if (!sheetUsers) {
      sheetUsers = ss.insertSheet('users');
      sheetUsers.appendRow(['id', 'email', 'password', 'fullname', 'role', 'school', 'whatsapp', 'photo']);
      // Masukkan admin default
      sheetUsers.appendRow([
        'ADMIN-DEFAULT', 
        'admin@katakita.id', 
        'admin123', 
        'Administrator Pusat', 
        'admin', 
        'Yayasan KataKita', 
        '081234567890', 
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80'
      ]);
    }

    // 2. Sheet Packages
    let sheetPackages = ss.getSheetByName('packages');
    if (!sheetPackages) {
      sheetPackages = ss.insertSheet('packages');
      sheetPackages.appendRow(['id', 'title', 'examType', 'isLocked', 'duration']);
      // Seed default packages
      const defaultPackages = [
        ['SUB-01', 'SUB-UJIAN 1: VERBAL & ANALOGI', 'CAT', 'FALSE', '15'],
        ['SUB-02', 'SUB-UJIAN 2: LOGIKA NUMERIK & ARITMATIKA', 'CBT', 'TRUE', '20'],
        ['SUB-03', 'SUB-UJIAN 3: TES KEPRIBADIAN AKBAR (TKP)', 'CAT', 'TRUE', '30'],
        ['SUB-04', 'SUB-UJIAN 4: PEMANTAPAN WAWASAN KEBANGSAAN (TWK)', 'CBT', 'TRUE', '35']
      ];
      defaultPackages.forEach(row => sheetPackages.appendRow(row));
    }

    // 3. Sheet Questions
    let sheetQuestions = ss.getSheetByName('questions');
    if (!sheetQuestions) {
      sheetQuestions = ss.insertSheet('questions');
      sheetQuestions.appendRow(['id', 'packageId', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation']);
      
      // Seed default questions
      const defaultQuestions = [
        [
          'Q-1001', 'SUB-01', 
          'Manakah kata yang merupakan ANALOGI dari: API : PANAS?', 
          'Es : Dingin', 'Angin : Ribut', 'Air : Basah', 'Kayu : Kering', 
          'A', 
          'Pembahasan: Api memiliki sifat dasar panas, analoginya Es memiliki sifat dasar dingin.'
        ],
        [
          'Q-1002', 'SUB-01', 
          'Sinonim dari kata "KOLABORASI" adalah...', 
          'Pertikaian', 'Persaingan', 'Kerja Sama', 'Perpecahan', 
          'C', 
          'Pembahasan: Kolaborasi artinya kerja sama untuk menyelesaikan sebuah projek/pekerjaan.'
        ],
        [
          'Q-2001', 'SUB-02', 
          'Selesaikan deret angka berikut: 2, 4, 8, 16, ...', 
          '24', '32', '40', '48', 
          'B', 
          'Pembahasan: Deret dikalikan 2 pada setiap suku berikutnya. Suku selanjutnya adalah 16 * 2 = 32.'
        ],
        [
          'Q-3001', 'SUB-03', 
          'Jika rekan kerja Anda kesulitan menyelesaikan tugas di hari libur, sikap Anda adalah...', 
          'Acuh tak acuh karena hari libur', 
          'Menyindirnya di media sosial', 
          'Membantunya dengan ikhlas agar tugas cepat rampung', 
          'Memarahinya karena tidak profesional', 
          'C', 
          'Pembahasan: Sikap ikhlas membantu rekan kerja mencerminkan integritas sosial yang tinggi.'
        ]
      ];
      defaultQuestions.forEach(row => sheetQuestions.appendRow(row));
    }

    // 4. Sheet Attempts
    let sheetAttempts = ss.getSheetByName('attempts');
    if (!sheetAttempts) {
      sheetAttempts = ss.insertSheet('attempts');
      sheetAttempts.appendRow(['id', 'userId', 'packageId', 'answersJson', 'score', 'correct', 'wrong', 'timestampStr', 'integrityStatus', 'isSubmitted']);
    }

    return "Inisialisasi datatables selesai berhasil! Google Sheet Anda kini siap digunakan.";
  } catch (e) {
    return "Error saat inisialisasi: " + e.toString();
  }
}

/**
 * Pembacaan Semua Tabel dari Google Sheets secara Sekaligus
 */
function getDbData() {
  try {
    const ss = getSpreadsheet();
    
    // Helper Ambil Data sheet secara aman dari crash data kosong
    const readSheet = (name) => {
      try {
        const sheet = ss.getSheetByName(name);
        if (!sheet) return [];
        const values = sheet.getDataRange().getValues();
        if (values.length <= 1 || !values[0][0]) return [];
        
        const headers = values[0];
        const data = [];
        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          // Antisipasi baris kosong atau di luar jangkauan
          if (!row || row.length < headers.length || !row[0]) continue;
          
          const record = {};
          headers.forEach((h, idx) => {
            let val = row[idx];
            // Parsing Boolean Tipe Data
            if (val === 'TRUE' || val === true) val = true;
            if (val === 'FALSE' || val === false) val = false;
            record[h] = val;
          });
          data.push(record);
        }
        return data;
      } catch (err) {
        console.warn("Gagal membaca sheet " + name + ": " + err.toString());
        return [];
      }
    };

    return {
      success: true,
      users: readSheet('users'),
      packages: readSheet('packages'),
      questions: readSheet('questions'),
      attempts: readSheet('attempts')
    };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Pendaftaran atau Update Pengguna CBT (Siswa/Admin)
 */
function dbRegisterUser(userObj) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('users');
    if (!sheet) return { success: false, error: "Tabel users tidak ditemukan." };

    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    
    // Cek apakah email sudah ada
    let existRowIdx = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][1].toString().toLowerCase() === userObj.email.toString().toLowerCase()) {
        existRowIdx = i + 1;
        break;
      }
    }

    const rowData = headers.map(h => {
      let val = userObj[h];
      return val !== undefined ? val : '';
    });

    if (existRowIdx > -1) {
      // Update data yang ada
      const range = sheet.getRange(existRowIdx, 1, 1, headers.length);
      range.setValues([rowData]);
    } else {
      // Append data baru
      sheet.appendRow(rowData);
    }
    
    return { success: true, message: "Pendaftaran akun berhasil disimpan ke Google Sheets!" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * update status Kunci Paket Tryout dari Admin
 */
function dbUpdatePackageLock(packageId, isLocked) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('packages');
    if (!sheet) return { success: false, error: "Tabel paket tidak ditemukan." };

    const values = sheet.getDataRange().getValues();
    let rowIdx = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === packageId) {
        rowIdx = i + 1;
        break;
      }
    }

    if (rowIdx > -1) {
      // Kolom 'isLocked' adalah kolom ke-4 (indeks h = 3)
      sheet.getRange(rowIdx, 4).setValue(isLocked ? 'TRUE' : 'FALSE');
      return { success: true };
    }
    return { success: false, error: "Paket ID tidak ditemukan." };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Overwrite / update Bank Soal per Paket dari Admin
 */
function dbSavePackageQuestions(packageId, questionsArray) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('questions');
    if (!sheet) return { success: false, error: "Tabel soal tidak ditemukan." };

    // Ambil data lama
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    
    // Cari baris-baris yang TIDAK termasuk paket ini
    const remainingRows = [headers];
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] !== packageId) {
        remainingRows.push(values[i]);
      }
    }

    // Tambah soal-soal baru untuk paket ini
    questionsArray.forEach(q => {
      const row = headers.map(h => q[h] !== undefined ? q[h] : '');
      remainingRows.push(row);
    });

    // Tulis ulang seluruh isi sheet
    sheet.clearContents();
    sheet.getRange(1, 1, remainingRows.length, headers.length).setValues(remainingRows);
    
    return { success: true, message: "Bank soal sukses diperbaharui di Google Sheets!" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Menyimpan Hasil Akhir Pengerjaan Tryout Siswa
 */
function dbSaveAttempt(attemptObj) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('attempts');
    if (!sheet) return { success: false, error: "Tabel attempts tidak ditemukan." };

    const values = sheet.getDataRange().getValues();
    const headers = values[0];

    // Buat data row sesuai susunan kolom header
    const rowData = headers.map(h => {
      let val = attemptObj[h];
      if (h === 'answersJson' && typeof val === 'object') {
        return JSON.stringify(val);
      }
      if (h === 'isSubmitted') {
        return val ? 'TRUE' : 'FALSE';
      }
      return val !== undefined ? val : '';
    });

    // Tambahkan baris baru ke sheet attempts
    sheet.appendRow(rowData);
    return { success: true, message: "Hasil CBT Anda berhasil disubmit secara realtime ke Google Sheets!" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}
