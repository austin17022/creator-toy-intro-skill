// Threads on the desktop web, dark mode: the profile column in the middle,
// the name and bio with the picture on the right, then the posts. Laid out on
// a 1920 x 1440 workspace in UI px (1 UI px = 1 mm in the 3D world); each
// panel [x, y, w, h] becomes its own glass slab. The theme contract is
// themes/x-desktop/layout.js's.
export const UI_W = 1920;
export const UI_H = 1440;
export const UI_SCALE = 2;

const MX = 620, MW = 680; // the profile column
export const PANELS = {
  nav: [300, 0, 240, 1440],
  header: [MX, 0, MW, 64],
  info: [MX, 64, MW, 404],
  tabs: [MX, 468, MW, 56],
  pinned: [MX, 524, MW, 500],
  retro: [MX, 1024, MW, 416],
  side: [1350, 0, 300, 1440],
};
// the profile picture: right of the name, as Threads sets it
export const AVATAR = { c: [MX + MW - 28 - 66, 64 + 30 + 66], d: 132, ring: 4 };
// a post: its picture or video under its text, right of the author's picture
export const CARD = { x: 72, y: 118, w: 560, coverH: 315 };
export const ACTIONS_Y = 462; // the action row (relative to the slab)
export const ACTION_X = [0, 96, 192, 288]; // like, reply, repost, share
export const VIEWS_X = 470; // the post's views, at the row's right
export const ACCENT = "#F3F5F7";

const P = PANELS.pinned;
const second = [P[0], P[1] + P[3] + 24, P[2], P[3]];
export const ANCHORS = {
  pinnedCover: [P[0] + CARD.x, P[1] + CARD.y, CARD.w, CARD.coverH],
  count: [P[0] + CARD.x + VIEWS_X, P[1] + ACTIONS_Y],
  second,
  secondCover: [second[0] + CARD.x, second[1] + CARD.y, CARD.w, CARD.coverH],
};
