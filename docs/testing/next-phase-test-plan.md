# Next Phase Test Plan

## Priority 1

- Anonymous user can access `/` and `/blog`
- Blog detail renders Markdown as structured content
- Unapproved user is denied on `/album`
- Approved family user can access `/album` and album detail
- Private asset content is denied to anonymous and unapproved users
- Admin user can access `/admin`, `/admin/blog`, `/admin/albums`, `/admin/users`

## Priority 2

- Admin can create a blog post
- Admin can create an album
- Admin can upload an album image
- Admin can update user approval and family access

## Priority 3

- Google OAuth configured state is visible on `/login`
- Approved OAuth user lands on the correct protected route
- Non-approved OAuth user is blocked by backend approval rules

## Manual Checklist

- Check login page labels clearly distinguish real OAuth and demo session
- Check admin sidebar exposes all admin sections
- Check album images load through the app route, not raw object storage links
- Check Markdown code blocks and headings render legibly

## Follow-up Automation Candidates

- Integration tests for `/api/albums`
- Integration tests for `/api/assets/{id}/content`
- Integration tests for `/api/admin/users`
- Frontend smoke tests for admin route access control
