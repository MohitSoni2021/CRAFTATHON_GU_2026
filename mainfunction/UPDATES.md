# Features and Updates Log

## [Emergency SOS Network] - 2026-01-10
### Features
- **One-Tap Panic Button**: Floating button on the bottom-right.
- **Long-Press Activation**: Hold for 3 seconds to prevent accidental triggers.
- **Geolocation Tracking**: Captures user's exact coordinates.
- **SMS Alerts**: Sends emergency SMS to all saved SOS contacts via Twilio.

### Backend Changes
- **New Model Field**: `User.sosContacts` and `User.emergencySettings`.
- **New Route**: `POST /api/sos/alert`.
- **Controller**: `sosController.js` handles logic.

### Frontend Changes
- **Global Component**: `SOSButton.tsx` injected in `layout.tsx`.
- **Visual Feedback**: Pulse animation and status updates (Sending -> Sent).

## [Voice Assistant Persona Update] - 2026-01-10
### Features
- **Voice Navigation Guide**: The AI assistant now has a specific persona to help users navigate the platform.
- **Accessibility**: Optimized for elderly users with slow, clear speech and simple instructions.
- **On-Demand Help**: Users can ask "Help me navigate" or "Where am I?" for guidance.
- **New Endpoint**: `/api/ai/guide` handles general voice queries using a custom system prompt.

### How to Test
1.  Click the blue "Robot" icon (Voice Assistant).
2.  Say "Help me navigate" or "Explain this page".
3.  The assistant will respond with voice instructions.
