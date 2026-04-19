/**
 * index.tsx — Remotion entry point.
 * Registers the VideoRoot so `remotion studio` and `remotion render` can find it.
 */
import { registerRoot } from 'remotion';
import { VideoRoot } from './VideoRoot';

registerRoot(VideoRoot);
