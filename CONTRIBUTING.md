# Contributing to Farbetter 🌟

Thank you for your interest in contributing to **Farbetter**! We welcome contributions from developers of all skill levels. Whether you are fixing bugs, improving documentation, or proposing new features, your help is deeply appreciated.

---

## 📌 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Branching & Commit Guidelines](#branching--commit-guidelines)
- [Coding Standards](#coding-standards)

---

## Code of Conduct

Please read and abide by our [Code of Conduct](CODE_OF_CONDUCT.md) during all interactions within this project.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to ensure the problem hasn't already been reported. When creating an issue, please use the **Bug Report** template and include:
- A clear description of the bug.
- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Screenshots or console logs (if applicable).
- Environment details (OS, Node version, Browser).

### Suggesting Enhancements

Feature requests are always welcome! Open an issue using the **Feature Request** template and explain:
- The problem your idea solves.
- A detailed description of the proposed feature.
- Any potential alternatives or considerations.

### Pull Requests

1. **Fork** the repository and clone your fork locally.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
3. Make your changes and write clean, commented code.
4. Test thoroughly:
   - Run frontend: `npm run dev:client`
   - Run backend: `npm run dev:server`
   - Run build: `npm run build`
5. Commit your changes using descriptive commit messages following Conventional Commits (e.g., `feat: add coupon analytics chart`, `fix: handle invalid product ID gracefully`).
6. Push to your branch and open a **Pull Request** against `main`.

---

## Development Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Mayank2410990450/Farbetter.git
   cd Farbetter
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**:
   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

4. **Seed Database (MongoDB)**:
   ```bash
   cd server && npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Branching & Commit Guidelines

We recommend following [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
| :--- | :--- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semi-colons, etc. (no code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Code change that improves performance |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

---

## Coding Standards

- **React / Frontend**: Use functional components with hooks, Tailwind CSS for styling, and Radix UI components for accessible primitives. Keep components modular in `client/src/components/`.
- **Backend**: Use Express routers and controller patterns in `server/controller/` and `server/routes/`.
- **Async Handling**: Use `async/await` with `try/catch` error handling blocks and return clean JSON error payloads.
- **Security**: Never hardcode secrets or credentials in source code.

Thank you for making Farbetter better! 🚀
