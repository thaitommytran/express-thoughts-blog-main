# Fix Vercel 404 NOT_FOUND

If you still see **404: NOT_FOUND** after deploying, do this in the Vercel dashboard:

## 1. Set Root Directory to `frontend`

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **General**.
2. Under **Root Directory**, click **Edit**.
3. Enter: **`frontend`**
4. Save.

This makes Vercel build and deploy only the React app. The `frontend/vercel.json` rewrites will then apply correctly.

## 2. Clear build overrides (optional)

Under **Settings** → **General** → **Build & Development Settings**:

- **Framework Preset**: Create React App (or leave as detected)
- **Build Command**: leave empty (use default `yarn build` or `npm run build`)
- **Output Directory**: leave empty (default is `build` for CRA)
- **Install Command**: leave empty

If you had custom values here, clear them so Vercel uses the CRA defaults.

## 3. Redeploy

Trigger a new deployment (push a commit or use **Deployments** → **Redeploy**).

---

**Why this works:** With Root Directory = `frontend`, Vercel uses `frontend/vercel.json`, which rewrites all non-file requests to `/index.html` so React Router can handle routes like `/post/123` and `/login`.
