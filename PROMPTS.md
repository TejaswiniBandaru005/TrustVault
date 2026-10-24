# TrustVault Engineering & Development Chronicle — PROMPTS.md

> **Project:** TrustVault Zero-Trust Document Enclave  
> **Repository:** `TrustVault`  
> **Tech Stack:** Spring Boot 4.1.1 (Java 21) + Vite React 19 + TypeScript + Neon PostgreSQL  
> **Document Purpose:** Complete chronological log of user requirements, architectural decisions, prompt iterations, and engineering solutions.

---

## 1. Project Overview & Architecture

TrustVault is a production-grade Zero-Trust Document Enclave platform built to enforce immutable file integrity, fine-grained access delegation, and strict role-based isolation.

### Key Capabilities
- **Triple-Tier RBAC:** `VIEWER`, `OWNER`, and `ADMIN` with distinct clearance tiers.
- **Cryptographic File Ingestion:** Automated SHA-256 integrity checksum calculation and verification.
- **Dynamic In-Browser Isolation Reader:** Dynamic cryptographic watermarks with identity stamp and UTC timestamp.
- **Multi-Factor OTP Authentication:** 6-digit one-time password with rate-limited cooldown timers.
- **Soft-Deletion Enclave:** Safe file retirement with instant restoration capabilities.
- **Immutable Audit Ledger:** Append-only security tracking committed to PostgreSQL.

---

## 2. Chronological Prompt Log & Engineering Solutions

### Iteration 1: Landing Page Cleanup, State Retention & Header Navigation
* **User Prompt:**
  > *"the landing page containing many things which points to same task as sign in, explore trustvault, continue to sign in so remove the unwanted ones"*  
  > *"the deleted documents are not getting added in the deleted document in admin dashboard, when i'm refreshing the page should render and load that page only should not go for any other example when i refresh deleted document then it should only need to get refresh not the owner details are any other."*  
  > *"the menu bar should not contain any gap it should be top of the website"*
* **Engineering Solution:**
  1. Streamlined the hero section CTAs into two unified actions: **"Access Document Enclave"** (Sign In) and **"Register Account"** (Sign Up), removing redundant buttons.
  2. Implemented URL hash and localStorage synchronization (`#deleted`, `#permissions`, etc.) so that browser refreshes preserve the active tab.
  3. Removed layout margins, positioning the menu bar flush to the top (`top: 0`) across both public and dashboard views.

---

### Iteration 2: Vercel Deployment & Build Troubleshooting
* **User Prompt:**
  > *"while uploading the project to run the output in verccel it is giving me an error as Error: [BUILD_UTILS_SPAWN_126] Command 'npm run build' exited with 126"*  
  > *"Error: [BUILD_UTILS_SPAWN_126] Command 'vite build' exited with 126"*  
  > *"npm error code EJSONPARSE Invalid package.json"*
* **Engineering Solution:**
  1. **Spawn 126 Diagnosis:** Vercel's Linux container environment lacked execute permissions on `node_modules/.bin/vite`.
  2. **Script Fix:** Replaced `"build": "vite build"` with `"node node_modules/vite/bin/vite.js build"` in `frontend/package.json`.
  3. **Dependency Migration:** Moved `vite` into `"dependencies"` to guarantee availability during production build.
  4. **SPA Rewrites:** Added [`frontend/vercel.json`](file:///D:/TrustVault/frontend/vercel.json) with rewrite rules to route all subpaths to `index.html`.
  5. **JSON Parse Fix:** Resolved missing comma syntax error in `package.json`.

---

### Iteration 3: Identity Verification & Account Clearance UX
* **User Prompt:**
  > *"1. during the any sign in means owner / viewer register new account then the page should come left side and details should be shown as registered as new user and wait for admin / owner to grant you access."*  
  > *"2. if the already existing user is getting sign up then the sign up should be middle only it should move to left after revoke their account it should show you are no longer has access to sign up."*  
  > *"3. when i'm going for create account then the list of roles are not displaying and instead it is going for landing page to select."*  
  > *"4. when the new user's request is still not accepted and still they tries to open it then it should say your account is not verified and access is not granted. then should display the preview button when the user thinks to see preview and click on it then only they wants to go to the preview mode."*
* **Engineering Solution:**
  1. Built View 1 in [`Register.jsx`](file:///D:/TrustVault/frontend/src/pages/Register.jsx) using `.layout-left`: displays registered identity credentials, unique Worker ID, and pending verification status.
  2. Built View 2 for revoked accounts: shifts card to `.layout-left` with a security protocol banner: *"You no longer have access to sign up or use TrustVault"*.
  3. Prevented redirection to the landing page by embedding the role picker directly in the registration form.
  4. Created the unverified login view with an explicit **"Explore in Preview Mode"** button that only initiates preview access when clicked.

---

### Iteration 4: Permissions Centering & Account Creation Role List
* **User Prompt:**
  > *"http://localhost:5173/#permissions i want this page to be center and i didn't ask you for separate tabs of viewer and owner in Create your account, instead i asked u for list as we have in sign in page"*
* **Engineering Solution:**
  1. Wrapped `renderPermissions()` in [`OwnerDashboard.jsx`](file:///D:/TrustVault/frontend/src/pages/OwnerDashboard.jsx) with `.od-permissions-container` (`max-width: 960px; margin: 0 auto; width: 100%;`).
  2. Centered page headings and form actions spanning the layout.
  3. Replaced tabs with the vertical role list (`.role-inline-picker`, `.role-inline-options`, `.role-option-item`) identical to [`Login.jsx`](file:///D:/TrustVault/frontend/src/pages/Login.jsx).

---

### Iteration 5: Split 2-Container Layout & Role Responsibilities Panel
* **User Prompt:**
  > *"im telling that i want my account creation page also the same as this: Welcome back, Sign in to continue to your secure workspace. Selected role: Viewer Change when i click on change then the list should display and list should contains all the 3 roles"*  
  > *"during the sign up page left conatiner should consists of sign in and right container should be instruct the user and if the role is about the viewer tell their responsibilities when the role is viewer and when it is owner should tell about it's responsibilities and tell about the admin when the role is admin's"*
* **Engineering Solution:**
  1. Implemented `Selected role: ... [Change]` pattern with all 3 roles: Viewer, Document Owner, Administrator.
  2. Implemented the split 2-container layout (`layout-split` with `register-split-wrap`):
     - **Left Column:** Auth card with tab navigation (`Create Account` vs `Sign In`).
     - **Right Column:** Dynamic `register-instructions-panel` rendering the selected role's overview, core responsibilities, and zero-trust security guidelines in real-time.

---

### Iteration 6: Demo Credentials & Backend Seeder Configuration
* **User Prompt:**
  > *"keep the admin credentials same as previous 'admin123@gmail.com', 'admin@123' and remove viewer and owner deafult details and give below demo login details for their respective roles as: for owner demo: owner1@example.com / Owner1@123, for viewer demo: viewer1@example.com / Viewer1@123"*
* **Engineering Solution:**
  1. Updated `getDefaultCredentials()` in [`Login.jsx`](file:///D:/TrustVault/frontend/src/pages/Login.jsx):
     - Administrator: `admin123@gmail.com` / `admin@123`
     - Document Owner Demo: `owner1@example.com` / `Owner1@123`
     - Viewer Demo: `viewer1@example.com` / `Viewer1@123`
  2. Configured [`AdminSeeder.java`](file:///D:/TrustVault/trustvault-backend/src/main/java/com/trustvault/AdminSeeder.java) to automatically seed and synchronize all three demo accounts with `APPROVED` status on startup.

---

### Iteration 7: Sign-In Page Right-Side Instructions & Interactive OTP
* **User Prompt:**
  > *"as the same we have right side instructions in Create your account page, the same i want in sign in page after sign in the Verify your email has Resend OTP Change email these 2 options and both of them are not assigned propely they are not that interactive it is just like a button kept their also add some more typescript for the whole project"*
* **Engineering Solution:**
  1. Extended the split 2-column layout to the sign-in page, sharing [`ROLE_DETAILS`](file:///D:/TrustVault/frontend/src/pages/Register.jsx#L23) so the right panel live-updates with role responsibilities upon sign-in role selection.
  2. Upgraded OTP verification UI:
     - **Destination Card:** Shows `Verification code sent to {email}` with an interactive **Edit/Change** pill.
     - **Live 30-Second Cooldown:** Displays countdown `Resend OTP (28s)` with disabled styling and spinner during dispatch.
     - **Interactive "Change Email" Button:** Styled alongside Resend OTP with `<ArrowLeft />` icon and smooth navigation back to credentials.
     - **Monospaced 6-Digit Input:** Centered, large font (`letter-spacing: 10px`) with focus glow.
  3. Added TypeScript modules across the project:
     - Created `frontend/src/types/auth.ts`, `documents.ts`, `admin.ts`, and `index.ts`.
     - Converted `api.js` to `api.ts` with generic `apiRequest<T>()`.
     - Converted `documentContent.js` to `documentContent.ts`.
     - Verified `tsc --project frontend/tsconfig.json --noEmit` passed with 0 errors.

---

### Iteration 8: Setting the Landing Page as Default Home Page
* **User Prompt:**
  > *"how to set the landing page as home page"*
* **Engineering Solution:**
  1. Refactored `page` initialization in [`App.jsx`](file:///D:/TrustVault/frontend/src/App.jsx#L106-L125) so visiting root `/` without a hash defaults to `"home"`.
  2. Prevented `localStorage` from locking unauthenticated users into the login/register screen across visits.
  3. Connected logo and "Home" navbar links to `changePage("home")` with clean URL hash management.

---

## 3. Security & Operational Verification Summary

| Check / Build Pipeline | Command | Result |
| :--- | :--- | :--- |
| **Frontend TypeScript Typecheck** | `npx tsc --project frontend/tsconfig.json --noEmit` | **PASS (0 errors)** |
| **Frontend Production Build** | `npm --prefix frontend run build` | **PASS (Vite 8.3.4, < 500ms)** |
| **Backend Maven Compilation** | `mvnw.cmd test-compile` | **BUILD SUCCESS** |
| **Container Build Validation** | Multi-Stage `Dockerfile` (Node 20 + OpenJDK 21) | **VALIDATED** |
