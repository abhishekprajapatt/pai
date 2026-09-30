# Prajapatt AI Client

This is the frontend for the Pratibha Vikas Foundation website.

It contains the public pages, member-facing screens, admin dashboard, forms, and the UI used to talk to the backend APIs.

## What is inside

- Public website pages
- Member login and registration flow
- Donation and contact forms
- Admin dashboard screens
- API integrations with the Java backend

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## Environment variables

Create a `.env.local` file in this folder if needed and add values like:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Use your actual backend URL and keep any secret values in the hosting platform instead of committing them to the repo.

### Custom AI voice

Use Voicebox as the default local/free voice provider. Start the Voicebox app locally and point the app to it:

```bash
VOICEBOX_BASE_URL=http://127.0.0.1:17493
VOICEBOX_PROFILE_ID=your-voicebox-profile-id
VOICEBOX_PROFILE=Jarvis
VOICEBOX_ENGINE=qwen3_tts
TTS_MODEL=voicebox
NEXT_PUBLIC_TTS_PROVIDER=voicebox
NEXT_PUBLIC_VOICEBOX_PROFILE_ID=your-voicebox-profile-id
NEXT_PUBLIC_VOICEBOX_PROFILE=Jarvis
```

If Voicebox is not running, the app falls back to the browser speech engine automatically. This keeps the client fast and keeps the voice flow free of redundant paid API calls.

## Notes

- This is a frontend project only.
- Business logic and database work happen in the Java backend under the `server` folder.
- Keep keys and environment values private.

## Useful scripts

```bash
npm run dev
npm run build
npm run start
```

add in TimeFocus.tsx this all things , no tui templets only , remove faltu code in TimeFoucs.tsx
