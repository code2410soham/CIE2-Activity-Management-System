# Project Workflow Guidelines

This document details the software development process, branch rules, and pull request checklist designed to keep a team of 10+ developers synchronized.

## Git Branching Strategy (GitFlow Lite)
To avoid merge conflicts, developers must strictly adhere to this model:

```
main          ======================== [Release Version]
               ^
develop        ======================== [Integration & Testing]
               ^
feature/abc    ========= [Feature Dev]
```

1.  **`main` Branch**: Production-ready code only. Direct commits are forbidden.
2.  **`develop` Branch**: Main integration branch. All feature branches branch off and merge back here.
3.  **`feature/` Branches**: Short-lived branches named after features/tasks. E.g., `feature/auth-jwt-integration` or `feature/student-dashboard-ui`.

## Commit Message Policy
Standardised format following Conventional Commits guidelines:
*   `feat: <description>`: A new feature.
*   `fix: <description>`: A bug fix.
*   `docs: <description>`: Documentation changes only.
*   `refactor: <description>`: Code changes that neither fix a bug nor add a feature.

## Code Review & Merge Process
1.  Push your feature branch to GitHub.
2.  Open a Pull Request (PR) targeting the `develop` branch.
3.  Assign at least **two reviewers** from the team.
4.  All automated tests and linters (ESLint/Stylelint) must pass.
5.  Resolve review comments, obtain approval, and merge via Squashing.
