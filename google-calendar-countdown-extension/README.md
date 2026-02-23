# Google Calendar Countdown Extension

A lightweight Chrome extension that adds a `Countdown` line to Google Calendar event details, showing:
- `Today`
- `X days until this event`
- `X days since this event`

## Install or Refresh (Unpacked)

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. If already installed, click **Reload** on **Google Calendar Countdown**.
4. If not installed, click **Load unpacked** and select this folder:
   `google-calendar-countdown-extension`.
5. Hard refresh Calendar tab (`Cmd+Shift+R` on macOS).

## How It Works

- Runs as a content script on `calendar.google.com`.
- Watches for event detail dialogs/page updates with a mutation observer.
- Extracts the event start date from:
  - `eventedit` links with `dates=...` (primary)
  - `time[datetime]` elements (fallback)
- Injects one styled row beneath event info content.

## If You Still Do Not See It

1. Open an event by clicking it once (the details popover/dialog).
2. In `chrome://extensions`, click **Errors** for this extension and check for runtime errors.
3. Verify URL starts with `https://calendar.google.com/`.

## Notes

- Google Calendar's DOM can change over time. If the countdown disappears after a Calendar UI update, selector logic in `content.js` may need adjustment.
- No external APIs, no tracking, and no network requests are used.
