// Threads on the desktop web, dark mode, as HTML: the profile page and a single
// post, filled from film.json. No platform logo ships with the theme: film.json
// "branding.logo" may supply one from the creator's own copy.
//
//   profilePage({ film, L, asset, pinned })     → the whole page, UI_W x UI_H
//   postPage({ film, L, asset, post, cover })   → one post on its own canvas
import { ICON as XI } from "../x-desktop/page.js";

export const STRINGS = {
  "zh-Hant": {
    nav: ["為你推薦", "搜尋", "訊息", "動態", "個人檔案", "洞察報告"], post: "新串文",
    follow: "追蹤", mention: "提及", followers: "位粉絲", views: "次瀏覽（近 30 天）",
    tabs: ["串文", "回覆", "影音內容", "轉發"], pinned: "已釘選", postViews: "次瀏覽",
    search: "搜尋", suggest: "追蹤建議",
  },
};
STRINGS["zh-Hans"] = { ...STRINGS["zh-Hant"], nav: ["为你推荐", "搜索", "消息", "动态", "个人资料", "洞察报告"], post: "新串文", follow: "关注", mention: "提及", followers: "位粉丝", tabs: ["串文", "回复", "影音内容", "转发"], pinned: "已置顶", postViews: "次浏览", search: "搜索", suggest: "关注建议" };

const ICON = {
  ...XI,
  heart: XI.like,
  bubble: '<path d="M20 11.5c0 4.1-3.6 7.5-8 7.5-1.2 0-2.4-.3-3.4-.7L4 19.5l1.2-3.8C4.4 14.5 4 13 4 11.5 4 7.4 7.6 4 12 4s8 3.4 8 7.5z"/>',
  loop: '<path d="M17 4l3 3-3 3"/><path d="M20 7H9a5 5 0 0 0-5 5"/><path d="M7 20l-3-3 3-3"/><path d="M4 17h11a5 5 0 0 0 5-5"/>',
  send: '<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
  insights: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  feed: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>',
};

function kit({ film }) {
  const S = STRINGS[film.language] ?? STRINGS["zh-Hant"];
  const B = film.branding ?? {};
  const icon = (n, s = 26, c = "currentColor", w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${n === "logo" ? B.logo ?? "" : ICON[n]}</svg>`;
  return { S, icon, pr: film.profile };
}

const css = (L, avatar) => `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${L.UI_W}px; height: ${L.UI_H}px; background: #0A0A0A; overflow: hidden; }
body { font-family: "PingFang TC", "PingFang SC", -apple-system, "Helvetica Neue", sans-serif; color: #F3F5F7; -webkit-font-smoothing: antialiased; }
.panel { position: absolute; overflow: hidden; background: #0A0A0A; }
.col { background: #181818; }
.grey { color: #777; }
.socket { position: absolute; border-radius: 50%; background: radial-gradient(circle at 50% 42%, #0b0c0e 0 58%, #020203 72%); box-shadow: inset 0 10px 22px rgba(0,0,0,.95), 0 0 0 2px #262626; }
.nav-item { position: absolute; left: 14px; display: flex; align-items: center; gap: 16px; font-size: 19px; height: 46px; padding: 0 14px; color: #CFCFCF; }
.nav-item.on { color: #F3F5F7; font-weight: 700; background: #1E1E1E; border-radius: 12px; width: 212px; }
.post-btn { position: absolute; left: 14px; width: 212px; height: 50px; border-radius: 25px; background: #F3F5F7; color: #0A0A0A; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.hdr { position: absolute; left: 0; right: 0; top: 0; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 700; }
.name { position: absolute; left: 28px; font-size: 28px; font-weight: 800; letter-spacing: .2px; }
.line { position: absolute; left: 28px; font-size: 17px; line-height: 25px; }
.chips { position: absolute; left: 28px; display: flex; gap: 10px; }
.chip { height: 34px; padding: 0 14px; border: 1px solid #333; border-radius: 17px; font-size: 15px; display: flex; align-items: center; gap: 6px; color: #F3F5F7; }
.btns { position: absolute; left: 28px; right: 28px; display: flex; gap: 12px; }
.btn { flex: 1; height: 42px; border-radius: 12px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1px solid #333; }
.btn.main { background: #F3F5F7; color: #0A0A0A; border: 0; }
.tabs { display: flex; height: 56px; }
.tab { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 17px; color: #777; position: relative; font-weight: 600; }
.tab.on { color: #F3F5F7; }
.tab.on::after { content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #F3F5F7; }
.sep { position: absolute; left: 0; width: 100%; height: 1px; background: #2D2D2D; }
.av { position: absolute; left: 20px; top: 22px; width: 40px; height: 40px; border-radius: 50%; background: url(${avatar}) center/cover; }
.who { position: absolute; left: 72px; top: 22px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.pinlab { position: absolute; left: 72px; top: 0; font-size: 13px; color: #777; display: flex; align-items: center; gap: 6px; }
.txt { position: absolute; left: 72px; top: 50px; width: 560px; font-size: 16px; line-height: 24px; }
.card { position: absolute; left: ${L.CARD.x}px; top: ${L.CARD.y}px; width: ${L.CARD.w}px; border: 1px solid #2D2D2D; border-radius: 14px; overflow: hidden; }
.cover { width: 100%; height: ${L.CARD.coverH}px; position: relative; }
.acts { position: absolute; top: ${L.ACTIONS_Y - 12}px; left: ${L.CARD.x}px; width: ${L.CARD.w}px; height: 24px; font-size: 14px; color: #CFCFCF; }
.acts span { position: absolute; display: flex; align-items: center; gap: 6px; height: 24px; }
.sk i { display: block; background: #1E1E1E; border-radius: 6px; }
`;
const px = (r) => `left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px;`;

// film.json post.counts are X's order (replies, reposts, likes, views); Threads shows like, reply, repost, share
function postBody({ film, L, post, pinned, cover }) {
  const { S, icon, pr } = kit({ film });
  const [replies, reposts, likes, views] = post.counts;
  const row = [["heart", likes], ["bubble", replies], ["loop", reposts], ["send", post.shares ?? ""]];
  const actions = `<div class="acts">${row.map(([n, c], i) => `<span style="left:${L.ACTION_X[i]}px">${icon(n, 20, "#CFCFCF", 1.7)}${c}</span>`).join("")}
    <span style="left:${L.VIEWS_X - 40}px;color:#777">${views} ${S.postViews}</span></div>`;
  const play = post.kind === "video" ? `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="#fff"/></svg></div>` : "";
  const title = post.title.length > 30 ? post.title.slice(0, 30) + "…" : post.title;
  return `${pinned && post.pinned !== false ? `<div class="pinlab" style="top:2px">${icon("pin", 13, "#777", 2)}${S.pinned}</div>` : ""}
    <div class="av"></div>
    <div class="who"><b>${pr.handle}</b><span class="grey">${post.date}</span></div>
    <div class="txt">${title}</div>
    <div class="card">${cover}${play}</div>
    ${actions}`;
}

export const SOCKET_COVER = `<div class="cover" style="background:#050506;box-shadow:inset 0 8px 24px #000"></div>`;
export const pictureCover = (asset, path) => `<div class="cover" style="background:url(${asset(path)}) center/cover"></div>`;

export function profilePage({ film, L, asset, pinned }) {
  const { S, icon, pr } = kit({ film });
  const P = L.PANELS, av = L.AVATAR;
  const socket = `<div class="socket" style="left:${av.c[0] - P.info[0] - av.d / 2 - 2}px;top:${av.c[1] - P.info[1] - av.d / 2 - 2}px;width:${av.d + 4}px;height:${av.d + 4}px"></div>`;
  const nav = [["feed", 0], ["search", 1], ["send", 2], ["heart", 3], ["user", 4], ["insights", 5]];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(L, asset(pr.avatar))}</style></head><body>
<section class="panel" style="${px(P.nav)}">
  <div style="position:absolute;left:28px;top:20px">${icon("logo", 34)}</div>
  ${nav.map(([n, i]) => `<div class="nav-item${i === 4 ? " on" : ""}" style="top:${92 + i * 56}px">${icon(n, 24, "currentColor", i === 4 ? 2.3 : 1.8)}${S.nav[i]}</div>`).join("")}
  <div class="post-btn" style="top:1360px">＋ ${S.post}</div>
</section>
<section class="panel" style="${px(P.header)}"><div class="hdr">${pr.handle}</div></section>
<section class="panel col" style="${px(P.info)};border-radius:28px 28px 0 0;border:1px solid #2D2D2D;border-bottom:0">
  ${socket}
  <div class="name" style="top:34px;width:500px;line-height:36px">${pr.name}</div>
  <div class="line" style="top:84px">${pr.handle} <span class="grey" style="font-size:14px">${icon("at", 14, "#777", 2)}</span></div>
  <div class="line" style="top:126px">${pr.bio.join("<br>")}</div>
  ${pr.meta?.link ? `<div class="line" style="top:240px;font-weight:700">${pr.meta.link}</div>` : ""}
  ${pr.tags?.length ? `<div class="chips" style="top:282px">${pr.tags.map((t) => `<div class="chip">${t}</div>`).join("")}</div>` : ""}
  <div class="line grey" style="top:336px">${pr.followers} ${S.followers}${pr.views ? ` · ${pr.views} ${S.views}` : ""}</div>
</section>
<section class="panel col" style="${px(P.tabs)};border-left:1px solid #2D2D2D;border-right:1px solid #2D2D2D"><div class="tabs">${S.tabs.map((t, i) => `<div class="tab${i ? "" : " on"}">${t}</div>`).join("")}</div><div class="sep" style="bottom:0"></div></section>
<section class="panel col" style="${px(P.pinned)};border-left:1px solid #2D2D2D;border-right:1px solid #2D2D2D">${postBody({ film, L, post: pinned.post, pinned: true, cover: pinned.cover })}<div class="sep" style="bottom:0"></div></section>
<section class="panel col" style="${px(P.retro)};border-left:1px solid #2D2D2D;border-right:1px solid #2D2D2D">
  <div class="av"></div>
  <div style="position:absolute;left:72px;top:26px" class="sk">${[[160, 14], [520, 14], [480, 14], [360, 14]].map(([w, h]) => `<i style="width:${w}px;height:${h}px;margin-bottom:14px"></i>`).join("")}</div>
  <div class="sk" style="position:absolute;left:72px;top:150px"><i style="width:560px;height:240px;border-radius:14px"></i></div>
</section>
<section class="panel" style="${px(P.side)}">
  <div style="position:absolute;left:0;top:14px;width:300px;height:46px;border-radius:23px;background:#1E1E1E;display:flex;align-items:center;gap:10px;padding-left:16px;color:#777;font-size:16px">${icon("search", 18, "#777")}${S.search}</div>
  <div style="position:absolute;left:4px;top:96px;font-size:19px;font-weight:700">${S.suggest}</div>
  ${[0, 1, 2, 3].map((i) => `<div class="sk" style="position:absolute;left:4px;top:${140 + i * 120}px;display:flex;gap:12px"><i style="width:44px;height:44px;border-radius:50%"></i><div><i style="width:120px;height:13px;margin-bottom:8px"></i><i style="width:90px;height:11px;margin-bottom:8px"></i><i style="width:200px;height:11px"></i></div></div>`).join("")}
</section>
</body></html>`;
}

export function postPage({ film, L, asset, post, cover, w, h }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(L, asset(film.profile.avatar))} html, body { width: ${w}px; height: ${h}px; }</style></head><body>
<section class="panel col" style="left:0;top:0;width:${w}px;height:${h}px">${postBody({ film, L, post, pinned: false, cover })}</section>
</body></html>`;
}
