import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, message: 'Email verification is not required for PataSpace Kenya-first authentication.' });
}
