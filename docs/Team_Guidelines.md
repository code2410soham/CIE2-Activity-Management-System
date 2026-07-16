# Team Guidelines & Coding Standards

This document establishes the code quality expectations, communication channels, and standards for developers working on the **CIE2-Activity-Management-System**.

## Coding Standards

### Javascript/ES6 Guidelines
- **Naming Conventions**: Use `camelCase` for variable and function names. Use `PascalCase` for classes and constructor functions.
- **Async Code**: Always use `async/await` syntax instead of raw promises or callback patterns. Protect with `try/catch` blocks.
- **Exports**: Use standard Node `module.exports` and `require()` imports for consistency.

### HTML/CSS Style
- All HTML templates must link to the shared `styles.css` style definitions instead of creating inline `<style>` blocks.
- Keep CSS variables centered in `:root` inside `frontend/shared/styles.css` for easy theme styling.

## Communication Channels
*   **Daily Standups**: Mon-Fri at 10:00 AM (Status updates: What was completed, what is next, blockers).
*   **Discord/Slack**: For async developer communications. Channels: `#dev-frontend`, `#dev-backend`, `#dev-db`.

## Scalability Best Practices
- Keep models thin, service layers logic-heavy, and controllers routing-only.
- All code files must contain a header comment indicating their filename and primary role.
- Never write credentials inside code files. Use `.env` file templates.
