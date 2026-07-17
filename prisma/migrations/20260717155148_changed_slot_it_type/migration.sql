/*
  Warnings:

  - The primary key for the `slots` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_slotId_fkey`;

-- DropIndex
DROP INDEX `bookings_slotId_fkey` ON `bookings`;

-- AlterTable
ALTER TABLE `bookings` MODIFY `slotId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `slots` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
