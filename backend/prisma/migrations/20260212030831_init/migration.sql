-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "page_name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_meta" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_penyelamatan_pangan" (
    "id" SERIAL NOT NULL,
    "tanggal_salur" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "provinsi_nama" TEXT NOT NULL,
    "kabupaten_id" TEXT NOT NULL,
    "kabupaten_nama" TEXT NOT NULL,
    "lembaga_id" TEXT NOT NULL,
    "lembaga_nama" TEXT NOT NULL,
    "jenis_lembaga" TEXT NOT NULL,
    "produk_donasi" TEXT NOT NULL,
    "jumlah_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fact_penyelamatan_pangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_penyaluran_pangan" (
    "id" SERIAL NOT NULL,
    "tanggal_salur" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "provinsi_nama" TEXT NOT NULL,
    "kabupaten_id" TEXT NOT NULL,
    "kabupaten_nama" TEXT NOT NULL,
    "lembaga_id" TEXT NOT NULL,
    "lembaga_nama" TEXT NOT NULL,
    "jenis_lembaga" TEXT NOT NULL,
    "produk_donasi" TEXT NOT NULL,
    "jumlah_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fact_penyaluran_pangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_transaksi_mandiri_detail" (
    "id" SERIAL NOT NULL,
    "tanggal_salur" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "provinsi_nama" TEXT NOT NULL,
    "kabupaten_id" TEXT NOT NULL,
    "kabupaten_nama" TEXT NOT NULL,
    "lembaga_penyedia_id" TEXT NOT NULL,
    "lembaga_penyedia" TEXT NOT NULL,
    "produk_donasi" TEXT NOT NULL,
    "jumlah_kg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fact_transaksi_mandiri_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_penerima_manfaat" (
    "id" SERIAL NOT NULL,
    "tanggal_salur" TIMESTAMP(3) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "provinsi_id" TEXT NOT NULL,
    "provinsi_nama" TEXT NOT NULL,
    "kabupaten_id" TEXT NOT NULL,
    "kabupaten_nama" TEXT NOT NULL,
    "lembaga_id" TEXT NOT NULL,
    "lembaga_nama" TEXT NOT NULL,
    "jenis_lembaga" TEXT NOT NULL,
    "jumlah_penerima" INTEGER NOT NULL,

    CONSTRAINT "fact_penerima_manfaat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_rasio_penggiat" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "lembaga_id" TEXT NOT NULL,
    "lembaga_nama" TEXT NOT NULL,
    "total_penyelamatan" DOUBLE PRECISION NOT NULL,
    "total_penyaluran" DOUBLE PRECISION NOT NULL,
    "rasio_penyaluran" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fact_rasio_penggiat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_meta_key_key" ON "system_meta"("key");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_tanggal_salur_idx" ON "fact_penyelamatan_pangan"("tanggal_salur");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_provinsi_id_idx" ON "fact_penyelamatan_pangan"("provinsi_id");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_kabupaten_id_idx" ON "fact_penyelamatan_pangan"("kabupaten_id");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_lembaga_nama_idx" ON "fact_penyelamatan_pangan"("lembaga_nama");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_tahun_bulan_idx" ON "fact_penyelamatan_pangan"("tahun", "bulan");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_tanggal_salur_idx" ON "fact_penyaluran_pangan"("tanggal_salur");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_provinsi_id_idx" ON "fact_penyaluran_pangan"("provinsi_id");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_kabupaten_id_idx" ON "fact_penyaluran_pangan"("kabupaten_id");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_lembaga_nama_idx" ON "fact_penyaluran_pangan"("lembaga_nama");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_tahun_bulan_idx" ON "fact_penyaluran_pangan"("tahun", "bulan");

-- CreateIndex
CREATE INDEX "fact_transaksi_mandiri_detail_tanggal_salur_idx" ON "fact_transaksi_mandiri_detail"("tanggal_salur");

-- CreateIndex
CREATE INDEX "fact_transaksi_mandiri_detail_provinsi_id_idx" ON "fact_transaksi_mandiri_detail"("provinsi_id");

-- CreateIndex
CREATE INDEX "fact_transaksi_mandiri_detail_kabupaten_id_idx" ON "fact_transaksi_mandiri_detail"("kabupaten_id");

-- CreateIndex
CREATE INDEX "fact_transaksi_mandiri_detail_lembaga_penyedia_idx" ON "fact_transaksi_mandiri_detail"("lembaga_penyedia");

-- CreateIndex
CREATE INDEX "fact_transaksi_mandiri_detail_tahun_bulan_idx" ON "fact_transaksi_mandiri_detail"("tahun", "bulan");

-- CreateIndex
CREATE INDEX "fact_penerima_manfaat_tanggal_salur_idx" ON "fact_penerima_manfaat"("tanggal_salur");

-- CreateIndex
CREATE INDEX "fact_penerima_manfaat_provinsi_id_idx" ON "fact_penerima_manfaat"("provinsi_id");

-- CreateIndex
CREATE INDEX "fact_penerima_manfaat_kabupaten_id_idx" ON "fact_penerima_manfaat"("kabupaten_id");

-- CreateIndex
CREATE INDEX "fact_penerima_manfaat_lembaga_nama_idx" ON "fact_penerima_manfaat"("lembaga_nama");

-- CreateIndex
CREATE INDEX "fact_penerima_manfaat_tahun_bulan_idx" ON "fact_penerima_manfaat"("tahun", "bulan");

-- CreateIndex
CREATE INDEX "fact_rasio_penggiat_tahun_idx" ON "fact_rasio_penggiat"("tahun");

-- CreateIndex
CREATE INDEX "fact_rasio_penggiat_lembaga_nama_idx" ON "fact_rasio_penggiat"("lembaga_nama");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
