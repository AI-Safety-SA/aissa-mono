# Testing Guide for Track Record

This guide provides patterns and best practices for writing tests in the Track Record application, designed to be AI-agent-friendly.

## Test Structure

```
tests/
├── utils/
│   ├── neon-branch.ts          # Neon branch lifecycle management
│   ├── test-payload.ts          # Payload client singleton
│   ├── fixtures.ts              # Test data factories
│   └── helpers.ts               # Common test utilities
├── unit/
│   ├── lib/
│   │   └── *.unit.spec.ts       # Pure function tests (mocked)
│   └── components/
│       └── *.unit.spec.ts       # Component tests (mocked)
├── int/
│   ├── api.int.spec.ts          # API integration tests
│   ├── collections/
│   │   └── *.int.spec.ts        # Collection CRUD tests
│   └── workflows/
│       └── *.int.spec.ts        # Business logic tests
└── e2e/
    └── *.e2e.spec.ts            # Full app E2E tests
```

## Test Types

### Unit Tests (`tests/unit/**/*.unit.spec.ts`)

- **Purpose**: Test pure functions, utilities, and components in isolation
- **Database**: No database connection required
- **Speed**: Fast execution
- **Dependencies**: Mocked
- **Config**: `vitest.unit.config.mts`

**Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

### Integration Tests (`tests/int/**/*.int.spec.ts`)

- **Purpose**: Test Payload CMS collections, API endpoints, and workflows
- **Database**: Uses isolated Neon test branch (created automatically)
- **Speed**: Slower than unit tests
- **Dependencies**: Real Payload instance with test database
- **Config**: `vitest.int.config.mts`

**Example:**
```typescript
import { describe, it, beforeAll, expect } from 'vitest'
import { getTestPayload } from '../utils/test-payload'
import { createTestPerson, createTestEvent } from '../utils/fixtures'
import type { Payload } from 'payload'

let payload: Payload

describe('Events API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('creates an event', async () => {
    const person = await createTestPerson(payload)
    const event = await createTestEvent(payload, {
      organiser: person.id,
      name: 'Test Workshop',
    })
    
    expect(event.id).toBeDefined()
    expect(event.slug).toBeDefined()
  })
})
```

### E2E Tests (`tests/e2e/**/*.e2e.spec.ts`)

- **Purpose**: Test full application flow with Playwright
- **Database**: Uses test database
- **Speed**: Slowest
- **Dependencies**: Full application stack
- **Config**: `playwright.config.ts`

## Test Naming Conventions

- **Unit tests**: `*.unit.spec.ts` (e.g., `utils.unit.spec.ts`)
- **Integration tests**: `*.int.spec.ts` (e.g., `api.int.spec.ts`)
- **E2E tests**: `*.e2e.spec.ts` (e.g., `frontend.e2e.spec.ts`)

## Using Test Fixtures

Test fixtures provide factory functions for creating test data:

```typescript
import { createTestPerson, createTestEvent, createTestProgram } from '../utils/fixtures'

// Create a person with defaults
const person = await createTestPerson(payload)

// Create a person with overrides
const person = await createTestPerson(payload, {
  email: 'custom@example.com',
  fullName: 'Custom Name',
  isPublished: true,
})

// Create an event (automatically creates organiser if not provided)
const event = await createTestEvent(payload, {
  name: 'My Event',
  type: 'workshop',
})
```

Available fixtures:
- `createTestPerson(payload, overrides?)`
- `createTestEvent(payload, overrides?)`
- `createTestProgram(payload, overrides?)`
- `createTestProject(payload, overrides?)`
- `createTestOrganisation(payload, overrides?)`
- `createTestPartnership(payload, overrides?)`
- `createTestCohort(payload, overrides?)`
- `createTestEngagement(payload, overrides?)`
- `createTestUser(payload, overrides?)`

## Using Payload Client

Always use the singleton Payload client for tests:

```typescript
import { getTestPayload } from '../utils/test-payload'

const payload = await getTestPayload()
```

This ensures:
- Single Payload instance across tests
- Proper connection to test database branch
- Efficient resource usage

## Neon Branch Lifecycle

Integration tests automatically:
1. **Create** a fresh Neon branch from `prod-main` in `globalSetup`
2. **Run** tests against the isolated branch
3. **Delete** the branch in `globalTeardown`

Each test run gets a completely isolated database, so tests can modify data freely without affecting other environments.

## Writing New Tests

### Adding a Unit Test

1. Create file: `tests/unit/lib/my-function.unit.spec.ts`
2. Import function and test it:
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/my-function'

describe('myFunction', () => {
  it('does something', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

### Adding an Integration Test

1. Create file: `tests/int/collections/my-collection.int.spec.ts`
2. Use fixtures and Payload client:
```typescript
import { describe, it, beforeAll, expect } from 'vitest'
import { getTestPayload } from '../../utils/test-payload'
import { createTestPerson } from '../../utils/fixtures'

let payload: Payload

describe('My Collection', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('creates a record', async () => {
    const person = await createTestPerson(payload)
    // Test your collection
  })
})
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:int

# Run E2E tests
pnpm test:e2e

# Watch mode for integration tests
pnpm test:watch
```

## Environment Variables

Required for integration tests:
- `NEON_API_KEY`: Neon API key for branch management
- `DATABASE_URL`: Set automatically by globalSetup (from Neon branch)
- `PAYLOAD_SECRET`: Payload CMS secret key

See `.env.test.example` for template.

## Best Practices

1. **Use fixtures** instead of manual `payload.create()` calls
2. **Use `getTestPayload()`** instead of creating Payload instances manually
3. **Keep tests isolated** - each test should be independent
4. **Clean up** - fixtures create test data, but you may need to clean up relationships
5. **Use descriptive names** - test names should clearly describe what they test
6. **Test behavior, not implementation** - focus on what the code does, not how

## Common Patterns

### Testing Collection CRUD

```typescript
describe('Persons Collection', () => {
  it('creates a person', async () => {
    const person = await createTestPerson(payload)
    expect(person.id).toBeDefined()
  })

  it('reads a person', async () => {
    const person = await createTestPerson(payload)
    const found = await payload.findByID({
      collection: 'persons',
      id: person.id,
    })
    expect(found.email).toBe(person.email)
  })

  it('updates a person', async () => {
    const person = await createTestPerson(payload)
    const updated = await payload.update({
      collection: 'persons',
      id: person.id,
      data: { fullName: 'Updated Name' },
    })
    expect(updated.fullName).toBe('Updated Name')
  })

  it('deletes a person', async () => {
    const person = await createTestPerson(payload)
    await payload.delete({
      collection: 'persons',
      id: person.id,
    })
    await expect(
      payload.findByID({ collection: 'persons', id: person.id })
    ).rejects.toThrow()
  })
})
```

### Testing Relationships

```typescript
it('creates event with organiser', async () => {
  const organiser = await createTestPerson(payload)
  const event = await createTestEvent(payload, {
    organiser: organiser.id,
  })
  
  const found = await payload.findByID({
    collection: 'events',
    id: event.id,
    depth: 1,
  })
  
  expect(found.organiser).toBeDefined()
  if (typeof found.organiser === 'object') {
    expect(found.organiser.id).toBe(organiser.id)
  }
})
```

### Testing Access Control

```typescript
it('respects published filter for public access', async () => {
  const published = await createTestPerson(payload, { isPublished: true })
  const unpublished = await createTestPerson(payload, { isPublished: false })
  
  // Test public access (no user)
  const publicResult = await payload.find({
    collection: 'persons',
    where: { isPublished: { equals: true } },
  })
  
  expect(publicResult.docs).toHaveLength(1)
  expect(publicResult.docs[0].id).toBe(published.id)
})
```

## Troubleshooting

### Branch Creation Fails

- Check `NEON_API_KEY` is set correctly
- Verify project ID matches (`icy-snow-28111680`)
- Check parent branch exists (`prod-main`)

### Tests Fail with Database Errors

- Ensure `DATABASE_URL` is set (should be automatic)
- Check Neon branch was created successfully
- Verify Payload config uses `DATABASE_URL`

### Tests Are Slow

- Unit tests should be fast (< 1s each)
- Integration tests are slower but should complete in reasonable time
- Consider parallelization for independent tests

## AI Agent Notes

When writing tests:
1. Always use fixtures for test data creation
2. Use `getTestPayload()` for Payload client access
3. Follow naming conventions (`*.unit.spec.ts`, `*.int.spec.ts`)
4. Keep tests focused and isolated
5. Use descriptive test names that explain what is being tested
6. Test the public API/behavior, not internal implementation details
