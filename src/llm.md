# Files plugin

Stores files uploaded by users. Requires the Users plugin.

## Uploading
1. Give a property of the route's `body` the `File` type (or an array of `File`). The route then accepts `multipart/form-data`.
2. In the interface, get files with `Pick Files` and put them in the route's body.
3. In the route, `files/save` stores a file and outputs its record `{ id, name, type, size, public, owner }`. Keep the `id` (for example in a column that references the `Files` table).

## Nodes (backend only)
- `files/save`: stores a `File` for the connected user. `public` makes its URL permanent. Fails with 413/403 when the user's role limits are exceeded.
- `files/read`: outputs the stored `File` from an `id`.
- `files/delete`: deletes a file and its content. Doesn't check ownership: compare `owner` with the route's `user.id` or use a guard.
- `files/url`: outputs a URL to show or download a file. Private files get a signed URL valid for `expires` seconds.
- `files/usage`: the connected user's file count, total size (bytes) and limits (MB, empty = unlimited).

## Files table
Columns: `name`, `type` (MIME), `size` (bytes), `public`, `owner` (user id, empty for anonymous uploads). Query it with the DB nodes to list a user's files. Don't insert rows yourself: use `files/save`.

## Notes
- Inside a `DB Transaction`, a saved file is removed if the transaction fails, and a deleted file's content is only removed once it succeeds.
- Deleting a user with `user/delete` also deletes their files.
