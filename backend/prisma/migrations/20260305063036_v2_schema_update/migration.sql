/*
  Warnings:

  - You are about to drop the `fact_penerima_manfaat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fact_rasio_penggiat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fact_transaksi_mandiri_detail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jenis_lembaga_penyedia` to the `fact_penyaluran_pangan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jumlah_penerima_manfaat` to the `fact_penyaluran_pangan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `produk_donasi` on the `fact_penyaluran_pangan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produk_donasi` on the `fact_penyelamatan_pangan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "fact_penyaluran_pangan" ADD COLUMN     "jenis_lembaga_penyedia" TEXT NOT NULL,
ADD COLUMN     "jumlah_penerima_manfaat" INTEGER NOT NULL,
DROP COLUMN "produk_donasi",
ADD COLUMN     "produk_donasi" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "fact_penyelamatan_pangan" DROP COLUMN "produk_donasi",
ADD COLUMN     "produk_donasi" JSONB NOT NULL;

-- DropTable
DROP TABLE "fact_penerima_manfaat";

-- DropTable
DROP TABLE "fact_rasio_penggiat";

-- DropTable
DROP TABLE "fact_transaksi_mandiri_detail";

-- CreateTable
CREATE TABLE "dim_produk_donasi" (
    "id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "dim_produk_donasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_rasio_lembaga" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "lembaga_id" TEXT NOT NULL,
    "lembaga_nama" TEXT NOT NULL,
    "jenis_lembaga" TEXT NOT NULL,
    "total_penyelamatan" DOUBLE PRECISION NOT NULL,
    "total_penyaluran" DOUBLE PRECISION NOT NULL,
    "rasio_penyaluran" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fact_rasio_lembaga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fact_rasio_lembaga_tahun_bulan_idx" ON "fact_rasio_lembaga"("tahun", "bulan");

-- CreateIndex
CREATE INDEX "fact_rasio_lembaga_lembaga_nama_idx" ON "fact_rasio_lembaga"("lembaga_nama");

-- CreateIndex
CREATE INDEX "fact_rasio_lembaga_jenis_lembaga_idx" ON "fact_rasio_lembaga"("jenis_lembaga");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_jenis_lembaga_idx" ON "fact_penyaluran_pangan"("jenis_lembaga");

-- CreateIndex
CREATE INDEX "fact_penyaluran_pangan_jenis_lembaga_penyedia_idx" ON "fact_penyaluran_pangan"("jenis_lembaga_penyedia");

-- CreateIndex
CREATE INDEX "fact_penyelamatan_pangan_jenis_lembaga_idx" ON "fact_penyelamatan_pangan"("jenis_lembaga");
