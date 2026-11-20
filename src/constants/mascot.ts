/**
 * Official Mascot Visual Assets
 * Character: 3D Baby Lion with Fluffy Orange Mane & Leather Shoulder Satchel
 */
export const MASCOT_ASSETS = {
  standingFront: '/clone-assets/mascot/mascot_standing_front.png',
  standingThreeQuarter: '/clone-assets/mascot/mascot_standing_three_quarter.png',
  standingSide: '/clone-assets/mascot/mascot_standing_side.png',
  standingBack: '/clone-assets/mascot/mascot_standing_back.png',
  sittingWink: '/clone-assets/mascot/mascot_sitting_wink.png',
  sittingThinking: '/clone-assets/mascot/mascot_sitting_thinking.png',
  sittingSurprised: '/clone-assets/mascot/mascot_sitting_surprised.png',
  // 2x Retina assets
  standingFront2x: '/clone-assets/mascot/mascot_standing_front_2x.png',
  standingThreeQuarter2x: '/clone-assets/mascot/mascot_standing_three_quarter_2x.png',
  standingSide2x: '/clone-assets/mascot/mascot_standing_side_2x.png',
  standingBack2x: '/clone-assets/mascot/mascot_standing_back_2x.png',
  sittingWink2x: '/clone-assets/mascot/mascot_sitting_wink_2x.png',
  sittingThinking2x: '/clone-assets/mascot/mascot_sitting_thinking_2x.png',
  sittingSurprised2x: '/clone-assets/mascot/mascot_sitting_surprised_2x.png',
} as const

export type MascotPose = keyof typeof MASCOT_ASSETS
