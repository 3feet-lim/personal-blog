# Frontend

Next.js App Router MVP frontend for the personal blog project.

## Routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/album`
- `/album/[slug]`
- `/login`
- `/admin`

## Local demo auth

OAuth is not fully implemented yet. Use query params on protected routes or the `/login` page to simulate a session:

- `family@example.com`
- `admin@example.com`
- `guest@example.com`

The frontend forwards the selected demo identity to the backend with the `x-demo-user` header so you can validate auth boundaries locally.
