import { Asset } from 'expo-asset';

import { BOOKS } from '@/data/books';

/**
 * Expo UI's SwiftUI `Image` reads `file://` URIs, so every bundled image is
 * downloaded to the cache once at startup and looked up synchronously after.
 */
const uris: Record<string, string> = {};

const EXTRA = {
  wood: require('@/assets/shelf-wood.jpg'),
  avatar: require('@/assets/avatar.png'),
};

export async function preloadImages() {
  const entries: [string, number][] = [
    ...Object.values(BOOKS).map((b) => [b.id, b.cover] as [string, number]),
    ...Object.entries(EXTRA),
  ];
  await Promise.all(
    entries.map(async ([key, mod]) => {
      const [asset] = await Asset.loadAsync(mod);
      uris[key] = asset.localUri ?? asset.uri;
    })
  );
}

export function imageUri(key: string): string | undefined {
  return uris[key];
}
