import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  const accounts = await prisma.account.findMany({ include: { user: true } });
  const users = await prisma.user.findMany();
  return NextResponse.json({ session, accounts, users });
}
