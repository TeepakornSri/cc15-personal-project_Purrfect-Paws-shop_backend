/*
  Warnings:

  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cart` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
