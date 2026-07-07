-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostId` INTEGER NOT NULL,
    `eventTypeId` INTEGER NOT NULL,
    `slotId` INTEGER NOT NULL,
    `inviteeEmail` VARCHAR(191) NOT NULL,
    `inviteeNotes` VARCHAR(191) NULL,
    `inviteeName` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `meetLink` VARCHAR(191) NULL,
    `calendarEventId` VARCHAR(191) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_inviteeEmail_idx`(`inviteeEmail`),
    INDEX `bookings_hostId_createdAt_idx`(`hostId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_eventTypeId_fkey` FOREIGN KEY (`eventTypeId`) REFERENCES `event_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
