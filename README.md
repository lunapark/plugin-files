# 📁 Files plugin for Luna Park

**Store the files your users upload** (avatars, attachments, documents, imports), with per-role limits and private links, without writing storage code.

Requires the [Users plugin](https://github.com/lunapark/plugin-users), which is installed with it.

## ✨ What you get

| | |
|---|---|
| 🗄️ **A `Files` table** | Every stored file is a row: name, type, size, owner and visibility. Query it with the database nodes. |
| 💾 **Storage of your choice** | In the editor: browser storage, memory, local disk or S3 (desktop). In production: the app's database, the server's disk, or any S3-compatible service. |
| 📏 **Limits per role** | Number of files, size of a file and total size, per role. 8 MB per file and 64 MB in total by default, and no uploads for anonymous visitors. |
| 🔗 **Private links** | Public files get a permanent URL. Private files get signed URLs that expire. |
| ↩️ **Transaction-safe** | Inside a `DB Transaction`, a saved file is removed if the transaction fails, and a deleted file stays until it succeeds. |
| 🧹 **Cleaned up with the user** | Deleting a user with `user/delete` deletes their files. |

## 🚀 Getting started

1. In Luna Park, open **Library → Install Plugins**, search for **Files** and install it (Users is installed too if needed).
2. Create a route and give a property of its **body** the `File` type. The route now accepts uploads.
3. In the route, add a **Save File** node and wire the file to it. Keep the `id` it outputs, for example in a column that references the `Files` table.
4. In the interface, use **Pick Files** and send the chosen file in the route's body.
5. To show or download a file, get its link with **Get File URL**.

## 🧩 Nodes

All nodes run in the backend (routes, crons, backend scripts).

| Node | What it does |
|---|---|
| `files/save` | Stores a `File` for the connected user and outputs its record (`id`, `name`, `type`, `size`, `public`, `owner`). Fails with `413` or `403` when the user's limits are exceeded. |
| `files/read` | Outputs the stored `File` from its `id`. |
| `files/delete` | Deletes a file and its content. It doesn't check who owns the file: compare `owner` with the route's `user.id`, or protect the route with a guard. |
| `files/url` | Outputs a URL to open or download the file. Private files get a signed URL valid for `expires` seconds (1 hour by default). |
| `files/usage` | The connected user's number of files, total size (bytes) and limits (MB, empty means unlimited). |

## ⚙️ Settings

### Storage

| | Editor | Production |
|---|---|---|
| **Browser storage** (OPFS) | ✅ default | |
| **In memory** (cleared on reload) | ✅ | |
| **Local disk** | ✅ desktop app, in the project folder | ✅ on the server, needs a persistent disk |
| **S3-compatible** (AWS, R2, MinIO…) | ✅ desktop app | ✅ |
| **Database** (PostgreSQL) | | ✅ default |

The database storage needs nothing else and is included in your database backups, so it suits small files. Use S3 for large files or heavy traffic.

S3 in the web editor is not offered because buckets reject requests from the editor (CORS). The desktop app sends them without that restriction.

### Limits

One row per role, plus a **Default** row used by roles without their own limits. A user with several roles gets the most generous limit of each kind. Leave a field empty for no limit.

Uploads are also capped by the server before they reach your route, with `UPLOAD_MAX_SIZE` (MB, 10 by default) and `UPLOAD_MAX_FILES` in the project's `.env`.

## 📦 In your deployed backend

- **Serving**: files are served at `GET /api/_files/:id`. Private files need a valid signature. Files that a browser could run (HTML, SVG…) are always downloaded, never displayed.
- **Configuration** in the project's `.env`:

| Variable | Description |
|---|---|
| `FILES_PUBLIC_URL` | Prefix of the file URLs, when the frontend isn't served by the backend (e.g. `https://api.example.com`). Empty by default. |
| `FILES_DISK_FOLDER` | Folder of the local disk storage. |
| `FILES_S3_SECRET_ACCESS_KEY` | Secret key of the S3 storage. Never written to the generated code. |

## 🛠️ Development

```bash
pnpm install
pnpm dev        # rebuild dist/ on change
pnpm preview    # serve dist/ on http://127.0.0.1:2084
```

In the Luna Park editor, open **Plugins → Install from URL** and enter `http://127.0.0.1:2084`.
