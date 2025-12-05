# Custom Domain Setup Guide (GoDaddy)

Since you have purchased a domain from **GoDaddy**, here is how to connect it to your **Vercel Frontend** and **Render Backend**.

## Scenario
- **Domain**: `yourdomain.com` (Replace this with your actual domain name)
- **Frontend (Vercel)**: Will be accessible at `https://www.yourdomain.com`
- **Backend (Render)**: Will be accessible at `https://api.yourdomain.com`

---

## Part 1: Connect Domain to Frontend (Vercel)

1.  **Go to Vercel Dashboard**:
    -   Select your **Farbetter** project.
    -   Go to **Settings** -> **Domains**.
2.  **Add Domain**:
    -   Enter your domain (e.g., `yourdomain.com`) and click **Add**.
    -   Select the option recommended by Vercel (usually adding `www.yourdomain.com` and redirecting the root domain to it).
3.  **Get DNS Records**:
    -   Vercel will show you an **A Record** (IP address) and a **CNAME Record**.
    -   **Keep this tab open.**

4.  **Go to GoDaddy**:
    -   Log in and go to **"My Products"**.
    -   Find your domain and click **"DNS"** or **"Manage DNS"**.
5.  **Add Records for Frontend**:
    -   **Type**: `A`
    -   **Name**: `@`
    -   **Value**: (Copy the IP address from Vercel, e.g., `76.76.21.21`)
    -   **TTL**: `600` (or default)
    
    -   **Type**: `CNAME`
    -   **Name**: `www`
    -   **Value**: `cname.vercel-dns.com` (or whatever Vercel provides)
    -   **TTL**: `600`

    *Note: Delete any existing "Parked" records if they exist.*

6.  **Verify**: Go back to Vercel and click **Verify**. It might take a few minutes to propagate.

---

## Part 2: Connect Subdomain to Backend (Render)

This step makes your API look professional (e.g., `https://api.yourdomain.com` instead of `onrender.com`).

1.  **Go to Render Dashboard**:
    -   Select your **farbetter-backend** service.
    -   Go to **Settings** -> **Custom Domains**.
2.  **Add Domain**:
    -   Enter `api.yourdomain.com` (Replace `yourdomain.com` with your actual domain).
    -   Click **Save**.
3.  **Get DNS Records**:
    -   Render will ask you to create a **CNAME** record pointing to your unique Render URL (e.g., `farbetter-mg2w.onrender.com`).

4.  **Go to GoDaddy (DNS Management)**:
    -   Click **Add New Record**.
    -   **Type**: `CNAME`
    -   **Name**: `api`
    -   **Value**: `farbetter-mg2w.onrender.com` (Your Render URL)
    -   **TTL**: `600`

5.  **Verify**: Go back to Render and click **Verify**. This creates an SSL certificate for `api.yourdomain.com`.

---

## Part 3: Update Configuration (CRITICAL)

Once your domains are active, you **MUST** update your environment variables to use the new URLs.

### 1. Update Frontend (Vercel)
-   Go to **Vercel** -> **Settings** -> **Environment Variables**.
-   Edit `VITE_SERVER_URL`:
    -   **Old**: `https://farbetter-mg2w.onrender.com`
    -   **New**: `https://api.yourdomain.com`
-   **Redeploy** your frontend for changes to take effect.

### 2. Update Backend (Render)
-   Go to **Render** -> **Environment**.
-   Edit `CLIENT_URL`:
    -   **Old**: `https://farbetter.vercel.app`
    -   **New**: `https://www.yourdomain.com`
-   Edit `SERVER_URL` (if you added it earlier):
    -   **New**: `https://api.yourdomain.com`
-   **Save Changes** (Render will auto-restart).

### 3. Update Google OAuth (Google Cloud Console)
-   Go to **Google Cloud Console**.
-   **Authorized JavaScript origins**: Add `https://www.yourdomain.com`
-   **Authorized redirect URIs**: Add `https://api.yourdomain.com/api/auth/google/callback`

---

## Summary of URLs
-   **Website**: `https://www.yourdomain.com`
-   **API**: `https://api.yourdomain.com`
