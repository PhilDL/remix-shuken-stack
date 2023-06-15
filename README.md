# Shuken Stack

![remix-shuken-stack](https://github.com/PhilDL/remix-shuken-stack/assets/4941205/311e77a8-4fad-4768-b026-6ef456f1a061)

> **Warning**!

> Please do not use, this is still a work in progress.
> This stack is all over the place for now.

## What's in the stack

This stack is heavily inspired by the [Epic Stack](https://github.com/epicweb-dev/epic-stack/commit/aa39a0b5b15ab6fa7e12294b837f13f856e9ed71).

- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

## Following progress

If you are interested in that template, please consider giving it a [Star ⭐](https://github.com/PhilDL/remix-shuken-stack). Thanks you!

To follow progress on this template you can follow me on Twitter [@\_philDL](https://twitter.com/_philDL)

## Tips

### Deploy fly secrets from `.env`

```sh
cat .env | tr '\n' ' ' | xargs fly secrets set
```
