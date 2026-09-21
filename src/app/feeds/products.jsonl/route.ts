import { DISCOVERY_PRODUCT } from '@/lib/product-catalog';

export const dynamic = 'force-static';

export function GET() {
  return new Response(`${JSON.stringify(DISCOVERY_PRODUCT)}\n`, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
  });
}
