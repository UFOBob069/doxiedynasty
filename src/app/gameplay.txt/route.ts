import { gameplayText } from '@/lib/ai-reference';
import { PRODUCT } from '@/lib/product-catalog';

export const dynamic = 'force-static';

export function GET() {
  return new Response(gameplayText(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Link: `<${PRODUCT.rulesUrl}>; rel="canonical"`,
    },
  });
}
