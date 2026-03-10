# Dashboard SBP — Feature Backlog & Roadmap

> **Dokumen ini dibuat untuk memudahkan diskusi peningkatan fitur di sesi berikutnya.**  
> Update dokumen ini setiap kali ada fitur baru yang direncanakan atau diselesaikan.

---

## ✅ Status Saat Ini (v2 — Selesai Maret 2026)

### Halaman Aktif

| Halaman | URL | Status |
|---|---|---|
| Penyelamatan Pangan | `/penyelamatan-pangan` | ✅ Live |
| Penyaluran Pangan | `/penyaluran-pangan` | ✅ Live |
| Rasio Lembaga | `/rasio-lembaga` | ✅ Live |
| Manajemen User | `/user-management` | ✅ Live (SUPER_ADMIN only) |
| Riwayat Audit | `/audit-history` | ✅ Live (ADMIN & SUPER_ADMIN) |
| Profil & Password | `/profile` | ✅ Live (semua user) |

### Fitur v2 yang Sudah Selesai

- [x] Skema database v2 (4 tabel baru: `dim_produk_donasi`, `fact_penyelamatan_pangan` v2, `fact_penyaluran_pangan` v2, `fact_rasio_lembaga`)
- [x] API refresher dari 2 endpoint SBP (JSONB produk_donasi)
- [x] KPI Total Penerima Manfaat di Penyaluran Pangan
- [x] Chart tren penerima manfaat per bulan
- [x] Top lembaga & provinsi berdasarkan penerima manfaat
- [x] Pivot: Penerima Manfaat (Lembaga × Provinsi)
- [x] Pivot: Lembaga × Produk Donasi (di Penyelamatan & Penyaluran)
- [x] Filter Produk Donasi (multi-select, berlaku untuk semua komponen)
- [x] Filter Bulan di Rasio Lembaga
- [x] Filter Jenis Lembaga Penyedia (kondisional, hanya muncul untuk Transaksi Mandiri)
- [x] Hapus halaman Donasi Mandiri & Penerima Manfaat (digabung)
- [x] Dokumentasi API & skema database diperbarui

---

## ✅ Fitur Pre-Deploy (Selesai Maret 2026)

### B1. Export Data ke Excel ✅

**Implementasi**:
- Library `exceljs` di backend
- Endpoint `GET /api/v1/export?sheets=...&tahun=...&bulan=...`
- Tombol "Export" di header AppLayout → membuka ExportModal
- **ExportModal** dengan pilihan sheet (Penyelamatan / Penyaluran / Rasio) + filter
- Output **report-ready**: judul, header berwarna (#1A3C5E), border tabel, angka terformat, freeze pane
- Aggregate per lembaga per bulan (bukan raw transaction)

**Keputusan desain**:
- 1 file Excel dengan hingga 3 sheet
- Filter: Tahun (multi), Bulan (multi, opsional), Jenis Lembaga (opsional)
- Nama file otomatis: `SBP_Export_2024_2026-03-09.xlsx`

---

### B2. Manajemen User & RBAC ✅

**Role yang diimplementasi** (2 role saja):

| Role | Hak Akses |
|---|---|
| `SUPER_ADMIN` | Full access: semua dashboard, refresh data, kelola user, audit log, profil |
| `ADMIN` | Dashboard, refresh data, audit log, profil — **tidak bisa kelola user** |

**Halaman yang dibuat**:
- `/user-management` — Hanya SUPER_ADMIN (tabel user + tambah + hapus, dengan summary badge)
- `/profile` — Semua user (info akun + ganti password sendiri)

**Keamanan backend**:
- Middleware `requireSuperAdmin` untuk endpoint user management
- Middleware `requireAdmin` untuk endpoint yang perlu login (refresh, audit)
- Proteksi self-deletion di backend
- Proteksi hapus SUPER_ADMIN terakhir

---

### B3. Audit Trail ✅

**4 event yang dicatat** (clean & focused):

| Event | Detail |
|---|---|
| 🔑 `LOGIN` | Email, timestamp, IP address |
| 🚫 `LOGIN_FAILED` | Email yang dicoba (tidak harus ada user), timestamp, IP |
| 🔄 `REFRESH_ALL` | Email user, timestamp, detail jumlah record |
| 👤 `CREATE_USER` | Email creator, email user baru, role |

**Perubahan schema**:
- `AuditLog.userId` sekarang nullable (untuk LOGIN_FAILED)
- `AuditLog.ipAddress` ditambahkan
- Field `pageName` dihapus (tidak relevan)

---

## 📝 Keputusan Stakeholder (Dikonfirmasi Maret 2026)

| Pertanyaan | Jawaban |
|---|---|
| Target Rasio 80% | Seragam untuk semua lembaga |
| Cocok via lembaga_id | Ya, selalu bisa |
| Jenis Lembaga baru | Belum ada; SPPG masuk ke Transaksi Mandiri |
| Frekuensi Refresh | Manual (tombol refresh), bukan rutinitas |
| Format Export | Excel (`.xlsx`), filtered, report-ready |
| Filter Multi-Tahun | Boleh dibatasi (sudah 5 tahun terakhir di modal) |

---

## 🚀 Ideas v3 — Fitur Jangka Panjang (Setelah Deploy)

> Fitur-fitur ini memerlukan analisis lebih lanjut dan mungkin butuh infrastruktur tambahan.

---

### V3-A. Peta Interaktif Indonesia

**Deskripsi**: Visualisasi data per provinsi dan kabupaten menggunakan peta choropleth Indonesia.  
**Library kandidat**: `react-simple-maps` + GeoJSON provinsi/kabupaten Indonesia  
**Data yang divisualisasikan**: Total penyelamatan / penyaluran per provinsi, warna berdasarkan intensitas  

---

### V3-B. Prediksi / Forecasting (ML)

**Deskripsi**: Prediksi tren penyelamatan dan penyaluran pangan beberapa bulan ke depan berdasarkan data historis.  
**Pendekatan**: Python microservice (ARIMA / Prophet) dipanggil dari BFF backend.  

---

### V3-C. Mobile PWA (Progressive Web App)

**Deskripsi**: Optimasi dashboard untuk tampil baik di perangkat mobile.  
**Perubahan**: Responsive layout untuk semua halaman, tabel scroll horizontal di mobile.  

---

### V3-D. Komparasi Antar Periode

**Deskripsi**: Bandingkan data dua periode berbeda secara side-by-side (misal: 2023 vs 2024).  
**Implementasi**: Filter tambahan "Periode Pembanding", tampilkan delta perubahan di KPI cards.  

---

### V3-E. Dashboard Overview / Landing Page

**Deskripsi**: Halaman beranda yang menampilkan ringkasan dari ketiga dashboard sekaligus.

---

### V3-F. Notifikasi Target Rasio

**Deskripsi**: Badge di header menunjukkan jumlah lembaga dengan rasio < 80%.  
**Catatan**: Target 80% sudah dikonfirmasi seragam untuk semua lembaga.

### V3-G. Migrasi Infrastruktur ke VPS (Performance)

**Deskripsi**: Memindahkan backend (`API`) dan Database (`PostgreSQL`) ke VPS lokal terdekat (misal: Jakarta/Singapura) menggunakan `docker-compose.yml`.  
**Tujuan**: Mengurangi latency secara dramatis (dari ~500-800ms menjadi ~50ms) dan mengatasi masalah *auto-pause* yang terjadi pada *free-tier* serverless database.

---

## 🔧 Panduan Melanjutkan di Sesi Baru

Ketika memulai sesi diskusi berikutnya, sampaikan ke AI:

```text
Saya ingin melanjutkan pengembangan Dashboard SBP.
Codebase ada di: d:\Badan Pangan Nasional\Aplikasi Stop Boros Pangan\Dashboard SBP\dashboard-v3\

Baca file backlog di: dashboard-v3\BACKLOG.md
Baca dokumentasi teknis di: dashboard-v3\backend\docs\DATABASE_SCHEMA.md
                              dashboard-v3\backend\docs\README.md

Saya ingin mendiskusikan / mengimplementasikan: [sebutkan fitur yang ingin dibahas]
```

---

## 📅 Riwayat Versi

| Versi | Tanggal | Keterangan |
|---|---|---|
| v1 | Sebelum Maret 2026 | Dashboard awal: 5 halaman, 4 tabel, 4 endpoint SBP |
| v2 | Maret 2026 | Refaktor besar: 3 halaman, skema JSONB, tambah penerima manfaat & filter produk |
| v2.1 | Maret 2026 | Pre-deploy: Export Excel, RBAC (SUPER_ADMIN/ADMIN), Audit Trail, Profil, Vercel/Railway Deploy |
| v3 | TBD | Migrasi VPS, Peta interaktif, prediksi, fitur lanjutan |
