# Internal API Docs — Dashboard BFF v2.1

Dokumentasi endpoint internal yang disediakan oleh **BFF Backend** untuk dikonsumsi oleh **Frontend Dashboard**.  
Berbeda dengan `README.md` yang mendokumentasikan API kontrak dengan SBP App.

**Base URL (development)**: `http://localhost:3000/api/v1`  
**Auth**: Semua endpoint (kecuali `/auth/login`) membutuhkan `Authorization: Bearer <token>` header.

---

## 🔐 Autentikasi

### `POST /auth/login`

Login dan dapatkan JWT token.

**Request Body:**
```json
{ "email": "admin@bapanas.go.id", "password": "Admin123!" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": 1, "email": "admin@bapanas.go.id", "name": "Administrator", "role": "SUPER_ADMIN" }
  }
}
```

**Response 401** (email/password salah):
```json
{ "success": false, "message": "Email atau password salah" }
```

> Login gagal (baik karena email tidak ada maupun password salah) akan dicatat di `audit_logs` sebagai `LOGIN_FAILED`.

---

## 👤 Profil

### `GET /profile`

Ambil info profil user yang sedang login. **Semua role.**

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "email": "...", "name": "...", "role": "ADMIN", "createdAt": "2026-03-01T..." }
}
```

### `PUT /profile/password`

Ganti password sendiri. **Semua role.**

**Request Body:**
```json
{ "oldPassword": "passwordLama", "newPassword": "passwordBaru123" }
```

**Response 200:** `{ "success": true, "data": { "success": true, "message": "Password berhasil diubah" } }`  
**Response 400:** `{ "success": false, "message": "Password lama tidak sesuai" }`

---

## 👥 Manajemen User

> ⚠️ Semua endpoint ini hanya bisa diakses oleh **SUPER_ADMIN**.

### `GET /users`

Ambil daftar semua user.

**Response 200:** `{ "success": true, "data": [ { "id": 1, "email": "...", "name": "...", "role": "...", "createdAt": "..." }, ... ] }`

### `POST /users`

Buat user baru.

**Request Body:**
```json
{ "email": "budi@bapanas.go.id", "password": "Budi123!", "name": "Budi Santoso", "role": "ADMIN" }
```

**Response 200:** User yang baru dibuat.  
**Response 400:** `{ "success": false, "message": "Email sudah terdaftar" }`

### `PUT /users/:id`

Update data user (nama, email, role — bukan password).

**Request Body:** `{ "name": "...", "email": "...", "role": "ADMIN" }`

### `DELETE /users/:id`

Hapus user. Tidak bisa hapus akun sendiri atau SUPER_ADMIN terakhir.

**Response 400:** `{ "success": false, "message": "Tidak dapat menghapus akun sendiri" }`

---

## 📋 Audit Log

> Bisa diakses oleh **SUPER_ADMIN dan ADMIN**.

### `GET /audit`

Ambil riwayat audit dengan filter.

**Query Params:**

| Param | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `startDate` | string | `2026-03-01` | Filter dari tanggal (inklusif) |
| `endDate` | string | `2026-03-31` | Filter sampai tanggal (inklusif) |
| `action` | string | `LOGIN_FAILED` | Filter jenis aksi |
| `userId` | number | `2` | Filter by user ID |
| `page` | number | `1` | Halaman (default: 1) |
| `limit` | number | `50` | Baris per halaman (default: 50) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "userId": 1,
        "action": "LOGIN",
        "details": null,
        "ipAddress": "::1",
        "timestamp": "2026-03-09T05:26:04.000Z",
        "user": { "id": 1, "email": "admin@bapanas.go.id", "name": "Administrator", "role": "SUPER_ADMIN" }
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 42, "totalPages": 1 }
  }
}
```

### `GET /audit/actions`

Ambil daftar action type yang tersedia (untuk filter dropdown).

**Response 200:** `{ "success": true, "data": ["LOGIN", "LOGIN_FAILED", "REFRESH_ALL", "CREATE_USER"] }`

---

## 🔄 Refresh Data

### `POST /refresh-all`

Fetch ulang semua data dari SBP API dan simpan ke database. **Semua role yang login.**

**Response 200:** `{ "success": true, "data": { "message": "Data berhasil diperbarui" } }`  
**Response 500:** `{ "success": false, "message": "Gagal memperbarui data: <detail error>" }`

> Setiap refresh berhasil akan dicatat sebagai `REFRESH_ALL` di `audit_logs`.

### `GET /last-refresh`

Ambil timestamp refresh terakhir.

**Response 200:** `{ "success": true, "data": { "lastRefresh": "2026-03-09T05:15:22.000Z" } }`

---

## 📥 Export Data

### `GET /export`

Generate dan download file Excel laporan penyelamatan & penyaluran pangan.

**Query Params:**

| Param | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `tahun` | string | `2024,2025` | Filter tahun (comma-separated). Wajib diisi minimal 1. |
| `bulan` | string | `1,2,3` | Filter bulan (comma-separated, 1–12). Kosong = semua bulan. |
| `jenisLembaga` | string | `Penggiat` | Filter jenis lembaga. Kosong = semua. |

**Response**: File binary `.xlsx` dengan header `Content-Disposition: attachment; filename="SBP_Export_2024_2026-03-09.xlsx"`

**Struktur Excel (1 sheet)**:

| Baris | Isi |
|---|---|
| 1 | Judul: "LAPORAN DATA PENYELAMATAN & PENYALURAN PANGAN" |
| 2 | Subtitle + info filter |
| 3 | Kosong |
| 4 | Header kolom (biru gelap, bold) |
| 5–N | Data aggregate per lembaga per bulan |
| N+1 | **TOTAL KESELURUHAN** (kuning, bold) |
| N+2 | Kosong |
| N+3 | Catatan kaki |

**Kolom data**:
`No | Nama Lembaga | Jenis Lembaga | Tahun | Bulan | Total Penyelamatan (Kg) | Total Penyaluran (Kg) | Penerima Manfaat`

> **Logika data**: Menggunakan `fact_rasio_lembaga` sebagai base (penyelamatan & penyaluran sudah benar untuk semua jenis lembaga), LEFT JOIN ke `fact_penyaluran_pangan` untuk kolom `Penerima Manfaat`.

---

## 📊 Dashboard (Data Visualization)

### `GET /dashboard/penyelamatan`

Data untuk halaman Penyelamatan Pangan.

### `GET /dashboard/penyaluran`

Data untuk halaman Penyaluran Pangan.

### `GET /dashboard/rasio`

Data untuk halaman Rasio Lembaga.

> Lihat `backend/src/routes/dashboard.routes.ts` untuk detail query params masing-masing endpoint dashboard.

---

## ⚙️ Pengaturan

### `GET /settings` & `PUT /settings`

Kelola pengaturan tampilan dashboard (tema, bahasa, dsb). Tersimpan di database lokal.

---

## 📎 Respons Standar

Semua endpoint menggunakan format respons yang konsisten:

```typescript
// Sukses
{ "success": true, "message": "...", "data": <payload> }

// Error
{ "success": false, "message": "<pesan error yang user-friendly>" }
```

HTTP status codes yang digunakan:
| Code | Kapan |
|---|---|
| `200` | Sukses |
| `400` | Validasi gagal / business rule violation |
| `401` | Token tidak ada atau tidak valid |
| `403` | Token valid tapi role tidak cukup (bukan SUPER_ADMIN) |
| `404` | Resource tidak ditemukan |
| `500` | Error server yang tidak terduga |
