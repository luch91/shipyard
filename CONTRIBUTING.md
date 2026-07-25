# Contributing to Shipyard

Thank you for helping improve Shipyard. Keep changes focused, reviewable, and
safe to deploy.

## Development workflow

1. Create a short-lived branch from `main`.
2. Make one coherent change per pull request.
3. Add or update tests when behavior changes.
4. Run the required checks:

   ```bash
   npm run lint
   npm test
   npx tsc --noEmit
   npm run build
   ```

5. Open a pull request using the repository template.

Never commit `.env*` files, credentials, private keys, generated build output,
or deployment tokens.

## Commit convention

Use Conventional Commits with an optional scope:

```text
type(scope): concise imperative summary
```

Supported types:

- `feat`: user-visible capability
- `fix`: defect correction
- `docs`: documentation only
- `test`: test coverage
- `refactor`: internal change without new behavior
- `perf`: performance improvement
- `build`: build system or dependency behavior
- `ci`: continuous integration
- `chore`: maintenance

Examples:

```text
feat(deploy): add Localnet target
fix(admin): prevent mobile table overflow
docs: document the five network environments
chore(deps): update Supabase client
```

Keep the subject under 72 characters where practical. Use the commit body to
explain motivation, risk, or migration details. Do not mix unrelated changes
in one commit.

## Pull requests

- Prefer squash merging so `main` remains readable.
- Use a Conventional Commit title; it becomes the squash commit subject.
- Describe user impact and testing evidence.
- Call out environment, schema, security, or deployment changes explicitly.
- Do not merge with failing required checks.

## Security

Do not open a public issue containing a vulnerability or credential. Contact
the repository owner privately with reproduction details and affected paths.
