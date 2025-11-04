# RecoRead

Read smarter. Keep it yours.

RecoRead is a clean, distraction‑free companion for your reading life. Build your library, track progress, capture insights, and turn notes into concise summaries — all in one place.

- Frontend: React (Vite), Tailwind CSS
- Backend: Spring Boot (Java 21), REST API
- Database: MySQL (managed)

---
live demo-https://recoread.netlify.app/
## Features

- Private library
  - Add books in seconds via Google Books (server‑side proxy) or manual entry
  - Rich metadata: title, author, cover, publisher, page count, published date
  - Tags for organization, with fast filtering and sorting

- Per‑user book numbers
  - Friendly “Book #1, #2, …” numbering that starts at 1 for each user
  - Global technical IDs remain stable for integrity

- Smart search
  - Server‑side Google Books proxy to avoid CORS and rate‑limit issues
  - Debounced queries, light caching, and graceful error handling

- Reading workflow
  - Track progress by page or percent with a compact progress bar on cards
  - Add reading events: OPENED, PROGRESS, FINISHED
  - Optional notes and (future‑ready) duration on events
  - Latest reading state shown on the book detail and in the card

- Recent activity
  - Compact, scrollable widget of your latest reading events across all books
  - Sticky rail on desktop; on mobile, Recent Activity appears before the grid to boost re‑engagement

- AI summaries
  - Generate concise, readable takeaways from your notes and highlights

- Recommendations
  - Suggestions shaped by your topics, tags, and reading patterns

---

## Screenshots

- Library grid with Recent Activity rail (desktop)  
 <img width="684" height="430" alt="library" src="https://github.com/user-attachments/assets/56beabe3-cedf-4c2a-b776-a6b38787d5fa" />


- Book detail with progress 
 <img width="684" height="430" alt="library" src="https://github.com/user-attachments/assets/1ebca968-ef75-46f1-abf5-6bc97a985efb" />


- Add Book via Google Books search 
 <img width="536" height="401" alt="search " src="https://github.com/user-attachments/assets/c650c7b9-8bf8-4dd1-82b5-e7cea39e3cb7" />


- Mobile layout with Recent Activity before the grid  
 <img width="225" height="354" alt="mobile view" src="https://github.com/user-attachments/assets/bf153678-a4a1-4aef-bfe0-1cca2427dba7" />


---

## Why RecoRead?

Thoughtfully designed features that help you read better and remember more — without giving up your privacy.

- Account‑first: your library is yours, across devices
- Smart search: add accurate books fast
- AI summaries: turn insights into action
- Personal recommendations: discover what’s next

---

## Quick start (at a glance)

- Sign up or sign in
- Add a book (search or manual)
- Start reading, log progress, jot a note
- Generate an AI summary when you’re ready
- Explore recommendations tailored to your tags and taste

---

Made by a reader for readers. Enjoy!
