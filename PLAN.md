# SamBlog — Implementation Plan

Plan for enabling full blog writing with photo paste, AWS image storage, and a polished admin experience.

**Project path:** `family/samblog/sam-blog`  
**Repo:** [github.com/SamarthSRao/sam-blog](https://github.com/SamarthSRao/sam-blog)

---

## Current State

### What works

| Piece | Status |
|-------|--------|
| **Next.js 16** app with App Router | ✅ |
| **Admin auth** — `/login` → password → JWT session cookie | ✅ |
| **Create posts** — `/admin` (title, slug, textarea) | ✅ |
| **Edit/delete** — `/admin/edit/[slug]`, delete from post page | ✅ |
| **Public blog** — `/` lists posts, `/blog/[slug]` renders with `react-markdown` | ✅ |
| **AWS RDS Postgres** — host points to `database-2-instance-1...us-east-1.rds.amazonaws.com` | ⚠️ partially wired |

### What's missing

| Gap | Impact |
|-----|--------|
| **No image upload** | Can't paste or attach photos |
| **`coverImage` in schema but unused** | No hero/cover images anywhere |
| **Plain `<textarea>`** | No rich editing, no paste-image, no preview |
| **No S3 / file storage** | AWS is only RDS today — no bucket for media |
| **No Prisma migrations** | Schema may not be applied to RDS |
| **Broken `DATABASE_URL`** | Missing `postgresql://user:pass@host:5432/dbname` format |
| **Homepage shows all posts** | No `published: true` filter |

### Architecture today

```mermaid
flowchart LR
    Browser --> NextJS[Next.js App]
    NextJS --> Admin["/admin forms"]
    NextJS --> Prisma[Prisma Client]
    Prisma --> RDS[(AWS RDS Postgres)]

    subgraph missing [Not built yet]
        S3[(AWS S3 Bucket)]
        Upload[Image Upload API]
    end

    Admin -.-> Upload
    Upload -.-> S3
```

---

## Critical Fix First: Database Connection

Current `sam-blog/.env` has an incomplete URL:

```
DATABASE_URL="database-2-instance-1.ck3qegm88rld.us-east-1.rds.amazonaws.com:5432"
```

Prisma needs the full format:

```
postgresql://USERNAME:PASSWORD@database-2-instance-1.ck3qegm88rld.us-east-1.rds.amazonaws.com:5432/DATABASE_NAME?sslmode=require
```

**Before anything else:**

1. Get RDS username, password, and database name from AWS Console
2. Fix `DATABASE_URL` in `sam-blog/.env`
3. Run `npx prisma db push` (or create a proper migration)
4. Confirm posts save and load locally with `bun dev`

Until this works, admin posting may fail silently (the create handler only `console.error`s on failure).

---

## Implementation Plan

### Phase 1 — Stabilize foundation (1–2 hours)

| Task | Why |
|------|-----|
| Fix `DATABASE_URL` + test connection | Unblocks all posting |
| Add `lib/prisma.js` singleton | Avoids multiple Prisma clients |
| Run `prisma db push` against RDS | Ensures `Post` table exists |
| Filter homepage: `findMany({ where: { published: true } })` | Hides drafts from public |
| Add draft checkbox on `/admin` create form | Match edit page behavior |
| Show error feedback on failed create | Today failures are invisible |

---

### Phase 2 — AWS S3 for images (2–3 hours)

You need a bucket for pasted/uploaded photos.

**AWS setup:**

1. Create S3 bucket (e.g. `samblog-media`) in `us-east-1`
2. Enable public read **or** use CloudFront (public read is simpler to start)
3. Create IAM user/role with `s3:PutObject`, `s3:GetObject`
4. Add env vars:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=samblog-media
```

**App changes:**

| File | Purpose |
|------|---------|
| `lib/s3.js` | S3 client + `uploadImage(buffer, filename)` |
| `app/api/upload/route.js` | `POST` multipart upload, admin-only, returns public URL |
| `next.config.mjs` | Add S3 domain to `images.remotePatterns` if using `next/image` |

**Upload flow:**

```
Admin pastes image → browser sends to /api/upload → S3 → returns URL → inserted into content
```

---

### Phase 3 — Rich editor with photo paste (3–4 hours)

Replace the plain textarea with a markdown editor that supports paste.

**Recommended approach:** [MDXEditor](https://mdxeditor.dev/) or [TipTap](https://tiptap.dev/) with image extension.

| Feature | How |
|---------|-----|
| Write full blog | Rich toolbar: headings, bold, lists, links, code blocks |
| Paste photos | `onPaste` / image plugin → upload to `/api/upload` → insert `![](url)` |
| Cover image | File input on admin form → upload → save URL to `coverImage` |
| Preview | Built-in preview tab or live side-by-side |

**Files to change:**

- `app/admin/page.jsx` — new editor component + cover image field
- `app/admin/edit/[slug]/page.jsx` — same editor, pre-filled content
- `components/BlogEditor.jsx` — client component (editor must be `"use client"`)
- `app/blog/[slug]/page.jsx` — render `coverImage` at top + existing markdown body

**Why markdown + S3 URLs:** Display already uses `react-markdown`. Pasted images become `![alt](https://bucket.s3.amazonaws.com/...)` — no schema change needed for inline images.

---

### Phase 4 — Polish admin UX (1–2 hours)

| Feature | Detail |
|---------|--------|
| Post list on `/admin` | Table of all posts with edit/delete links |
| Auto-slug from title | `my-cool-post` generated from title |
| Publish / draft toggle on create | Already on edit, add to create |
| Image drag-and-drop | Same upload handler as paste |
| `remark-gfm` | Tables, strikethrough, task lists in markdown |

---

### Phase 5 — Deploy

Repo: [github.com/SamarthSRao/sam-blog](https://github.com/SamarthSRao/sam-blog)

| Option | Notes |
|--------|-------|
| **Vercel** | Easiest for Next.js; set env vars; RDS must allow Vercel IPs or use public RDS |
| **AWS Amplify** | Native AWS; good if you want everything in AWS |
| **EC2 / ECS** | More control; you run `next start` yourself |

**Production env vars needed:**

- `DATABASE_URL` (RDS with SSL)
- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

**RDS security:** Ensure your deploy host can reach the RDS security group (inbound 5432 from app IP/VPC).

---

## Suggested File Structure (after work)

```
sam-blog/
├── app/
│   ├── admin/
│   │   ├── page.jsx              # create + post list
│   │   └── edit/[slug]/page.jsx
│   ├── api/
│   │   └── upload/route.js       # NEW — image upload
│   └── blog/[slug]/page.jsx      # show cover + markdown
├── components/
│   └── BlogEditor.jsx            # NEW — rich editor + paste
├── lib/
│   ├── prisma.js                 # NEW — singleton
│   ├── s3.js                     # NEW — AWS upload
│   └── session.js
└── prisma/
    └── schema.prisma             # coverImage already exists
```

---

## Priority Order

```mermaid
flowchart TD
    A[1. Fix DATABASE_URL] --> B[2. Verify post create/read works]
    B --> C[3. Set up S3 bucket + upload API]
    C --> D[4. Add BlogEditor with paste support]
    D --> E[5. Wire coverImage on create/edit/display]
    E --> F[6. Admin polish + deploy]
```

---

## Effort Estimate

| Phase | Time | Blocker? |
|-------|------|----------|
| Fix DB + stabilize | ~2 hrs | **Yes — do first** |
| S3 + upload API | ~3 hrs | Needed for photos |
| Rich editor + paste | ~4 hrs | Main goal |
| Polish + deploy | ~2 hrs | Nice to have |

**Total: ~1–2 days** for a solid blogging workflow with photo paste.

---

## Open Decisions

1. **Do you already have an S3 bucket**, or should we create one from scratch?
2. **Where is the site deployed** (Vercel, Amplify, local only, other)?
3. **Editor preference:** markdown with toolbar (simpler, matches current setup) or full WYSIWYG (Google Docs feel)?
4. **Do you have the RDS username/password/db name** to fix `DATABASE_URL`?

---

## Key Files (current)

| File | Role |
|------|------|
| `app/admin/page.jsx` | Create post form |
| `app/admin/edit/[slug]/page.jsx` | Edit post form |
| `app/blog/[slug]/page.jsx` | Public post view (markdown) |
| `prisma/schema.prisma` | `Post` model with `coverImage` field |
| `lib/session.js` | Admin JWT auth |
| `sam-blog/.env` | DB + admin secrets (needs DATABASE_URL fix) |