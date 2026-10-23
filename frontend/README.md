# React + Vite

## Run TrustVault locally

The Vite development server proxies `/api` requests to the Spring Boot server at
`http://localhost:8080`. Start the backend and frontend in separate terminals:

```powershell
cd trustvault-backend
.\mvnw.cmd spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

Before starting the backend, configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, and `APP_ADMIN_PASSWORD` in the local process
environment. Do not commit credentials. To proxy to a backend on a different
address, set `VITE_API_PROXY_TARGET` before starting Vite. For a separately
hosted frontend, set `VITE_API_BASE_URL` to the backend's API origin.

The connected authentication endpoints are health check, registration, OTP
login, and email password reset. The document dashboards still use demo data
until document and permission APIs are implemented by the backend.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
