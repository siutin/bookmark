# Bookmark Frontend

A minimalist web app for managing bookmarks, built with React, TypeScript, and Vite.

## Features

- User registration (with invite code) and login
- Add, edit, and delete bookmarks (title, URL, description)
- View your list of bookmarks
- Simple, responsive UI
- JWT-based authentication (token stored in localStorage)
- Connects to a backend API (default: `http://localhost:8787`)

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Configure API endpoint (optional)

By default, the app connects to `http://localhost:8787`.  
To change this, set the `VITE_API_BASE` environment variable in a `.env` file.

### 3. Run locally

```sh
npm run dev
```

### 4. Build for production

```sh
npm run build
```

### 5. Preview production build

```sh
npm run preview
```

## Deployment

The app outputs static files to the `dist/` directory.  
You can deploy these to any static host, including Cloudflare Pages or Workers.

## Environment Variables

- `VITE_API_BASE` — (optional) The base URL of your backend API.

## License

MIT