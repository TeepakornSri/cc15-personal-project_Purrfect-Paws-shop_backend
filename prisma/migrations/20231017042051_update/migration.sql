/*
  Warnings:

  - You are about to drop the column `price` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `cart` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,2)`.
  - You are about to drop the column `firsName` on the `user` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cart` DROP COLUMN `price`,
    DROP COLUMN `productName`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `productImg` VARCHAR(191) NULL,
    ADD COLUMN `productdescription` VARCHAR(191) NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `firsName`,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'User') NOT NULL DEFAULT 'User',
    MODIFY `phoneNumber` VARCHAR(191) NOT NULL;
