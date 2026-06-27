import { NextRequest, NextResponse } from 'next/server'
import { TEMPLATES, getTemplateById } from '@/lib/genlayer/templates'

// Read-only catalog of the built-in contract templates. Public (CORS *), static
// data, no auth. A CLI agent lists templates here, then fetches one with ?id= to
// get its ready-to-deploy source and deploy it through the wallet handoff.

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  // Single template (with source) when ?id= is provided.
  if (id) {
    const t = getTemplateById(id)
    if (!t) {
      return NextResponse.json({ error: `Template not found: ${id}` }, { status: 404, headers: CORS })
    }
    return NextResponse.json(
      {
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        tags: t.tags,
        source: t.source,
      },
      { headers: CORS },
    )
  }

  // Otherwise the full list (metadata only — fetch ?id= for the source).
  const list = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    difficulty: t.difficulty,
    tags: t.tags,
  }))
  return NextResponse.json(list, { headers: CORS })
}
