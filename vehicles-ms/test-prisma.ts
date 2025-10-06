import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa');
  } catch (err) {
    console.error('❌ Error de conexión', err);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
