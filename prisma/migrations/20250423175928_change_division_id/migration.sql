/*
  Warnings:

  - You are about to drop the column `surName` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cargotracking` ADD COLUMN `destinationLocationId` VARCHAR(191) NULL,
    ADD COLUMN `originLocationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `surName`;

-- CreateTable
CREATE TABLE `DivisionLocation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `divisionId` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StaffUser_email_key`(`email`),
    UNIQUE INDEX `StaffUser_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CargoTracking_originLocationId_idx` ON `CargoTracking`(`originLocationId`);

-- CreateIndex
CREATE INDEX `CargoTracking_destinationLocationId_idx` ON `CargoTracking`(`destinationLocationId`);

-- AddForeignKey
ALTER TABLE `StaffUser` ADD CONSTRAINT `StaffUser_divisionId_fkey` FOREIGN KEY (`divisionId`) REFERENCES `DivisionLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CargoTracking` ADD CONSTRAINT `CargoTracking_originLocationId_fkey` FOREIGN KEY (`originLocationId`) REFERENCES `DivisionLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CargoTracking` ADD CONSTRAINT `CargoTracking_destinationLocationId_fkey` FOREIGN KEY (`destinationLocationId`) REFERENCES `DivisionLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
