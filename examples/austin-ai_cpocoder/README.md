# 範例：Austin（Threads @ai_cpocoder）自我介紹片

26 秒，16:9，Threads 桌面版個人頁。

## 故事

1. 公仔從頭像爬出來，跳跳跳（模板 isnail-30 的開頭）
2. 80 天的樓梯：日曆從 8 月 19 日翻到 11 月 6 日，粉絲 708 → 10,965，每到一個日期掉下一階作品，公仔一階一階跳上去，最後蓋上「破萬」
3. 網站牆：8 個 Sketchry 網站 Skill 的示範影片，公仔每拍跳一格，數字停在「24 種網站 Skill」
4. 結尾：「每天實測一個 AI 用法／能抄的 Skill 都在這」＋ Sketchry 方塊＋ `sketchry.app`

## 這裡有什麼

| 檔案 | 用途 |
|------|------|
| `film.json` | 整支片的設定：分段、事件時間、鏡頭、結尾文字 |
| `toy.json`、`sculpt/austin.py` | 公仔的造型 |
| `beats/skill-stack.js` | 樓梯段 |
| `beats/sketchry-wall.js` | 網站牆段 |
| `beats/frame-count.js` | 網球段（已從片中拿掉，留著當寫法參考） |
| `recipes/prop.js` | 結尾的 Sketchry 方塊道具 |
| `music/score.py` | 配樂 |

## 沒放的東西

頭像、作品截圖、示範影片、公仔參考圖都沒放（約 40 MB，而且是個人素材）。
要自己重做，在 `assets/` 放入同名檔案：`avatar.jpg`、`toyref/`、`work/step-*.jpg`、`sketchry/*.jpg|.mp4`。

做法和每一次修正，寫在 [austin-lessons.md](../../skills/creator-toy-intro/references/austin-lessons.md)。
