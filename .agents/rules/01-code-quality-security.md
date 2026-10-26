# Antigravity Global Security & Code Quality Standards

## 1. Secret Protection & Environment Hygiene
- Never hardcode secrets, API keys, private tokens, passwords, or credentials into source code.
- Store sensitive values exclusively in `.env` files and ensure `.env*` is present in `.gitignore`.
- Provide an `.env.example` file with placeholder values for all required environment variables.
- Never commit or log confidential keys, database connection strings, or user tokens.

## 2. Dependency & Package Governance
- Use official, actively maintained, and verified packages.
- Before installing new dependencies, check if the capability can be implemented cleanly with existing standard libraries.
- Run security audits (`npm audit`, `pip audit`) when introducing new external libraries.
- Pin or lock dependency versions via `package-lock.json` or `requirements.txt`/`poetry.lock`.

## 3. Secure Development Practices
- Input Validation: Sanitize and validate all user inputs against injection (SQL injection, XSS, Command Injection).
- Type Safety: Enforce strict type checking in TypeScript (`strict: true`) and Python (type annotations, Pydantic).
- Error Handling: Handle exceptions gracefully without leaking sensitive stack traces or internal paths to end-users.
- Access Control: Ensure authenticated routes verify authorization tokens and user roles.
