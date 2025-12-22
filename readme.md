# Technical Test — Favorites + Admin Debug Mode (Full Stack)

## Overview
This submission implements two end-to-end product features (backend + frontend):

1) ⭐ **Favorites**
- Favorite/unfavorite an activity
- View favorites on the profile page
- Reorder favorites (drag & drop)

2) 🧰 **Admin Debug Mode**
- Display activity `createdAt` on activity cards when the logged-in user is an **admin**

✅ Bonus:
- Fixed a critical React issue using `pnpm dlx fix-react2shell-next@latest …`

---

## TL;DR (Impact)

### ⭐ Favorites
- **User impact**: instant favorite toggling (optimistic UI), dedicated favorites list on profile, smooth reordering (DnD).
- **Backend impact**: scalable design (dedicated collection + indexes), robust ordering, **atomic batch reordering** via `bulkWrite`.
- **Quality**: **46 backend unit tests** + frontend store tests.

### 🧰 Admin Debug Mode
- **User impact**: admins see creation dates directly on activity cards (useful for moderation/debugging).
- **Tech impact**: reusable hook/component, conditional rendering, graceful behavior on invalid/missing dates.
- **Security**: critical fix preventing password exposure through GraphQL schema.

---

# Review 📑
⚠️ You can review per branch merged and per commit. For each one there is a specific description. 
- [All branches here](https://github.com/XyDisorder/nab-interview/pulls?q=is%3Apr+is%3Aclosed)

You can so understand better all technical choices. 

------

## Feature 1 — Favorites

### Backend (NestJS + GraphQL + MongoDB)

#### What was implemented
- Create favorite (optional explicit `order`, otherwise auto-append at the end)
- List favorites for the current user sorted by `order`
- Reorder favorites:
  - single favorite order update
  - **batch reorder** optimized for drag & drop UIs
- Delete favorite
- `Activity.isFavorite` resolve field (nullable → returns `null` when unauthenticated)

#### Architecture decision: dedicated `Favorite` collection
Chosen over embedding favorites in the `User` document for scalability:
- Avoids MongoDB 16MB document size limits
- Better query performance via indexes
- Reduces write contention on User documents
- Supports future pagination and evolution

#### Data model & indexes
```ts
Favorite {
  userId: ObjectId       // indexed, not exposed through GraphQL
  activityId: ObjectId   // indexed, unique per user
  order: number          // indexed, used for sorting
}

Indexes:
- { userId: 1, activityId: 1 } UNIQUE   // prevents duplicates
- { userId: 1, order: 1 }              // optimizes sorted retrieval
```

#### Key technical highlights
- **Automatic order placement**
  - If `order` is omitted, computes `max(order) + 1`
  - First favorite starts at `0`
- **Batch reordering**
  - Uses MongoDB `bulkWrite` for atomic multi-update operations
  - Validates ownership for all favorites before execution
  - Optimized for drag-and-drop UI interactions
- **Security & validation**
  - `userId` extracted from JWT context (never exposed to clients)
  - Validates activity existence
  - Ownership verification for all mutations
  - Consistent error handling using `HttpException` and appropriate status codes
- **Circular dependency**
  - Uses `forwardRef()` to resolve circular dependency between `ActivityModule` and `FavoriteModule`
  - `Activity.isFavorite` resolves favorite status dynamically

#### GraphQL API (summary)
- Query:
  - `getAllFavoritesByUserId: [Favorite!]!`
- Mutations:
  - `createFavorite(createFavoriteInput: CreateFavoriteInput!): Favorite!` *(order optional)*
  - `updateFavoriteOrder(updateFavoriteOrderInput: UpdateFavoriteOrderInput!): Favorite!`
  - `reorderFavorites(reorderFavoritesInput: ReorderFavoritesInput!): [Favorite!]!` *(batch operation)*
  - `deleteFavorite(activityId: ID!): Boolean!`
- ResolveField:
  - `Activity.isFavorite: Boolean` *(nullable, `null` if unauthenticated)*

#### Testing
- ✅ **46 backend unit tests**
  - All dependencies mocked (no real DB)
  - Covers success paths, error handling (not found, validation failures, DB errors), edge cases, unauthorized access, and batch operations

---

### Frontend (Next.js + Apollo Client + Zustand + dnd-kit)

#### What was implemented
- **GraphQL integration**
  - Queries: `GetAllFavorites`
  - Mutations: `CreateFavorite`, `DeleteFavorite`, `ReorderFavorites`
  - Activity fragment updated to include `isFavorite`
  - Apollo Client configured for SSR authentication (JWT header handling)
- **State management**
  - Zustand store `favoriteStore` enabling optimistic UI
  - Mapping `activityId -> isFavorite`
  - API: `setFavorite`, `getFavorite`, `clear`
- **UI components**
  - `FavoriteButton`: toggle favorite with optimistic updates
  - `FavoriteList`: favorites list with drag & drop reordering
  - `SortableFavoriteItem`: individual draggable favorite card
- **Hooks**
  - `useFavorites`: fetch and manage favorites (with activity details)
  - `useReorderFavorites`: handles drag-and-drop reordering logic
- **Integration points**
  - Favorite button added to:
    - activity card
    - activity list item
    - activity detail page
  - Favorites list integrated into the profile page

#### Technical highlights
- Drag & drop implemented using `@dnd-kit/*`
- Optimistic updates via Zustand for immediate UI feedback
- Apollo `refetchQueries` ensures eventual consistency

#### Testing
- ✅ Frontend unit tests for `favoriteStore` focused on business logic (set/get/clear)

---

## Feature 2 — Admin Debug Mode

### Context / Goal
Provide a debug mode so **admin users** can see activity creation dates (`createdAt`) on activity cards.

### What was implemented
- Conditional display of `createdAt` on activity cards **only for admins**
- Reusable hook + component (DRY, extensible for future admin-only UI)
- Graceful degradation: silently hides the UI if dates are missing/invalid (no UI breakage)

### Architecture decision
- **Frontend-only role check**
  - Acceptable here since creation dates are not sensitive data
  - For future sensitive admin features, backend validation with NestJS guards should be added

### Security improvement (critical fix)
- Removed the `@Field()` decorator from the `password` field in the User GraphQL schema to prevent password exposure.

### Testing
- ✅ Backend E2E: **2 tests** covering GraphQL schema changes
- ✅ Frontend: **3 suites / 8 test cases** covering:
  - conditional rendering (admin vs non-admin vs unauthenticated)
  - invalid/null dates

---

## Bonus
Fixed a critical React issue using:
```bash
pnpm dlx fix-react2shell-next@latest …
```

---

## Tech Stack

### Backend
- NestJS
- GraphQL (Resolvers + ResolveField)
- MongoDB (collection + indexes)
- Jest (unit testing)
- E2E tests (GraphQL schema coverage)

### Frontend
- Next.js
- Apollo Client (SSR authentication header handling)
- Zustand (optimistic UI state)
- `@dnd-kit/*` (drag & drop)
- Jest / Testing Library (unit + integration testing)

---

## Notable Engineering Improvements
- Scalable data modeling (dedicated favorites collection + indexes)
- Atomic and performant batch reorder (`bulkWrite`)
- Clean layering: data access (`FavoriteService`) / business logic (`FavoriteApiService`) / API layer (`FavoriteResolver`)
- Optimistic UX with eventual consistency guarantees
- GraphQL security hardening (password field protection)

---

## How to Run (adjust to repository scripts)
> Example commands if the repo uses a pnpm workspace with `back-end/` and `front-end/`.

```bash
pnpm install

# Backend
pnpm --filter back-end start
pnpm --filter back-end test

# Frontend
pnpm --filter front-end dev
pnpm --filter front-end test
```

---

## Future Improvements (optional)
- Add backend role guard for sensitive admin-only features
- Add timezone-aware formatting for `createdAt`
- Add favorites pagination (I already implemented it on the PR Review code in the part "feature improvement").
