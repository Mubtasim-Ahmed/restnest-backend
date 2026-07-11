const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to Postgres');
    return prisma;
  } catch (error) {
    console.error('❌ Error connecting to Postgres:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  prisma
};
