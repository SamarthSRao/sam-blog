import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Check if the client already exists on globalThis
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// If we are in development, save it to globalThis to reuse across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
