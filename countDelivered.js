import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Given a local date in "YYYY-MM-DD", get UTC range for that local day (00:00–23:59 Mongolia time)
function getMongoliaDateRangeInUTC(localStartStr, localEndStr) {
  const tzOffsetMs = 8 * 60 * 60 * 1000; // Mongolia is UTC+8

  const localStart = new Date(`${localStartStr}T00:00:00`);
  const localEnd = new Date(`${localEndStr}T23:59:59.999`);

  const utcStart = new Date(localStart.getTime() - tzOffsetMs);
  const utcEnd = new Date(localEnd.getTime() - tzOffsetMs);

  return { utcStart, utcEnd };
}

async function main() {
  // User inputs in Mongolia local time
  const mongoliaStart = '2025-05-01';
  const mongoliaEnd = '2025-05-31';

  // Convert local date range to UTC range
  const { utcStart, utcEnd } = getMongoliaDateRangeInUTC(mongoliaStart, mongoliaEnd);

  const cargosDeliveredToUB = await prisma.cargoTracking.findMany({
    where: {
      deliveredToUBDate: {
        gte: utcStart,
        lte: utcEnd,
      },
    },
  });

  const totalDeliveredToUB = cargosDeliveredToUB.length;
  const withDeliveredDate = cargosDeliveredToUB.filter(cargo => cargo.deliveredDate != null).length;
  const withStatusDelivered = cargosDeliveredToUB.filter(cargo => cargo.currentStatus === 'DELIVERED').length;
  const withStatusDeliveredToUB = cargosDeliveredToUB.filter(cargo => cargo.currentStatus === 'DELIVERED_TO_UB').length;

  console.log(`Монголын цагаар ${mongoliaStart} - ${mongoliaEnd} хооронд UB-д хүрсэн нийт ачаа: ${totalDeliveredToUB}`);
  console.log(`...түүнээс хүргэгдсэн огноо (deliveredDate) бүртгэгдсэн нь: ${withDeliveredDate}`);
  console.log(`...currentStatus == DELIVERED: ${withStatusDelivered}`);
  console.log(`...currentStatus == DELIVERED_TO_UB: ${withStatusDeliveredToUB}`);
}

main()
  .catch(e => {
    console.error('Алдаа гарлаа:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// function getMongoliaDateRangeInUTC(localStartStr, localEndStr) {
//   const tzOffsetMs = 8 * 60 * 60 * 1000; // UTC+8
//   const localStart = new Date(`${localStartStr}T00:00:00`);
//   const localEnd = new Date(`${localEndStr}T23:59:59.999`);

//   const utcStart = new Date(localStart.getTime() - tzOffsetMs);
//   const utcEnd = new Date(localEnd.getTime() - tzOffsetMs);

//   return { utcStart, utcEnd };
// }

// async function main() {
//   const mongoliaStart = '2025-05-01';
//   const mongoliaEnd = '2025-05-31';
//   const { utcStart, utcEnd } = getMongoliaDateRangeInUTC(mongoliaStart, mongoliaEnd);

//   // 1. Cargos received at Erenhot during time range
//   const receivedCargos = await prisma.cargoTracking.findMany({
//     where: {
//       receivedAtErenhotDate: {
//         gte: utcStart,
//         lte: utcEnd,
//       },
//     },
//   });

//   const receivedTotal = receivedCargos.length;
//   const receivedinTransit = receivedCargos.filter(c => c.currentStatus === 'IN_TRANSIT').length;
//   const received = receivedCargos.filter(c => c.currentStatus === 'RECEIVED_AT_ERENHOT').length;
//   const receivedDeliveredToUB = receivedCargos.filter(c => c.currentStatus === 'DELIVERED_TO_UB').length;
//   const receivedDelivered = receivedCargos.filter(c => c.currentStatus === 'DELIVERED').length;

//   // 2. Cargos marked as in transit during time range
//   const inTransitCargos = await prisma.cargoTracking.findMany({
//     where: {
//       inTransitDate: {
//         gte: utcStart,
//         lte: utcEnd,
//       },
//     },
//   });

//   const inTransitTotal = inTransitCargos.length;
//   const inTransit = inTransitCargos.filter(c => c.currentStatus === 'IN_TRANSIT').length;
//   const inTransitDeliveredToUB = inTransitCargos.filter(c => c.currentStatus === 'DELIVERED_TO_UB').length;
//   const inTransitDelivered = inTransitCargos.filter(c => c.currentStatus === 'DELIVERED').length;

//   // Print results
//   console.log(`\n📦 Ачаанууд (${mongoliaStart} - ${mongoliaEnd} Монголын цагаар):`);

//   console.log(`\n🚛 RECEIVED_AT_ERENHOT болсон ачаа: ${receivedTotal}`);
//   console.log(` - Үүнээс currentStatus == IN_TRANSIT: ${receivedinTransit}`);
//   console.log(` - Үүнээс currentStatus == RECEIVED_AT_ERENHOT: ${received}`);
//   console.log(` - Үүнээс currentStatus == DELIVERED_TO_UB: ${receivedDeliveredToUB}`);
//   console.log(` - Үүнээс currentStatus == DELIVERED: ${receivedDelivered}`);

//   console.log(`\n🚚 IN_TRANSIT болсон ачаа: ${inTransitTotal}`);
//   console.log(` - Үүнээс currentStatus == IN_TRANSIT: ${inTransit}`);
//   console.log(` - Үүнээс currentStatus == DELIVERED_TO_UB: ${inTransitDeliveredToUB}`);
//   console.log(` - Үүнээс currentStatus == DELIVERED: ${inTransitDelivered}`);
// }

// main()
//   .catch(e => {
//     console.error('Алдаа:', e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// import { PrismaClient } from '@prisma/client';
// import fs from 'fs/promises';
// import path from 'path';

// const prisma = new PrismaClient();

// function getMongoliaDateRangeInUTC(localStartStr, localEndStr) {
//   const tzOffsetMs = 8 * 60 * 60 * 1000; // UTC+8
//   const localStart = new Date(`${localStartStr}T00:00:00`);
//   const localEnd = new Date(`${localEndStr}T23:59:59.999`);
//   const utcStart = new Date(localStart.getTime() - tzOffsetMs);
//   const utcEnd = new Date(localEnd.getTime() - tzOffsetMs);
//   return { utcStart, utcEnd };
// }

// async function main() {
//   const mongoliaStart = '2025-05-14';
//   const mongoliaEnd = '2025-05-23';
//   const { utcStart, utcEnd } = getMongoliaDateRangeInUTC(mongoliaStart, mongoliaEnd);

//   // Query: RECEIVED_AT_ERENHOT
//   const receivedCargos = await prisma.cargoTracking.findMany({
//     where: {
//       receivedAtErenhotDate: {
//         gte: utcStart,
//         lte: utcEnd,
//       },
//     },
//     select: {
//       nickname: true,
//       trackingNumber: true,
//       cargoType: true,
//       price: true,
//       paymentStatus: true,
//       preRegisteredDate: true,
//       receivedAtErenhotDate: true,
//       inTransitDate: true,
//       deliveredToUBDate: true,
//       deliveredDate: true,
//       currentStatus: true,
//     },
//   });

//   // Query: IN_TRANSIT
//   const inTransitCargos = await prisma.cargoTracking.findMany({
//     where: {
//       inTransitDate: {
//         gte: utcStart,
//         lte: utcEnd,
//       },
//     },
//     select: {
//       nickname: true,
//       trackingNumber: true,
//       cargoType: true,
//       price: true,
//       paymentStatus: true,
//       preRegisteredDate: true,
//       receivedAtErenhotDate: true,
//       inTransitDate: true,
//       deliveredToUBDate: true,
//       deliveredDate: true,
//       currentStatus: true,
//     },
//   });

//   // Merge data (add a tag for source)
//   const receivedData = receivedCargos.map(cargo => ({
//     source: 'RECEIVED_AT_ERENHOT',
//     ...cargo,
//   }));

//   const inTransitData = inTransitCargos.map(cargo => ({
//     source: 'IN_TRANSIT',
//     ...cargo,
//   }));

//   const combinedData = [...receivedData, ...inTransitData];

//   // Save to JSON file
//   const outputPath = path.join(process.cwd(), 'cargo_report.json');
//   await fs.writeFile(outputPath, JSON.stringify(combinedData, null, 2), 'utf-8');

//   console.log(`✅ Ачааны тайлан "${outputPath}" файлд хадгалагдлаа. Нийт: ${combinedData.length}`);
// }

// main()
//   .catch(e => {
//     console.error('⚠️ Алдаа:', e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
