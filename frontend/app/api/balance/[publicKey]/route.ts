import { NextResponse } from 'next/server';

const HORIZON = 'https://horizon-testnet.stellar.org';
const ISSUER  = process.env.STELLAR_ISSUER_PUBLIC || process.env.NEXT_PUBLIC_VOLT_ISSUER || '';

export async function GET(
  _request: Request,
  { params }: { params: { publicKey: string } }
) {
  const { publicKey } = params;

  try {
    // VOLT is now a classic Stellar Asset (via SAC wrapper) — read everything from Horizon
    const res = await fetch(`${HORIZON}/accounts/${publicKey}`, { next: { revalidate: 5 } });

    if (!res.ok) {
      return NextResponse.json({ agtBalance: '0', xlmBalance: '0', hasTrustline: false, agtLimit: '0' });
    }

    const account = await res.json();
    const balances: any[] = account.balances || [];

    // XLM
    const xlmEntry = balances.find((b) => b.asset_type === 'native');
    const xlmBalance = xlmEntry?.balance ?? '0';

    // VOLT (classic asset)
    let voltEntry = balances.find(
      (b) => b.asset_code === 'VOLT' && (ISSUER ? b.asset_issuer === ISSUER : true)
    );
    
    // Final fallback: if we have an ISSUER but didn't find a match, 
    // check if ANY 'VOLT' exists to avoid showing "Trustline required" 
    // when the user clearly has some version of VOLT.
    if (!voltEntry && ISSUER) {
      voltEntry = balances.find((b) => b.asset_code === 'VOLT');
    }

    const hasTrustline = !!voltEntry;
    const voltBalance   = voltEntry?.balance ?? '0';
    const voltLimit     = voltEntry?.limit   ?? '0';

    return NextResponse.json({ voltBalance, xlmBalance, hasTrustline, voltLimit });
  } catch (err) {
    console.error('Balance route error', err);
    return NextResponse.json({ voltBalance: '0', xlmBalance: '0', hasTrustline: false, voltLimit: '0' });
  }
}
