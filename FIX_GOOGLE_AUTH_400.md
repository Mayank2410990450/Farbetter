# 🚨 URGENT FIX: Google Error 400

You are seeing **Error 400: invalid_request**. This means **Google Cloud Console** does not have the correct URL authorized.

## 🛑 YOU MUST DO THIS MANUALLY

I cannot access your Google Cloud Console. You must follow these exact steps:

### 1. Open Google Cloud Console
Go to: **[https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)**

### 2. Find Your Client ID
Look for the OAuth 2.0 Client ID that starts with:
`1047295571088-...`

Click on the **pencil icon** or the name to edit it.

### 3. Check "Authorized Redirect URIs"
Scroll down to the **Authorized redirect URIs** section.

You MUST have this **EXACT** URL listed (copy and paste it):

```
http://localhost:5000/api/auth/google/callback
```

### ⚠️ Common Mistakes to Avoid:
- ❌ `http://localhost:5000/api/auth/google/callback/` (No trailing slash!)
- ❌ `https://...` (It must be http for localhost)
- ❌ `http://127.0.0.1...` (Unless you use that in your browser)
- ❌ `http://localhost:5173...` (Do NOT put the frontend URL here)

### 4. Check "Authorized JavaScript Origins"
In the **Authorized JavaScript origins** section, make sure you have:

```
http://localhost:5173
http://localhost:5000
```

### 5. SAVE
Click the **SAVE** button at the bottom.

### 6. WAIT
It can take **5 minutes** for changes to take effect.

### 7. RESTART SERVER
Stop your server (Ctrl+C) and run `npm run dev` again.

---

## 🔍 Verify Your Setup

I have created a script to verify your local configuration. Run this command in your terminal:

```bash
node server/verify-oauth.js
```
