import { NextResponse } from 'next/server';
import { strategies } from '../../lib/strategies';

export function GET() {
  return NextResponse.json({ strategies });
}
