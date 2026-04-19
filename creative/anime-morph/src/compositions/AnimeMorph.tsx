/**
 * AnimeMorph — master composition.
 *
 * Layout (735 frames @ 30fps = 24.5 seconds):
 *
 *   Scene 01 Real          :  0 ..  59  (60 frames)
 *   Transition 1→2         : 60 ..  74  (15 frames)
 *   Scene 02 Naruto        : 75 .. 134
 *   Transition 2→3         :135 .. 149
 *   Scene 03 One Piece     :150 .. 209
 *   Transition 3→4         :210 .. 224
 *   Scene 04 DBZ           :225 .. 284
 *   Transition 4→5         :285 .. 299
 *   Scene 05 Bleach        :300 .. 359
 *   Transition 5→6         :360 .. 374
 *   Scene 06 Demon Slayer  :375 .. 434
 *   Transition 6→7         :435 .. 449
 *   Scene 07 JJK           :450 .. 509
 *   Transition 7→8         :510 .. 524
 *   Scene 08 MHA           :525 .. 584
 *   Transition 8→9         :585 .. 599
 *   Scene 09 Solo Leveling :600 .. 659
 *   Transition 9→10        :660 .. 674
 *   Scene 10 Final         :675 .. 734
 */
import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENE_CONFIGS, SCENE_FRAMES, TRANSITION_FRAMES } from '../config/scenes';
import { TransitionPulse } from '../components/TransitionPulse';

import { Scene01AOT }          from '../scenes/Scene01Real';
import { Scene02Naruto }       from '../scenes/Scene02Naruto';
import { Scene03OnePiece }     from '../scenes/Scene03OnePiece';
import { Scene04DBZ }          from '../scenes/Scene04DBZ';
import { Scene05Bleach }       from '../scenes/Scene05Bleach';
import { Scene06DemonSlayer }  from '../scenes/Scene06DemonSlayer';
import { Scene07JJK }          from '../scenes/Scene07JJK';
import { Scene08MHA }          from '../scenes/Scene08MHA';
import { Scene09SoloLeveling } from '../scenes/Scene09SoloLeveling';
import { Scene10Final }        from '../scenes/Scene10Final';

const STEP = SCENE_FRAMES + TRANSITION_FRAMES; // 75 frames per scene slot

const SCENE_COMPONENTS = [
  Scene01AOT,
  Scene02Naruto,
  Scene03OnePiece,
  Scene04DBZ,
  Scene05Bleach,
  Scene06DemonSlayer,
  Scene07JJK,
  Scene08MHA,
  Scene09SoloLeveling,
  Scene10Final,
] as const;

export const AnimeMorph: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000000' }}>

      {/* ── Scenes ─────────────────────────────────────────────────────── */}
      {SCENE_COMPONENTS.map((SceneComponent, i) => (
        <Sequence
          key={`scene-${i}`}
          from={i * STEP}
          durationInFrames={SCENE_FRAMES}
          name={SCENE_CONFIGS[i].label}
        >
          <SceneComponent />
        </Sequence>
      ))}

      {/* ── Transitions ────────────────────────────────────────────────── */}
      {SCENE_CONFIGS.slice(0, -1).map((cfg, i) => (
        <Sequence
          key={`transition-${i}`}
          from={i * STEP + SCENE_FRAMES}
          durationInFrames={TRANSITION_FRAMES}
          name={`Transition ${i + 1}→${i + 2}`}
        >
          <TransitionPulse
            durationInFrames={TRANSITION_FRAMES}
            color={cfg.transitionColor ?? '#1de5ff'}
            color2="#ffffff"
          />
        </Sequence>
      ))}

    </AbsoluteFill>
  );
};
