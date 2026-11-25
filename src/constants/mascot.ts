/**
 * Official Mascot Visual Assets
 * Character: 3D Baby Lion with Fluffy Orange Mane & Leather Shoulder Satchel
 */
export const MASCOT_ASSETS = {
  standingFront: '/clone-assets/mascot/mascot_standing_front.webp',
  standingThreeQuarter: '/clone-assets/mascot/mascot_standing_three_quarter.webp',
  standingSide: '/clone-assets/mascot/mascot_standing_side.webp',
  standingBack: '/clone-assets/mascot/mascot_standing_back.webp',
  sittingWink: '/clone-assets/mascot/mascot_sitting_wink.webp',
  sittingThinking: '/clone-assets/mascot/mascot_sitting_thinking.webp',
  sittingSurprised: '/clone-assets/mascot/mascot_sitting_surprised.webp',
  // 2x Retina assets
  standingFront2x: '/clone-assets/mascot/mascot_standing_front_2x.webp',
  standingThreeQuarter2x: '/clone-assets/mascot/mascot_standing_three_quarter_2x.webp',
  standingSide2x: '/clone-assets/mascot/mascot_standing_side_2x.webp',
  standingBack2x: '/clone-assets/mascot/mascot_standing_back_2x.webp',
  sittingWink2x: '/clone-assets/mascot/mascot_sitting_wink_2x.webp',
  sittingThinking2x: '/clone-assets/mascot/mascot_sitting_thinking_2x.webp',
  sittingSurprised2x: '/clone-assets/mascot/mascot_sitting_surprised_2x.webp',
} as const

export type MascotPose = keyof typeof MASCOT_ASSETS
