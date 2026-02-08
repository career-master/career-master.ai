# Understanding Console Errors

## Errors that matter (fix these)

### 1. `:4000/api/auth/refresh` and `:4000/api/auth/google` — **net::ERR_CONNECTION_REFUSED**

**Meaning:** The frontend is calling the backend at `http://localhost:4000` but nothing is running there.

**Fix:** Start the backend server.

```bash
cd backend
npm install   # if needed
npm start     # or: node server.js
```

Keep this terminal open. Your frontend (e.g. Next.js on port 3000) will then reach the API at `http://localhost:4000/api`.  
If your backend runs on a different port, set `NEXT_PUBLIC_API_URL` in `frontend/.env` to match (e.g. `http://localhost:5000/api`).

---

### 2. Google Sign-In **403** and **"The given origin is not allowed for the given client ID"**

**Meaning:** Google is blocking the sign-in request because the URL you’re using (e.g. `http://localhost:3000`) is not in the allowed list for your OAuth client.

**Fix:** Add your app’s URL in Google Cloud Console:

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Open your **OAuth 2.0 Client ID** (the one used by `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (or the port your Next.js app uses)
   - `http://127.0.0.1:3000` (optional, for 127.0.0.1)
4. Under **Authorized redirect URIs**, add your callback URL if you use redirect flow (e.g. `http://localhost:3000` or where your backend redirects).
5. Save and wait 1–2 minutes, then try again (or use an incognito window).

See **GOOGLE_OAUTH_QUICK_FIX.md** for more detail.

---

### 3. **Cross-Origin-Opener-Policy policy would block the window.postMessage call**

**Meaning:** The browser is warning that a strict COOP setting could block `postMessage` used by Google Sign-In (e.g. in a popup). This often appears together with the 403/origin error.

**Fix:** Usually fixing the **origin/client ID** (above) and ensuring the backend is running is enough. If you still have issues, check that your app isn’t sending an overly strict `Cross-Origin-Opener-Policy` header that blocks the Google popup.

---

## Errors you can ignore (not from your app)

### 4. **SES Removing unpermitted intrinsics** (lockdown-install.js)

**Meaning:** From a browser extension (e.g. MetaMask or another that uses SES/Lockdown), not from your code.

**Action:** None for your app. You can ignore or disable the extension on localhost if it’s noisy.

---

### 5. **Could not establish connection. Receiving end does not exist** (content-all.js / all-frames.js)

**Meaning:** A Chrome extension is trying to talk to a content script or another part of the extension that isn’t loaded on this page.

**Action:** None for your app. Ignore or disable the extension if needed.

---

## Checklist

- [ ] Backend running on port 4000 (or the port in `NEXT_PUBLIC_API_URL`).
- [ ] `frontend/.env` has correct `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000/api`).
- [ ] Google OAuth: your current origin (e.g. `http://localhost:3000`) is in **Authorized JavaScript origins** for your client ID.
- [ ] After changing Google settings, wait 1–2 minutes and retry (or use incognito).
