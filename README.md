# LightDocs

LightDocs is a lightweight collaborative document editor built for the Ajaia product-engineering assignment.

The app is inspired by Google Docs, but intentionally scoped to a focused 4-6 hour product slice: users can create, edit, save, upload, and share documents with seeded test users.

## Live Demo

Live product URL:

TODO: Add deployed URL here

## Test Users

The app uses mock login with seeded users. No passwords are required.

- Alice Chen — alice@example.com
- Bob Smith — bob@example.com
- Carla Nguyen — carla@example.com

Use the landing page to switch between users.

## Features

- Mock login with seeded users
- Create new documents
- Rename documents
- Rich-text editing in the browser
  - Bold
  - Italic
  - Underline
  - H1 / H2 headings
  - Bulleted lists
  - Numbered lists
- Manual document save
- Reopen documents after refresh
- Persistent SQLite storage with Prisma
- Upload `.txt` or `.md` files and turn them into editable documents
- Share documents with another seeded user
- Separate “Owned by me” and “Shared with me” document sections
- Basic access-control logic
- Automated test for document access behavior

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Tiptap rich-text editor
- Prisma
- SQLite
- Vitest

## Local Setup

Clone or download the project, then run:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Open : http://localhost:3000
If port 3000 is already in use, use the URL printed by Next.js.

## Run Tests  
npm test

## File Upload Support

Supported upload types:

.txt
.md

Uploaded files are converted into editable LightDocs documents. The filename becomes the document title.

Reviewer Flow
Log in as Alice.
Create a document.
Rename it and add formatted content.
Click Save.
Refresh and confirm the document persists.
Share the document with bob@example.com.
Switch to Bob.
Confirm the document appears under “Shared with me.”
Open it and confirm Bob can see the saved content.
Switch to Carla.
Confirm Carla cannot see Alice’s document unless it was shared with her.
Upload a .txt or .md file and confirm it becomes an editable document.
Known Limitations
Authentication is mocked with seeded users.
Documents save manually using the Save button.
Shared users currently have editor access.
There is no viewer-only role yet.
There is no real-time collaboration.
There are no comments or suggestions.
There is no version history.
Upload supports only .txt and .md.