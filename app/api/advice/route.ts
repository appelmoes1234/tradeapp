import { NextResponse } from 'next/server';
import { buildAdviceOutputs } from '../../lib/risk-engine';
import { defaultProfile, symbolRegistry, tradeCandidates } from '../../lib/mock-data';

export function GET() {
  return NextResponse.json({
    profile: defaultProfile,
    advice: buildAdviceOutputs(tradeCandidates, defaultProfile, symbolRegistry),
    generatedAt: new Date().toISOString(),
    executionEnabled: false
  });
}
