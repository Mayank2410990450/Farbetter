# Farbetter Deployment Guide

This guide will walk you through deploying your **Farbetter** e-commerce application to production using **Render** (Backend) and **Vercel** (Frontend).

## 1. Preparation

Ensure your project is pushed to a GitHub repository. The structure should be:
- `/client` (Frontend code)
- `/server` (Backend code)

## 2. Deploy Backend (Render)

1.  Create an account on [Render](https://render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configuration**:
    -   **Name**: `farbetter-backend` (or similar)
    -   **Root Directory**: `server`
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start`
    -   **Instance Type**: Free (or Starter for better performance)
5.  **Environment Variables** (Click "Advanced" or "Environment"):
    Add the following keys and values from your local `.env` file:
    -   `MONGO_URI`: Your MongoDB Atlas connection string.
    -   `JWT_SECRET`: A strong secret key.
    -   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
    -   `CLOUDINARY_API_KEY`: Your Cloudinary API key.
    -   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.
    -   `ADMIN_EMAIL`: Email for the default admin account.
    -   `ADMIN_PASSWORD`: Password for the default admin account.
    -   `CLIENT_URL`: `https://your-vercel-project-name.vercel.app` (You will update this *after* deploying the frontend).
    -   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
    -   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
    -   `GOOGLE_CALLBACK_URL`: `https://your-render-backend-url.onrender.com/api/auth/google/callback`
6.  Click **"Create Web Service"**.
7.  **Copy the Backend URL**: Once deployed, copy the URL (e.g., `https://farbetter-backend.onrender.com`).

## 3. Deploy Frontend (Vercel)

1.  Create an account on [Vercel](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Project Configuration**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: Click "Edit" and select `client`.
5.  **Build & Output Settings**:
    -   **Build Command**: `npm run build` (default)
    -   **Output Directory**: `dist` (default)
    -   **Install Command**: `npm install` (default)
6.  **Environment Variables**:
    -   `VITE_SERVER_URL`: Paste your Render Backend URL here (e.g., `https://farbetter-backend.onrender.com`).
    -   `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID.
7.  Click **"Deploy"**.

## 4. Final Configuration & Testing

1.  **Update Backend CORS**:
    -   Go back to your **Render** dashboard.
    -   Update the `CLIENT_URL` environment variable with your new **Vercel Frontend URL** (e.g., `https://farbetter-frontend.vercel.app`).
    -   Render will automatically redeploy.

2.  **Update Google OAuth**:
    -   Go to your [Google Cloud Console](https://console.cloud.google.com/).
    -   Update "Authorized JavaScript origins" to include your Vercel URL.
    -   Update "Authorized redirect URIs" to match your Render Backend URL callback (e.g., `https://farbetter-backend.onrender.com/api/auth/google/callback`).

3.  **Verify Performance**:
    -   Open your Vercel URL.
    -   Open Chrome DevTools -> **Lighthouse**.
    -   Run a "Mobile" and "Desktop" performance audit.
    -   **Tips for Speed**:
        -   Your images are already served via Cloudinary (Good!).
        -   Your frontend uses `lazy` loading for pages (Good!).
        -   Ensure your MongoDB Atlas is in a region close to your users (e.g., `aws-mumbai` for India).

## 5. Troubleshooting

-   **Backend 500 Errors**: Check the "Logs" tab in Render.
-   **CORS Errors**: Ensure `CLIENT_URL` in Render matches your Vercel URL exactly (no trailing slash).
-   **Images not loading**: Check Cloudinary credentials in Render env vars.
