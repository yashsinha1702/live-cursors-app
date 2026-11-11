# Live Cursors

A real-time multiplayer cursor app. Open it in several browser tabs or on several machines, pick a name, and each person's mouse cursor shows up live on everyone else's screen.

Built with a **Node.js WebSocket server** and a **React (Vite) client**.

## How it works

```
 Browser A                      Server :8000                    Browser B
 ─────────                      ────────────                    ─────────
 connect ws://…?username=A ──►  assign uuid, add to users  ◄── connect ws://…?username=B
 mousemove (throttled 50ms)
 send {"x":340,"y":120} ──────► users[uuidA].state = {x,y}
                                broadcast(users) ──────────────► re-render cursors
 re-render cursors ◄────────────────────────────┘
```

1. **Login.** The client asks for a username, then opens a WebSocket to `ws://127.0.0.1:8000?username=<name>`.
2. **Connect.** The server reads the username from the query string, gives the connection a `uuid`, and stores it in `connections` (the sockets) and `users` (name plus `{x, y}` state).
3. **Move.** The client listens to `mousemove`, throttles it to one message per 50 ms with `lodash.throttle`, and sends `{x, y}` as JSON.
4. **Broadcast.** The server updates that user's state and sends the **entire `users` map** to every connected client.
5. **Render.** Each client draws a `<Cursor>` per user. `perfect-cursors` interpolates between updates so cursors glide smoothly instead of jumping.
6. **Disconnect.** When a socket closes, the server removes the user and broadcasts again, so their cursor disappears.

## Project structure

```
live-cursors-app/
├── server/
│   └── index.js            # HTTP + WebSocket server (ws, uuid)
└── client/
    └── src/
        ├── App.jsx         # shows Login until a username is set, then Home
        ├── Home.jsx        # WebSocket connection, mouse tracking, cursor rendering
        ├── components/
        │   ├── Login.jsx   # username form
        │   └── Cursor.jsx  # SVG cursor, animated via perfect-cursors
        └── hooks/
            └── useCursor.jsx  # usePerfectCursor hook
```

## Running locally

Requires Node.js 18+.

**1. Start the server** (port 8000):

```bash
cd server
npm install
node index.js
```

**2. Start the client** (port 5173):

```bash
cd client
npm install
npm run dev
```

**3.** Open http://localhost:5173 in two or more tabs, enter a different name in each, and move your mouse.

## Tech stack

| Part   | Libraries |
|--------|-----------|
| Server | [`ws`](https://github.com/websockets/ws), [`uuid`](https://github.com/uuidjs/uuid) |
| Client | React, Vite, [`react-use-websocket`](https://github.com/robtaussig/react-use-websocket), [`lodash.throttle`](https://www.npmjs.com/package/lodash.throttle), [`perfect-cursors`](https://github.com/steveruizok/perfect-cursors) |

## Notes

- `react-use-websocket` ships only as CommonJS, so under Vite 8 the hook is at `module.default`. `Home.jsx` unwraps it with `useWebSocketModule.default ?? useWebSocketModule`.
- The server keeps all state in memory, so restarting it clears all users.
