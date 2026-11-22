# ▶️ How to Run the application

## Environment Setup

### 1. Node.js

**Node.js 18 or newer** is required. The currency validation uses `Intl.supportedValuesOf('currency')`, which is not available in older Node versions.

Check your version:

```bash
node -v
```

The output should be `v18.x.x` or higher. This project was tested on **Node.js v24.22.2**.

### 2. Install dependencies

From the `homework-1/` directory:

```bash
cd homework-1
npm install
```

### 3. Start the server

```bash
npm start
```

The server listens on port **3000** by default: `http://localhost:3000`.

If port 3000 is already in use, set a different port with the `PORT` environment variable:

```bash
PORT=3456 npm start
```

### 4. Environment variables

No new environment variables are introduced, and no `.env` file is needed. The only optional variable is `PORT` (default `3000`).
