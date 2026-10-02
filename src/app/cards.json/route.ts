import { cardChecklist } from '@/lib/ai-reference';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(cardChecklist());
}
