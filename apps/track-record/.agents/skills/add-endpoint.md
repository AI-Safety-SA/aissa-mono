# Skill: Add Custom API Endpoint

## When to use
Creating a custom API route in track-record (outside Payload's auto-generated REST/GraphQL).

## Steps

1. **Create route file** in `src/app/(payload)/api/your-endpoint/route.ts`

2. **Authenticate** — use session utilities or reviewer auth. Never expose unauthenticated write endpoints.

3. **Rate limiting** — apply rate limiting for public-facing endpoints.
   - Pattern: see `src/utilities/community/rate-limit.ts`

4. **Input validation** — validate and sanitize all user input.
   - Protect against SSRF for any user-supplied URLs
   - Protect against path traversal for any user-supplied file paths

5. **Use Local API** — call Payload via `req.payload.find()` etc., not raw DB queries.
   - Always set `overrideAccess: false` when passing `user`
   - Always pass `req` for transaction safety

6. **Write tests** in `tests/unit/`

## Reference

See `.agents/rules/endpoints.md` for full endpoint patterns and examples.
