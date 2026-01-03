# AI Safety South Africa Website

Astro website for AISSA

> **Note:** This project is part of the [AISSA Monorepo](../README.md). For monorepo-wide setup instructions, see the root README.

## Getting Started

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9.x or 10.x

### Local Development

1.  Clone the monorepo repository:

    ```bash
    git clone https://github.com/AI-Safety-SA/aissa-mono
    cd aissa-mono
    ```

2.  Install dependencies (from the monorepo root):

    ```bash
    pnpm install
    ```

3.  Set up environment variables:

    ```bash
    cd apps/website
    # Copy the example environment file
    cp env.example .env

    # Edit .env with your actual values
    # You'll need to add your Notion API token and database ID
    ```

4.  Start the local development server:

    From the monorepo root:

    ```bash
    pnpm --filter website dev
    ```

    Or from the app directory:

    ```bash
    cd apps/website
    pnpm dev
    ```

    This will start a hot-reloading development server, typically at `http://localhost:4321`.

### Environment Variables

This project uses different environment variable sources for development and production:

- **Development**: Environment variables are loaded from a `.env` file
- **Production**: Environment variables are provided by Netlify via `process.env`

Required environment variables:

- `NOTION_TOKEN`: Your Notion integration token
- `NOTION_DATABASE_ID`: Your Notion database ID for blog/team data
- `SITE_URL`: The site URL (auto-detected in production)
- `BASE_URL`: The base URL path (defaults to "/")

## Development and Deployment Workflow

This project uses a simplified trunk-based development model (GitHub Flow).

1.  **Create a Feature Branch:** All new work (features, fixes, content updates) must be done in a branch created from `main`. Use a descriptive name.

    ```bash
    # Example for a new feature
    git checkout -b feature/add-photo-gallery

    # Example for a bug fix
    git checkout -b fix/correct-phone-number
    ```

2.  **Commit Changes:** Make your changes and commit them with clear, concise messages.

3.  **Open a Pull Request:** When your work is complete, push the branch to GitHub and open a Pull Request (PR) against the `main` branch.

4.  **Review and Stage:** A Netlify Deploy Preview link will be automatically generated and posted as a comment in your PR. Use this link to review your changes in a live, staging-like environment.

5.  **Merge to Production:** Once the PR is approved, merge it into `main` using the **"Squash and Merge"** option on GitHub. This keeps the `main` branch history clean and atomic.

6.  **Automatic Deployment:** Merging to `main` automatically triggers a production deployment via Netlify.
