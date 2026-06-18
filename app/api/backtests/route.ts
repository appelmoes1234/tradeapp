import { NextResponse } from 'next/server';
import { backtestSummaries } from '../../lib/backtests';

export function GET() {
  return NextResponse.json({ backtests: backtestSummaries });
}
