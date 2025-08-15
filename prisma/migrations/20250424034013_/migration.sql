-- CreateTable
CREATE TABLE `DivisionSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `divisionId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `openTime` VARCHAR(191) NOT NULL,
    `closeTime` VARCHAR(191) NOT NULL,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DivisionSchedule_divisionId_idx`(`divisionId`),
    UNIQUE INDEX `DivisionSchedule_divisionId_dayOfWeek_key`(`divisionId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DivisionSchedule` ADD CONSTRAINT `DivisionSchedule_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `DivisionLocation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
