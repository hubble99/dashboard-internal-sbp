# 📡 Permintaan API kepada Developer Aplikasi SBP

> **Dokumen ini ditujukan kepada Developer Aplikasi Stop Boros Pangan (SBP)**  
> Versi: v2 | Diperbarui: Maret 2026  
> Tim Dashboard Badan Pangan Nasional

---

## 🎯 Apa yang Kami Butuhkan

Tim Dashboard Bapanas membutuhkan **2 endpoint API** dari Aplikasi SBP untuk mengambil data mentah yang akan diolah dan ditampilkan di Dashboard Monitoring.

> **Prinsip penting**: SBP API cukup mengembalikan **semua data** dalam format JSON. Dashboard yang akan mengurus filtering, grouping, dan visualisasi.

---

## 🔐 Autentikasi

Semua endpoint dilindungi dengan **API Key**:

```http
X-API-Key: <key-akan-diberikan-oleh-tim-dashboard>
```

---

## 📋 Daftar Endpoint yang Diminta

### Endpoint 1 — Data Penyelamatan Pangan

```
GET /penyelamatan-pangan
```

**Contoh response:**
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

**Spesifikasi kolom:**

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `tanggal_penyelamatan` | DateTime (ISO 8601) | ✅ | Tanggal transaksi penyelamatan |
| `tahun` | Integer | ✅ | Tahun, diambil dari tanggal |
| `bulan` | Integer (1–12) | ✅ | Bulan, diambil dari tanggal |
| `provinsi_id` | Integer | ✅ | Kode BPS provinsi (misal: `31` = DKI Jakarta) |
| `provinsi_nama` | String | ✅ | Nama provinsi |
| `kabupaten_id` | Integer | ✅ | Kode BPS kabupaten/kota |
| `kabupaten_nama` | String | ✅ | Nama kabupaten/kota |
| `lembaga_id` | Integer | ✅ | ID lembaga internal SBP (bebas, bukan kode BPS) |
| `lembaga_nama` | String | ✅ | Nama lembaga |
| `jenis_lembaga` | String | ✅ | Nilai: `"Penggiat"` atau `"Transaksi Mandiri"` |
| `produk_donasi` | JSON Object | ✅ | Key = ID produk, Value = bobot (kg). Lihat tabel produk di bawah |
| `jumlah_kg` | Float | ✅ | Total bobot semua produk dalam transaksi ini |

---

### Endpoint 2 — Data Penyaluran Pangan

```
GET /penyaluran-pangan
```

**Contoh response:**
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

**Spesifikasi kolom:**

| Kolom | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `tanggal_salur` | DateTime (ISO 8601) | ✅ | Tanggal penyaluran |
| `tahun` | Integer | ✅ | Tahun |
| `bulan` | Integer (1–12) | ✅ | Bulan |
| `provinsi_id` | Integer | ✅ | Kode BPS provinsi |
| `provinsi_nama` | String | ✅ | Nama provinsi |
| `kabupaten_id` | Integer | ✅ | Kode BPS kabupaten/kota |
| `kabupaten_nama` | String | ✅ | Nama kabupaten/kota |
| `lembaga_id` | Integer | ✅ | ID lembaga internal SBP |
| `lembaga_nama` | String | ✅ | Nama lembaga penyalur |
| `jenis_lembaga` | String | ✅ | `"Penggiat"` atau `"Transaksi Mandiri"` |
| `jenis_lembaga_penyedia` | String | ✅ | Diisi untuk Transaksi Mandiri: `"HoReCa"`, `"Retail"`, `"Industri Pangan"`, `"Katering"`. Isi `"-"` jika Penggiat |
| `produk_donasi` | JSON Object | ✅ | Key = ID produk, Value = bobot (kg) |
| `jumlah_kg` | Float | ✅ | Total bobot semua produk |
| `jumlah_penerima_manfaat` | Integer | ✅ | Jumlah jiwa penerima manfaat dalam transaksi ini |

---

## 📦 Daftar ID Produk Donasi

Format `produk_donasi` menggunakan **ID numerik** (bukan nama) sebagai key JSON. Berikut tabel referensi:

| ID | Nama Produk |
|---|---|
| `1` | Beras |
| `2` | Mie Instan |
| `3` | Minyak Goreng |
| `4` | Gula Pasir |
| `5` | Tepung Terigu |
| `6` | Susu UHT |
| `7` | Telur Ayam |
| `8` | Sayuran Segar |
| `9` | Daging Ayam |
| `10` | Roti & Kue |

**Contoh penggunaan:**
```json
// 1 transaksi yang menyertakan 3 jenis produk sekaligus:
"produk_donasi": {
  "1": 120.5,   // Beras: 120.5 kg
  "3": 80.0,    // Minyak Goreng: 80.0 kg
  "7": 15.0     // Telur Ayam: 15.0 kg
},
"jumlah_kg": 215.5   // total dari semua produk
```

> Jika ada produk baru yang belum ada dalam daftar, **koordinasikan lebih dulu** dengan Tim Dashboard agar ID produk baru ditambahkan secara konsisten.

---

## ⚡ Persyaratan Teknis

| Kriteria | Target |
|---|---|
| Response time | < 5 detik (bahkan dengan 100K+ records) |
| Format | `Content-Type: application/json; charset=utf-8` |
| Encoding | UTF-8 (penting untuk nama produk/daerah) |
| Pagination | **Tidak diperlukan** — kirim semua data sekaligus |
| Metode HTTP | `GET` |

---

## 🔢 Kode Wilayah (BPS)

Gunakan kode BPS standar untuk field `provinsi_id` dan `kabupaten_id`:

| Provinsi | Kode BPS |
|---|---|
| DKI Jakarta | 31 |
| Jawa Barat | 32 |
| Jawa Tengah | 33 |
| Jawa Timur | 35 |
| Banten | 36 |
| *(dan seterusnya sesuai kode BPS)* | |

---

## ✅ Checklist Sebelum Go-Live

Pastikan semua item ini terpenuhi sebelum integrasi production:

- [ ] Endpoint `GET /penyelamatan-pangan` dapat diakses dan mengembalikan data
- [ ] Endpoint `GET /penyaluran-pangan` dapat diakses dan mengembalikan data
- [ ] Field `produk_donasi` berformat JSON object `{"id": bobot}` *(bukan string nama produk)*
- [ ] ID produk sesuai dengan tabel di atas (1–10)
- [ ] Field `jumlah_penerima_manfaat` berisi integer ≥ 1
- [ ] `jenis_lembaga_penyedia` diisi untuk Transaksi Mandiri, `"-"` untuk Penggiat
- [ ] `provinsi_id` dan `kabupaten_id` menggunakan kode BPS yang konsisten
- [ ] `tahun` dan `bulan` di-extract dengan benar dari tanggal
- [ ] API Key authentication berjalan
- [ ] Response time < 5 detik dengan data sesungguhnya
- [ ] Test staging sudah dikoordinasikan dengan Tim Dashboard

---

## 📞 Kontak Tim Dashboard

**Badan Pangan Nasional — Tim Dashboard Monitoring**  
Email: dashboard@bapanas.go.id

Untuk pertanyaan mengenai format data, ID produk, atau koordinasi testing, silakan hubungi Tim Dashboard.
