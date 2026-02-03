# Project: Metrics

## Project Overview

Metrics is a Node.js application designed to generate highly customizable infographics about GitHub accounts, organizations, and repositories. These metrics can be rendered as SVG, Markdown, PDF, or JSON, and are primarily intended for embedding in GitHub profile READMEs and other web contexts.

The project is built with a modular architecture, supporting a wide range of plugins for various data sources and templates for different visual appearances. It can be deployed as a GitHub Action, a standalone web instance, or run locally using Docker.

**Key Technologies:**
*   **Frontend/Templating:** EJS (for SVG rendering), HTML, CSS
*   **Backend/Logic:** Node.js, Express.js (for the web instance), Puppeteer (for SVG rendering, screenshots, and limited web scraping), Octokit (for GitHub API interactions), Axios (for external APIs)
*   **Testing:** Jest
*   **Linting/Formatting:** ESLint, dprint

## Building and Running

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Web Instance
To start the local web instance:
```bash
npm start
```
For development with live reloading:
```bash
npm run dev
```

### Building
To build project assets, including plugin and template indexes:
```bash
npm run build
```

### Testing
To run all tests:
```bash
npm test
```
Specific test suites can be run:
*   `npm run test-contrib`
*   `npm run test-presets`
*   `npm run test-metrics`

### Linting and Formatting
To run ESLint:
```bash
npm run linter
```
Code formatting is handled by dprint:
```bash
npx dprint fmt --config .github/config/dprint.json
```

## Development Conventions

*   **Language:** JavaScript (ES Modules with `.mjs` extension).
*   **Formatting:** Enforced by dprint (configuration in `.github/config/dprint.json`) and ESLint.
*   **Linting:** ESLint is used with rules defined in `source/.eslintrc.yml`. Notable rules include:
    *   No unused variables (`no-unused-vars`).
    *   No semicolons (`semi: [error, never]`).
    *   Double quotes for strings (`quotes: [error, double]`).
    *   Limited line length, callback nesting, and parameters for functions to maintain readability (`max-depth`, `max-nested-callbacks`, `max-params`).
    *   Preference for modern JavaScript features like arrow functions, destructuring, and template literals.
*   **Asynchronous Operations:** `async/await` is widely used for handling asynchronous code, especially when interacting with APIs.
*   **Project Structure:**
    *   Core logic: `source/app/metrics/`
    *   GitHub Action entry point: `source/app/action/index.mjs`
    *   Web instance entry point: `source/app/web/index.mjs`
    *   Plugins: `source/plugins/` (each plugin has its own directory with `index.mjs`, `README.md`, etc.)
    *   Templates: `source/templates/` (each template has its own directory)
    *   Tests: `tests/`
*   **GitHub Actions:** The project heavily relies on GitHub Actions for CI/CD, testing, and deployment, as well as being a primary deployment target for the generated metrics. Configuration files are found in `.github/workflows/`.
