# BookShelf: recreating the "Collections" book app

Reference: Klickpin pin 852728510751447010 ("9 Clever Layering Ideas"), 13 s, 744×912 @ 60 fps.
Target: Expo SDK 57 (`expo@57.0.28`), `@expo/ui@57.0.23` SwiftUI components throughout. iOS first.

## 1. What the video shows

### Screens
| # | Screen | Contents |
|---|--------|----------|
| A | **Home** (0.0 s, shown briefly) | Greeting "Hi Audrey, let's sharpen your mind with great books." with an avatar on the right; search field and filter button; "Top selections for you" in a 2-column grid of covers |
| B | **Collections** (main screen) | Centered large title "Collections"; pill search field "Search collections" and a round filter button (sliders icon); "Showing all"; vertical list of **collection cards** |
| C | **Collection detail** ("Spiritual") | Grabber at the top (it's a sheet); centered title and subtitle; "Search this collection"; **"Top books in collection shelf"**, a horizontal carousel of covers on a wooden shelf; "Showing all", a 2-column grid of covers with shadows |
| — | **Floating tab bar** | Dark capsule at the bottom with 4 icons (grid / bookmark-book / book / gear). The active tab has a lighter circular highlight. It floats over the content, so it's a Liquid Glass-style bottom accessory |

### Collection card anatomy
- Rounded rect (about 24 pt radius) with a light grey fill (#EDEDED-ish) on an off-white background (#F5F5F5)
- Top-left: clock icon and "2 Hours ago"; top-right: book icon and "93"
- Centered title (semibold) and subtitle (secondary)
- **3 covers fanned/overlapping**: the middle one sits forward, the left and right are rotated slightly (about ±4–6°), and they bleed off the card's bottom edge (clipped). This "layering" is what the pin is named for
- Collections: Spiritual (93), Finances (24), Mindful (54), and more

### Motion (the core of the piece)
1. **Tab switch Home → Collections (0.0–0.6 s):** content cross-fades out, then the cards **stagger in** top to bottom (fade + slight rise). The tab highlight slides to the bookmark icon.
2. **Card → detail (1.3–2.0 s), the hero move:** tapping "Spiritual" makes the card's 3 covers **lift out of the fan, straighten (rotation → 0), grow, and travel up** to become the first 3 books on the detail shelf. The title and subtitle morph into the detail header. The rest of the list fades and blurs out behind (frosted), and the detail rises as a sheet with a grabber. The grid below fades in late.
3. **Shelf carousel (7–12 s):** a horizontal scroll of covers sitting on a wood plank. It **loops** (Atomic Habits wraps around from the end to the start), snaps per item, and the touch indicator shows drag and fling.
4. **Detail → card dismiss (12.0–12.6 s):** the exact reverse. The sheet drags down, the grid fades, and the 3 shelf books shrink, re-rotate, and fly back into the card's fan. The list un-blurs.
5. Taps show a subtle press (scale ≈ 0.97).

## 2. Architecture

```
expo-router (file routes)
app/
  _layout.tsx            Stack + floating tab accessory
  (tabs)/_layout.tsx     NativeTabs (expo-router/unstable-native-tabs) → real UITabBar, Liquid Glass on iOS 26
  (tabs)/index.tsx       Home
  (tabs)/collections.tsx Collections list + detail (one SwiftUI Host, see below)
  (tabs)/library.tsx     placeholder
  (tabs)/settings.tsx    placeholder (Expo UI Form)
src/
  data/collections.ts    collections + books (id, title, author, cover asset)
  components/            CollectionCard, FannedCovers, Shelf, BookGrid, SearchRow
assets/covers/           cover images (generated placeholders; swap for real art)
```

### Why the hero is built inside one SwiftUI tree
The card → shelf morph needs **shared geometry across two views**. With Expo UI, the cleanest native route is to render the list and detail inside **one `<Host>`** under a `<Namespace>`, and drive it with **`matchedGeometryEffect(id, ns)`** plus **`withAnimation(spring)`**. Each cover gets the id `cover-{collectionId}-{bookId}` in both the fan and the shelf, and SwiftUI interpolates position, size, and rotation natively. That matches the video better than a navigation push, and stays 100 % native (no Reanimated shared-element layer).

- Detail is presented as an overlay in the same Host, using `zIndex`, a background `blur()` + `opacity` on the list, and a drag-to-dismiss via `offset` and gestures. Fallback if the drag feel isn't right: `BottomSheet` with `presentationDetents(['large'])` + `presentationDragIndicator('visible')`. That gives real sheet physics but loses the cross-view matched geometry, so we'd fake the hero with a snapshot.
- Shelf: `ScrollView(axis horizontal)` + `LazyHStack` + `scrollTargetLayout()` + `scrollTargetBehavior('viewAligned')`. Looping is done by repeating the data (×3) and recentering via `scrollPosition` on settle (`onScrollPhaseChange`).
- Fan: `ZStack` of 3 `Image`s with `rotationEffect`, `offset`, `shadow`, `clipShape(roundedRect)`, card `clipped()`.
- List: `ScrollView` + `LazyVStack`, staggered `onAppear` → `opacity`/`offset` with spring animation.
- Search: `TextField` (pill style via `background` + `cornerRadius`) for in-content fields; the filter button is a `Button` with `glassEffect` + SF Symbol `line.3.horizontal.decrease`.
- Grid: `Grid` / 2-column `LazyVStack` of `HStack`s, covers with `shadow`.
- Covers: `Image uiImage=` from bundled assets (resolved via `expo-asset`).
- Haptics: `expo-haptics` selection tick on card tap and shelf snap.

### Expo UI pieces confirmed in @expo/ui 57
`Host, Namespace, ScrollView, LazyVStack, LazyHStack, ZStack, HStack, VStack, Grid, Image, Text, TextField, Button, BottomSheet, TabView, GlassEffectContainer, withAnimation` and modifiers `matchedGeometryEffect, glassEffect, rotationEffect, scaleEffect, offset, blur, opacity, shadow, clipShape, clipped, scrollTargetBehavior, scrollTargetLayout, scrollPosition, onScrollPhaseChange, onTapGesture, zIndex, frame, padding, font, foregroundStyle`.

## 3. Build steps
1. **Scaffold:** `npx create-expo-app@latest BookShelf` (SDK 57, default template, expo-router), add `@expo/ui`, `expo-haptics`, then `npx expo prebuild` → dev client (Expo UI needs a native build, not Expo Go).
2. **Data + covers:** seed 4 collections × ~10 books, plus generated cover art (bold typographic covers similar to the video).
3. **Tabs:** NativeTabs with 4 SF Symbol tabs (`square.grid.2x2`, `books.vertical`, `book`, `gearshape`) to get the floating glass bar.
4. **Collections list:** header, search row, cards with the fanned covers; staggered entrance.
5. **Detail:** header, search, wooden shelf carousel (looping + snap), "Showing all" grid.
6. **Hero transition:** Namespace + matchedGeometryEffect on covers and titles, list blur/fade, spring open and close, drag-to-dismiss.
7. **Home:** greeting, avatar, search, 2-column grid.
8. **Polish:** press scale, haptics, dark mode tokens, reduce-motion (cross-fade instead of fly), run on the iOS 26 simulator and tune spring values against the video frame by frame.

## 4. Open questions / risks
- `matchedGeometryEffect` across a `ScrollView` boundary can clip mid-flight. Mitigation: render the flying covers in a top-level overlay layer during the transition.
- Android: Expo UI has a Jetpack Compose set, but this plan targets iOS first. Android would need its own pass.
- Cover art: real book covers are copyrighted, so we'll use generated placeholders.
