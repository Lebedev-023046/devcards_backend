# Frontend System Based On Backend Routes

## App routes

- `/sign-in`: uses `POST /auth/signin`
- `/sign-up`: uses `POST /auth/signup`
- `/dev-auth`: uses `POST /auth/dev-signin` to switch between `USER` and `ADMIN`
- `/app/decks`: server list screen backed by `GET /decks/my`
- `/app/explore`: public catalog backed by `GET /decks/public`
- `/app/favorites`: backed by `GET /me/decks/favorites`
- `/app/decks/:deckId`: deck detail and inline edit flow backed by `GET /decks/:id`, `PATCH /decks/:id`, `DELETE /decks/:id`
- `/app/decks/:deckId/cards`: cards CRUD screen backed by `GET /cards?deckId=:deckId`
- `/app/decks/:deckId/practice`: practice flow backed by `POST /cards/:cardId/review` and `GET /decks/:deckId/progress`
- `/app/admin/tags`: admin-only CRUD page backed by `GET /tags`, `POST /tags`, `PATCH /tags/:id`, `DELETE /tags/:id`

## API features mapped to FE practice topics

- Query params and URL sync: `GET /decks/public`, `GET /decks/my`, `GET /cards` support `page`, `limit`, `query`, filters and sorting.
- Async form validation: `GET /decks/validate-title` and `GET /cards/validate-question`.
- Bulk actions: `DELETE /cards/bulk`, `DELETE /decks/bulk`, `PATCH /decks/bulk/visibility`.
- Roles and fake auth: `POST /auth/dev-signin`, `GET /auth/me`.
- Optimistic updates candidates: favorites, deck visibility, inline card/deck edit, progress review.
- Confirm dialogs: destructive actions on deck/card/tag delete.

## Suggested frontend feature slices

- `entities/auth`: token storage, `me` query, guards for `USER` and `ADMIN`.
- `entities/deck`: list queries, create/edit/delete, favorite toggles, bulk actions.
- `entities/card`: search, filters, pagination, inline update, bulk delete, async validation.
- `entities/tag`: admin CRUD and deck tag attach/detach.
- `entities/progress`: practice session state, optimistic review submission, retry handling.
- `features/ui`: dialogs, toasts, undo timers, URL sync adapters, skeletons, empty states.

## Suggested screen behavior

- Keep server state in the API layer and Reatom atoms only for UI state, filters draft state, selection, modal state, and optimistic patches.
- Use list query params as the single source of truth for search, filters, sorting, page, and page size.
- Practice undo on delete by removing items optimistically in UI, showing a toast timer, and firing the actual delete request at timer completion.
- Use `/auth/dev-signin` to seed both `USER` and `ADMIN` sessions without building a real auth backend.
