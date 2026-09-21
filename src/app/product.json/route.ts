import { PRODUCT_JSON_LD } from '@/lib/product-catalog';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(PRODUCT_JSON_LD), {
    headers: { 'Content-Type': 'application/ld+json; charset=utf-8' },
  });
}
