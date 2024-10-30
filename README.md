# BAR Charted

Discover what lies in the data of BAR maps

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Database

This project uses sqlite for data storage.
To run the project locally you need to:

1. Create `.env` file with NUXT_DB_URL and NUXT_DB_AUTH_TOKEN (if you have one). You can also
   use an sqlite file.
   ```env
       NUXT_DB_URL=file:local.db
   ```
1. Install dependencies.
1. Run the server.
1. Call /api/syncDatabase?highLength=true (Optionally you can edit number of days collected in `./server/utils/services/syncService.ts`)

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
