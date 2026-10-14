# BookShelf

A recreation of the "Collections" book app concept (Klickpin pin 852728510751447010) in Expo SDK 57,
with every screen drawn by native SwiftUI through `@expo/ui`. iOS only. See [PLAN.md](PLAN.md) for the
original breakdown of the video.

## Run

```bash
npm install
LANG=en_US.UTF-8 npx expo run:ios
```

`LANG` must be UTF-8 or CocoaPods fails during `pod install`.

## Where things live

| Path | What |
|------|------|
| `src/app/_layout.tsx` | Tabs (cross-fade) + preloads cover images |
| `src/components/FloatingTabBar.tsx` | Dark floating capsule; the selection disc glides with `matchedGeometryEffect` |
| `src/app/collections.tsx` | List ⇄ detail state machine (`closed → lift → fly → open → land → return`) |
| `src/features/collections/HeroLayer.tsx` | The three covers that fly between the card fan and the shelf |
| `src/features/collections/Shelf.tsx` | Looping, snapping shelf on the wood plank |
| `src/features/collections/CollectionDetail.tsx` | Detail sheet, staggered reveal, pull-down to dismiss |
| `scripts/generate-covers.py` | Generates the original placeholder cover art in `assets/covers` |
| `plugins/with-scene-lifecycle.js` | Adopts the UIKit scene life cycle the iOS 27 SDK requires (backport of the SDK 58 template) |

## Expo UI notes learned the hard way

- Expo UI animates **modifier changes** inside `animation(…, value)`, but not views being inserted or
  removed. That rules out SwiftUI's `matchedGeometryEffect` across two screens, so the hero is a
  dedicated overlay whose frame, offset and rotation are animated.
- A view whose **modifier list changes shape** is rebuilt, not animated. Keep the chain identical and
  vary only values (see `Cover.tsx`).
- `onGeometryChange` reports global frames; the overlay subtracts its own origin.
- `scrollPosition`'s initial value is ignored, and setting the same value again does nothing. The shelf
  starts at `null` and jumps to the middle copy in `onAppear`.
