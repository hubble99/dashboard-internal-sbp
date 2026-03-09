# API Contract Documentation — Dashboard SBP v2

Dokumen ini menjelaskan kontrak API antara **SBP App** (penyedia data) dan **Dashboard Monitoring BFF** (konsumen data) untuk Badan Pangan Nasional.

> **Versi**: v2 (diperbarui Maret 2026)  
> **Perubahan dari v1**: 2 endpoint gantikan 4 endpoint lama; produk_donasi kini berformat JSON; tambah kolom penerima manfaat & jenis lembaga penyedia.

---

## 🏗️ Arsitektur

```
┌──────────────────────┐
│   SBP App Database   │  ← Data asli transaksi
│   (PostgreSQL/MySQL) │
└──────────┬───────────┘
           │
           ▼  2 REST Endpoints + API Key
┌──────────────────────┐      ┌──────────────────────────┐
│  SBP API Server      │◄─────┤  Dashboard BFF Backend   │
│  (Express/Laravel)   │      │  POST /api/v1/refresh-all│
└──────────────────────┘      └─────────────┬────────────┘
  Mengembalikan semua                        │ Simpan & agregasi lokal
  records dalam JSON                         ▼
                               ┌──────────────────────────┐
                               │  Dashboard Frontend      │
                               │  React + Ant Design      │
                               └──────────────────────────┘
```

**Prinsip kerja**:
- SBP API mengembalikan **seluruh data** (tanpa pagination)
- Dashboard BFF memanggil endpoint refresh secara periodik / on-demand
- Semua filtering, grouping, dan kalkulasi dilakukan di BFF

---

## 📋 Quick Summary

### Yang perlu disediakan SBP Developer

| # | Endpoint | Data Source | Keterangan |
|---|---|---|---|
| 1 | `GET /penyelamatan-pangan` | Transaksi penyelamatan pangan | Wajib |
| 2 | `GET /penyaluran-pangan` | Transaksi penyaluran + penerima | Wajib |

### Tabel referensi yang perlu disediakan (opsional, atau hardcode di BFF)

| Tabel | Isi |
|---|---|
| `dim_produk_donasi` | Master daftar produk donasi (ID + Nama) |

---

## 🔐 Autentikasi

Semua endpoint dilindungi **API Key** via header:

```http
X-API-Key: <secret-key-akan-diberikan>
```

---

## 📡 Endpoint Spesifikasi

### 1. `GET /penyelamatan-pangan`

**Deskripsi**: Mengembalikan seluruh data transaksi penyelamatan pangan.

**Response Format**:
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [
    {
      "tanggal_penyelamatan": "2024-03-15T00:00:00.000Z",
      "tahun": 2024,
      "bulan": 3,
      "provinsi_id": 31,
      "provinsi_nama": "DKI Jakarta",
      "kabupaten_id": 3171,
      "kabupaten_nama": "Jakarta Pusat",
      "lembaga_id": 1,
      "lembaga_nama": "Yayasan Pangan Lestari",
      "jenis_lembaga": "Penggiat",
      "produk_donasi": { "1": 120.5, "3": 80.0 },
      "jumlah_kg": 200.5
    }
  ]
}
```

**Skema kolom**:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `tanggal_penyelamatan` | DateTime (ISO 8601) | Tanggal transaksi |
| `tahun` | Integer | Tahun (misal: 2024) |
| `bulan` | Integer | Bulan 1–12 |
| `provinsi_id` | Integer | Kode BPS provinsi |
| `provinsi_nama` | String | Nama provinsi |
| `kabupaten_id` | Integer | Kode BPS kabupaten |
| `kabupaten_nama` | String | Nama kabupaten/kota |
| `lembaga_id` | Integer | ID internal lembaga (bukan kode BPS) |
| `lembaga_nama` | String | Nama lembaga |
| `jenis_lembaga` | String | `"Penggiat"` atau `"Transaksi Mandiri"` |
| `produk_donasi` | JSON Object | Key = ID produk (string), Value = bobot kg. Contoh: `{"1": 120.5, "3": 80.0}` |
| `jumlah_kg` | Float | Total bobot semua produk dalam baris ini |

> **Catatan `produk_donasi`**: Key adalah ID dari `dim_produk_donasi`. Value adalah bobot (kg) untuk produk tersebut. Satu transaksi bisa mencakup lebih dari satu jenis produk.

---

### 2. `GET /penyaluran-pangan`

**Deskripsi**: Mengembalikan seluruh data transaksi penyaluran pangan termasuk jumlah penerima manfaat.

**Response Format**:
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [
    {
      "tanggal_salur": "2024-03-15T00:00:00.000Z",
      "tahun": 2024,
      "bulan": 3,
      "provinsi_id": 31,
      "provinsi_nama": "DKI Jakarta",
      "kabupaten_id": 3171,
      "kabupaten_nama": "Jakarta Pusat",
      "lembaga_id": 1,
      "lembaga_nama": "Yayasan Pangan Lestari",
      "jenis_lembaga": "Penggiat",
      "jenis_lembaga_penyedia": "-",
      "produk_donasi": { "1": 100.0, "2": 50.0 },
      "jumlah_kg": 150.0,
      "jumlah_penerima_manfaat": 75
    }
  ]
}
```

**Skema kolom**:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `tanggal_salur` | DateTime (ISO 8601) | Tanggal penyaluran |
| `tahun` | Integer | Tahun |
| `bulan` | Integer | Bulan 1–12 |
| `provinsi_id` | Integer | Kode BPS provinsi |
| `provinsi_nama` | String | Nama provinsi |
| `kabupaten_id` | Integer | Kode BPS kabupaten |
| `kabupaten_nama` | String | Nama kabupaten/kota |
| `lembaga_id` | Integer | ID internal lembaga |
| `lembaga_nama` | String | Nama lembaga penyalur |
| `jenis_lembaga` | String | `"Penggiat"` atau `"Transaksi Mandiri"` |
| `jenis_lembaga_penyedia` | String | Jenis penyedia untuk Transaksi Mandiri: `"HoReCa"`, `"Retail"`, `"Industri Pangan"`, `"Katering"`. Isi `"-"` jika bukan Transaksi Mandiri |
| `produk_donasi` | JSON Object | Sama seperti penyelamatan: `{"id_produk": bobot_kg}` |
| `jumlah_kg` | Float | Total bobot semua produk |
| `jumlah_penerima_manfaat` | Integer | Jumlah penerima manfaat (jiwa) pada transaksi ini |

---

## 📦 Master Data Produk Donasi (`dim_produk_donasi`)

Dashboard BFF memiliki tabel referensi berikut. SBP API harus menggunakan **ID yang sama** pada field `produk_donasi`:

| ID | Nama Produk |
|---|---|
| 1 | Beras |
| 2 | Mie Instan |
| 3 | Minyak Goreng |
| 4 | Gula Pasir |
| 5 | Tepung Terigu |
| 6 | Susu UHT |
| 7 | Telur Ayam |
| 8 | Sayuran Segar |
| 9 | Daging Ayam |
| 10 | Roti & Kue |

> Jika ada produk baru yang perlu ditambahkan, koordinasikan dengan Tim Dashboard agar ID baru ditambahkan ke `dim_produk_donasi`.

---

## ⚡ Persyaratan Performa

| Kriteria | Target |
|---|---|
| Response time | < 5 detik (bahkan dengan 100K+ records) |
| Kapasitas data | Hingga 500K records per endpoint |
| Pagination | **Tidak diperlukan** — kirim semua data sekaligus |
| Caching | Tidak perlu di SBP API |
| Format | JSON dengan UTF-8 encoding |

---

## ✅ Checklist Implementasi SBP Developer

- [ ] Endpoint `GET /penyelamatan-pangan` dapat diakses
- [ ] Endpoint `GET /penyaluran-pangan` dapat diakses
- [ ] Field `produk_donasi` berformat JSON `{"id": bobot}` (bukan string nama produk)
- [ ] ID produk sesuai tabel `dim_produk_donasi` di atas
- [ ] Field `jumlah_penerima_manfaat` berisi nilai integer > 0
- [ ] Field `jenis_lembaga_penyedia` diisi untuk Transaksi Mandiri, `"-"` untuk lainnya
- [ ] API Key authentication berjalan
- [ ] Response time < 5 detik dengan data production
- [ ] Koordinasi staging test dengan Tim Dashboard

---

## 📞 Kontak

**Tim Dashboard Badan Pangan Nasional**  
Email: dashboard@bapanas.go.id

Untuk pertanyaan tentang kontrak API atau format data, silakan hubungi Tim Dashboard.
