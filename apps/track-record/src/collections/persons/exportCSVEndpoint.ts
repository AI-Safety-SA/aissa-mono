import type { Endpoint } from 'payload'

import type { Person } from '@/payload-types'

import { buildPersonsCSV, buildExportFilterWhere, type ExportFilter } from './csvExport'

const PERSONS_EXPORT_BATCH_SIZE = 200

export const personsCSVExportEndpoint: Endpoint = {
  path: '/export-csv',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get filter parameter: 'all', 'published', 'unpublished'
    const filterParam = req.query?.filter as ExportFilter | undefined

    // Validate filter parameter
    if (filterParam && !['all', 'published', 'unpublished'].includes(filterParam)) {
      return Response.json(
        {
          error: 'Invalid filter parameter. Must be one of: all, published, unpublished',
        },
        { status: 400 },
      )
    }

    try {
      const where = buildExportFilterWhere(filterParam || 'all')

      const docs: Person[] = []
      let page = 1
      let hasNextPage = true

      // Paginate through all results
      while (hasNextPage) {
        const pageResult = await req.payload.find({
          collection: 'persons',
          depth: 0,
          limit: PERSONS_EXPORT_BATCH_SIZE,
          overrideAccess: false,
          page,
          req,
          user: req.user,
          where,
        })

        docs.push(...(pageResult.docs as Person[]))
        hasNextPage = pageResult.hasNextPage
        page = pageResult.nextPage ?? page + 1
      }

      const csv = buildPersonsCSV(docs)
      const fileDate = new Date().toISOString().slice(0, 10)

      return new Response(csv, {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Disposition': `attachment; filename="persons-export-${filterParam || 'all'}-${fileDate}.csv"`,
          'Content-Type': 'text/csv; charset=utf-8',
        },
        status: 200,
      })
    } catch (error) {
      console.error('CSV export failed:', error)
      return Response.json({ error: 'Failed to export CSV' }, { status: 500 })
    }
  },
}
