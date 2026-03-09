# Database Schema — Dashboard SBP v2.1

## Overview

Dokumen ini menjelaskan skema database yang digunakan oleh **Dashboard BFF Backend**. Ini adalah panduan internal untuk developer dashboard dan referensi saat ada perubahan skema.

**Versi**: v2.1 (diperbarui Maret 2026)  
**Database**: PostgreSQL (via Prisma ORM)  
**Lokasi skema**: `backend/prisma/schema.prisma`

---

## Riwayat Perubahan Skema

### v1 → v2 (Maret 2026 — Refaktor Besar)

| v1 (Dihapus) | v2 (Ditambah/Diubah) | Alasan |
|---|---|---|
| `fact_penerima_manfaat` | `jumlah_penerima_manfaat` di `fact_penyaluran_pangan` | Merge ke satu tabel |
| `fact_transaksi_mandiri_detail` | `jenis_lembaga_penyedia` di `fact_penyaluran_pangan` | Merge ke satu tabel |
| `fact_rasio_penggiat` | `fact_rasio_lembaga` | Rename + refaktor scope ke semua jenis lembaga |
| `produk_donasi VARCHAR` | `produk_donasi JSONB` | Support multi-produk per transaksi |
| — | `dim_produk_donasi` (baru) | Master data produk donasi |

### v2 → v2.1 (Maret 2026 — RBAC & Audit)

| Perubahan | Detail |
|---|---|
| Tabel `users` ditambahkan | Untuk autentikasi lokal dan manajemen user |
| Tabel `audit_logs` ditambahkan | Audit trail untuk aksi kritis |
| Tabel `system_meta` ditambahkan | Metadata sistem (timestamp refresh terakhir) |
| Role enum `USER` → `ADMIN` | Dua role: `SUPER_ADMIN` dan `ADMIN` |
| `fact_rasio_lembaga` diperluas | Tambah kolom `jenis_lembaga`, update mapping |

---

## Skema Tabel

### 1. `users` — Pengguna Dashboard

Dikelola sepenuhnya oleh Dashboard BFF. **Tidak terhubung** ke database SBP App.

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment PK |
| `email` | `VARCHAR UNIQUE NOT NULL` | Email login (harus unik) |
| `password` | `VARCHAR NOT NULL` | Password di-hash bcrypt (cost 10) |
| `name` | `VARCHAR NOT NULL` | Nama tampilan |
| `role` | `role_enum NOT NULL DEFAULT 'ADMIN'` | Lihat Role Enum di bawah |
| `created_at` | `TIMESTAMP DEFAULT NOW()` | Waktu pembuatan akun |
| `updated_at` | `TIMESTAMP` | Waktu perubahan terakhir (auto-update) |

**Role Enum** (`role_enum`):

| Nilai | Hak Akses |
|---|---|
| `SUPER_ADMIN` | Full access: semua dashboard, refresh data, kelola user (CRUD), audit log, profil |
| `ADMIN` | Dashboard, refresh data, audit log, profil — **tidak dapat mengelola user** |

> **Catatan**: Password TIDAK PERNAH disimpan dalam bentuk plain text. Gunakan `bcryptjs` hash sebelum INSERT.

**Seed default** (dijalankan saat `npx prisma db seed`):
```
Email    : admin@bapanas.go.id
Password :Admin123!
Role     : SUPER_ADMIN
```
Segera ubah password setelah deploy pertama!

---

### 2. `audit_logs` — Riwayat Aktivitas

Mencatat **4 event kritis** saja (sengaja terbatas agar tidak overwhelming):

| Event | Kapan dicatat |
|---|---|
| `LOGIN` | Login berhasil |
| `LOGIN_FAILED` | Percobaan login gagal (email tidak ada / password salah) |
| `REFRESH_ALL` | Data dashboard di-refresh |
| `CREATE_USER` | User baru dibuat oleh SUPER_ADMIN |

**Skema kolom**:

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment PK |
| `user_id` | `INTEGER REFERENCES users(id) ON DELETE SET NULL` | **Nullable** — null untuk LOGIN_FAILED jika email tidak dikenal |
| `action` | `VARCHAR NOT NULL` | Salah satu dari 4 event di atas |
| `details` | `TEXT` | JSON string berisi metadata tambahan (lihat tabel di bawah) |
| `ip_address` | `VARCHAR` | IP address klien, nullable |
| `timestamp` | `TIMESTAMP DEFAULT NOW()` | Waktu event terjadi |

**Contoh isian kolom `details` per event**:

| Event | Contoh `details` |
|---|---|
| `LOGIN` | `null` |
| `LOGIN_FAILED` | `{"attemptedEmail": "hacker@evil.com"}` |
| `REFRESH_ALL` | `{"message": "Data berhasil diperbarui"}` |
| `CREATE_USER` | `{"createdUserId": 5, "email": "budi@bapanas.go.id", "role": "ADMIN"}` |

---

### 3. `system_meta` — Metadata Sistem

Tabel key-value untuk menyimpan metadata internal sistem.

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment PK |
| `key` | `VARCHAR UNIQUE NOT NULL` | Nama konfigurasi |
| `value` | `TEXT NOT NULL` | Nilai konfigurasi |

**Data yang ada saat ini**:

| Key | Value | Keterangan |
|---|---|---|
| `last_refresh` | ISO 8601 datetime string | Waktu terakhir data di-refresh dari SBP API |

---

### 4. `dim_produk_donasi` — Master Produk Donasi

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | ID produk (digunakan sebagai key di field `produk_donasi` JSONB) |
| `nama` | `VARCHAR UNIQUE NOT NULL` | Nama produk (unik) |
| `created_at` | `TIMESTAMP DEFAULT NOW()` | Waktu insert |

**Data saat ini** (diisi saat refresh pertama dari SBP API):

| ID | Nama |
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

---

### 5. `fact_penyelamatan_pangan` — Data Penyelamatan Pangan

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | |
| `tanggal_salur` | `TIMESTAMP` | Tanggal transaksi |
| `tahun` | `INTEGER` | Tahun |
| `bulan` | `INTEGER` | Bulan (1–12) |
| `provinsi_id` | `VARCHAR` | Kode BPS provinsi (sebagai string) |
| `provinsi_nama` | `VARCHAR` | Nama provinsi |
| `kabupaten_id` | `VARCHAR` | Kode BPS kabupaten (sebagai string) |
| `kabupaten_nama` | `VARCHAR` | Nama kabupaten/kota |
| `lembaga_id` | `VARCHAR` | ID lembaga dari SBP App |
| `lembaga_nama` | `VARCHAR` | Nama lembaga |
| `jenis_lembaga` | `VARCHAR` | `"Penggiat"` atau `"Transaksi Mandiri"` |
| `produk_donasi` | `JSONB` | `{"id_produk": bobot_kg}` — multi-produk per baris |
| `jumlah_kg` | `FLOAT` | Total bobot semua produk |

> **Hanya Penggiat** yang memiliki data bermakna di tabel ini. Untuk **Transaksi Mandiri**, nilai penyelamatan = penyaluran (lihat `fact_rasio_lembaga`).

---

### 6. `fact_penyaluran_pangan` — Data Penyaluran Pangan

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | |
| `tanggal_salur` | `TIMESTAMP` | Tanggal penyaluran |
| `tahun` | `INTEGER` | |
| `bulan` | `INTEGER` | |
| `provinsi_id` | `VARCHAR` | |
| `provinsi_nama` | `VARCHAR` | |
| `kabupaten_id` | `VARCHAR` | |
| `kabupaten_nama` | `VARCHAR` | |
| `lembaga_id` | `VARCHAR` | |
| `lembaga_nama` | `VARCHAR` | |
| `jenis_lembaga` | `VARCHAR` | `"Penggiat"` atau `"Transaksi Mandiri"` |
| `jenis_lembaga_penyedia` | `VARCHAR` | Jenis penyedia untuk Transaksi Mandiri (`"HoReCa"`, `"Retail"`, dll). `"-"` untuk Penggiat |
| `produk_donasi` | `JSONB` | |
| `jumlah_kg` | `FLOAT` | Total bobot |
| `jumlah_penerima_manfaat` | `INTEGER` | Jumlah penerima manfaat (jiwa) |

> Tabel ini adalah **sumber terpercaya untuk semua lembaga** (Penggiat + Transaksi Mandiri). Digunakan sebagai join base saat export data.

---

### 7. `fact_rasio_lembaga` — Rasio Penyaluran per Lembaga

| Kolom | Tipe SQL | Keterangan |
|---|---|---|
| `id` | `SERIAL PK` | |
| `tahun` | `INTEGER` | |
| `bulan` | `INTEGER` | |
| `lembaga_id` | `VARCHAR` | |
| `lembaga_nama` | `VARCHAR` | |
| `jenis_lembaga` | `VARCHAR` | |
| `total_penyelamatan` | `FLOAT` | Total penyelamatan (kg) — untuk TM: = total penyaluran |
| `total_penyaluran` | `FLOAT` | Total penyaluran (kg) |
| `rasio_penyaluran` | `FLOAT` | `(total_penyaluran / total_penyelamatan) * 100` |

> **Target rasio**: ≥ 80% untuk semua jenis lembaga (dikonfirmasi stakeholder).  
> **Logika Transaksi Mandiri**: `total_penyelamatan` = `total_penyaluran` (apa yang diselamatkan langsung disalurkan).

---

## Diagram Relasi

```
users ─────────────────────────────────────────────────────┐
  │ id (PK)                                                 │
  │ email                                                   │
  │ password (bcrypt hash)                                  │ user_id FK
  │ name                                                    │ (nullable)
  │ role (SUPER_ADMIN | ADMIN)                              ▼
  └──────────────────────────────────────────── audit_logs
                                                  │ id (PK)
                                                  │ action
                                                  │ details (JSON text)
                                                  │ ip_address
                                                  │ timestamp

dim_produk_donasi           system_meta
  │ id (PK)                   │ key (UNIQUE)
  │ nama                      │ value
  └── dirujuk via             └── "last_refresh" → ISO timestamp
      produk_donasi JSONB
      di fact tables

fact_penyelamatan_pangan     fact_penyaluran_pangan
  │                            │
  └── lembaga_nama ────────────┘── dipakai untuk JOIN di export
                               │
                               └── jumlah_penerima_manfaat
                                   (satu-satunya sumber data penerima)

fact_rasio_lembaga
  └── BASE untuk export.service.ts (sudah punya penyelamatan + penyaluran)
      + LEFT JOIN ke fact_penyaluran_pangan hanya untuk penerima_manfaat
```

---

## Migrasi & Seeding

### Menjalankan migrasi

```bash
# Buat migrasi baru setelah edit schema.prisma
npx prisma migrate dev --name "nama-perubahan"

# Regenerate Prisma Client (wajib setelah setiap perubahan skema)
npx prisma generate

# Apply migrasi di production (tanpa prompt)
npx prisma migrate deploy
```

### Seeding

```bash
# Jalankan seed (buat user SUPER_ADMIN default + system_meta)
npx prisma db seed
# atau
npm run seed
```

### Melihat data di database

```bash
# Buka Prisma Studio (GUI browser)
npx prisma studio
```

---

## Catatan Teknis

### Tipe Data `produk_donasi` (JSONB)

Field ini menyimpan mapping `id_produk → bobot_kg`:

```json
{ "1": 120.5, "3": 80.0 }
```

- Key adalah `id` dari `dim_produk_donasi` (sebagai string karena JSON object key harus string)
- Value adalah bobot dalam kilogram (float)
- Satu record bisa memiliki beberapa produk

### Menambah Produk Baru

Jika SBP API menambah jenis produk baru, koordinasikan dengan Tim Dashboard untuk update `dim_produk_donasi`. Tabel ini di-clear dan di-re-insert setiap kali `REFRESH_ALL` dijalankan.

### Foreign Key `audit_logs.user_id`

Field ini `nullable` secara sengaja karena event `LOGIN_FAILED` mungkin tidak memiliki user yang valid (email yang dicoba tidak terdaftar). Relasi menggunakan `ON DELETE SET NULL` sehingga penghapusan user tidak menghapus riwayat auditnya.
