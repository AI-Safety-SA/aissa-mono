import { describe, expect, it } from 'vitest'

import {
  buildPersonUpsertData,
  deepEqual,
  parseArgs,
  resolveProdEnvFile,
} from '../../../scripts/import-fellows'

describe('resolveProdEnvFile', () => {
  it('prefers .env.prod when present', () => {
    expect(resolveProdEnvFile((filePath) => filePath.endsWith('.env.prod'))).toBe('.env.prod')
  })

  it('falls back to .env.production when .env.prod is absent', () => {
    expect(resolveProdEnvFile((filePath) => filePath.endsWith('.env.production'))).toBe(
      '.env.production',
    )
  })
})

describe('parseArgs', () => {
  it('uses .env and the fellows temp file by default', () => {
    expect(parseArgs([])).toEqual({
      dryRun: false,
      envFile: '.env',
      filePath: 'temp/fellows.json',
    })
  })

  it('switches to the production env file when --prod is passed', () => {
    expect(parseArgs(['--prod']).envFile).toBe(resolveProdEnvFile())
  })

  it('allows explicit env and file overrides', () => {
    expect(parseArgs(['--env=.env.custom', '--file=temp/other.json', '--dry-run'])).toEqual({
      dryRun: true,
      envFile: '.env.custom',
      filePath: 'temp/other.json',
    })
  })
})

describe('buildPersonUpsertData', () => {
  it('maps supported fields directly and stores unsupported fields in metadata', () => {
    const result = buildPersonUpsertData(
      {
        bio: 'Researcher bio',
        email: 'person@example.com',
        id: 'sample-fellow',
        mentors: 'Mentor One & Mentor Two',
        name: 'Sample Fellow',
        primaryImage: '/fellows/images/sample.jpg',
        projectProposal: 'Project proposal text',
        researchInterests: 'Research interests text',
      },
      {
        existingKey: 'existing-value',
      },
      'temp/custom-fellows.json',
    )

    expect(result).toEqual({
      bio: 'Researcher bio',
      email: 'person@example.com',
      fullName: 'Sample Fellow',
      metadata: {
        cairfFellow: {
          mentors: 'Mentor One & Mentor Two',
          primaryImage: '/fellows/images/sample.jpg',
          projectProposal: 'Project proposal text',
          researchInterests: 'Research interests text',
          sourceFile: 'temp/custom-fellows.json',
          sourceId: 'sample-fellow',
        },
        existingKey: 'existing-value',
      },
    })
  })
})

describe('deepEqual', () => {
  it('treats object key order as irrelevant', () => {
    expect(
      deepEqual(
        { cairfFellow: { mentors: 'Mentor One', sourceId: 'sample-fellow' } },
        { cairfFellow: { sourceId: 'sample-fellow', mentors: 'Mentor One' } },
      ),
    ).toBe(true)
  })

  it('detects nested value changes', () => {
    expect(
      deepEqual(
        { cairfFellow: { mentors: 'Mentor One', sourceId: 'sample-fellow' } },
        { cairfFellow: { mentors: 'Mentor Two', sourceId: 'sample-fellow' } },
      ),
    ).toBe(false)
  })
})
