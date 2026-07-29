# Fundoo App (Angular)

Angular front-end recreating the Fundoo Sign In, Sign Up, and Forgot Password screens.

## Structure

```
src/app/
  app.module.ts
  app-routing.module.ts
  app.component.(ts|html|css)
  components/
    sign-in/            -> route: /signin
    sign-up/             -> route: /signup
    forgot-password/     -> route: /forgot
```

Each component has its own `.html`, `.ts`, and `.css` file, as requested.

## Setup

```bash
npm install
npm start
```

Then open http://localhost:4200 — it redirects to `/signin` by default.

- `/signin`  — Sign in page (email/password, Forgot password?, Create account)
- `/signup`  — Create your Fundoo Account page
- `/forgot`  — Forgot Password page

## Notes

- Uses Angular's `FormsModule` (template-driven forms via `ngModel`).
- Routing between pages is wired up (links/buttons navigate via `Router`).
- Form submission handlers (`onSignIn`, `onSubmit`, `onSendResetLink`) currently log to console with `TODO` markers — plug in your backend API calls there.
