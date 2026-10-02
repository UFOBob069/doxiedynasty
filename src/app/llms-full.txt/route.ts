import { fullReference } from '@/lib/ai-reference';

export const dynamic = 'force-static';

export function GET() {
  return new Response(fullReference(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
