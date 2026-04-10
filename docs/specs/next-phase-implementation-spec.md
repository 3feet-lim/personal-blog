# Next Phase Implementation Spec

## Scope

This phase improves implementation completeness without redesigning the MVP domain.

Included:

- Render blog post Markdown in the frontend
- Split admin UI into `/admin`, `/admin/blog`, `/admin/albums`, `/admin/users`
- Align protected asset access with application-level authorization
- Clarify Google OAuth login completion behavior

Excluded:

- New OAuth providers
- Video support
- Album-level per-user authorization
- Rich blog editor workflows

## Constraints

- Preserve current domain entities and SQLite-first local runtime
- Avoid broad backend API redesign
- Keep protected asset access behind application authorization
- Keep demo login for local development, but clearly separate it from real OAuth

## Design

### Blog Markdown

- `BlogPost.content` remains raw Markdown
- Blog detail page renders Markdown into structured HTML
- Supported MVP formatting:
  - headings
  - paragraphs
  - unordered lists
  - fenced code blocks
  - inline code

### Admin Information Architecture

- `/admin`
  - summary dashboard and navigation
- `/admin/blog`
  - create and review blog posts
- `/admin/albums`
  - create albums and upload images
- `/admin/users`
  - approve users and manage access

### Protected Assets

- Private album assets must not expose raw object-storage URLs as the standard access path
- Authorized access is performed through application routes that enforce policy first
- Album item metadata may reference authorized application routes only

### Google OAuth

- If Google OAuth is configured, `/login` presents it as the primary real login path
- After callback:
  - approved users get a session
  - admin users redirect to `/admin`
  - other approved users redirect to `/album`
- Demo login remains available as a separate local-development option

## Acceptance Criteria

- Blog detail pages no longer show Markdown as plain `<pre>` text
- Admin users can navigate to `/admin`, `/admin/blog`, `/admin/albums`, `/admin/users`
- Non-admin users are blocked from all admin routes
- Private album assets are served only after authorization checks
- OAuth callback stores session state and returns the user to the correct frontend area

## Risks

- Markdown rendering may need later hardening if richer syntax is introduced
- Route split can duplicate admin UI logic if not kept componentized
- OAuth verification still depends on real environment configuration

## Validation Plan

- Build frontend after route split and Markdown changes
- Run backend checks for import/runtime regressions
- Verify anonymous, family, unapproved, and admin access boundaries
