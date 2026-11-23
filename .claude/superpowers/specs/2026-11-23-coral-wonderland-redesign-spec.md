# Design Specification: Redesign 3D Fantasy Island — Xứ Sở San Hô (Coral Wonderland)

- **Date:** 2026-11-23
- **Status:** Proposed / Ready for Review
- **Role:** Senior 3D Environment & Asset Artist
- **Target Asset:** `src/public/assets/planets/planet_coral_wonderland.png` (and WebP)
- **Reference Standards:** `planet_melody_island.png`, `planet_arabian_nights.png`

---

## 1. Phân Tích Hiện Trạng & Vấn Đề Lệch Tone

Khi đặt Xứ Sở San Hô (Coral Wonderland) cạnh 2 hòn đảo mới được nâng cấp (Hòn Đảo Giai Điệu và Ốc Đảo Ngàn Lẻ Một Đêm), sự chênh lệch chất lượng và phong cách thể hiện rất rõ ở 4 yếu tố:

| Tiêu chí | Hòn Đảo Giai Điệu & Arabian Nights (Chuẩn) | Xứ Sở San Hô (Hiện tại) | Hướng Khắc Phục (Redesign) |
|---|---|---|---|
| **Visual Hierarchy** | 3 lớp rõ ràng: Công trình trung tâm -> Địa hình/sân vườn -> Điểm nhấn tiền cảnh | Mất tiêu điểm: Lâu đài bị lấn át bởi nhà kính vòm kính bên trái và rừng san hô dày đặc | Loại bỏ nhà kính vòm kính; tôn vinh Lâu đài Vỏ Sò làm công trình cao nhất và duy nhất ở hậu cảnh |
| **Mật độ chi tiết (Clutter)** | Có khoảng nghỉ thị giác (negative space), thảm cỏ/cát thoáng đãng | Quá tải chi tiết: 114 connected components rời rạc, san hô xếp lớp nghẹt thở | Cắt giảm 35–40% chi tiết thừa; giữ 4–6 cụm san hô lớn có chủ đích, chừa khoảng trống nhìn rõ nền đá |
| **Sinh vật & Vật thể bay** | Bầu trời trong trẻo, không có vật thể thừa che khuất đường chân trời | Cá đuối bay, sứa lơ lửng, vệt bong bóng nước bay tràn lan xung quanh đảo | Loại bỏ 100% cá đuối bay, sứa bay và bóng nước trên không; chuyển sinh vật (rùa biển, cá) xuống mặt hồ nước |
| **Ánh sáng & Vật liệu** | Cinematic daylight mềm mại, đổ bóng êm, ambient occlusion tự nhiên | Màu sắc quá rực, nhiều vệt lấp lánh (sparkle/glitter) gây cảm giác đồ họa 2D minh họa | Áp dụng Stylized 3D PBR: men gốm/vỏ sò xà cừ mịn màng, nước turquoise trong suốt phản chiếu nhẹ |

---

## 2. Thiết Kế Bố Cục 3 Tầng (3-Tier Composition)

```
+-----------------------------------------------------------+
|                      [BẦU TRỜI TRONG SUỐT]                 |
|                                                           |
|             BACKGROUND: LÂU ĐÀI VỎ SÒ HOÀNG GIA           |
|            - Mái vòm vỏ sò hồng đào & vàng kem            |
|            - Tháp ốc xoắn thanh thoát                     |
|            - Cửa sổ vòm phát sáng vàng hổ phách           |
|                                                           |
|       MIDGROUND: CẦU THANG ĐÁ & THÁC NƯỚC TURQUOISE       |
|    - Cầu thang đá kem uốn lượn dẫn từ hồ lên lâu đài       |
|    - Thác nước ngọc lam chảy tràn tự nhiên bên mạn phải   |
|    - 4 đến 6 cụm san hô lớn (lavender, hồng san hô)       |
|    - Khoảng đất trống lộ rõ thảm địa hình đá cát          |
|                                                           |
|           FOREGROUND: HỒ NƯỚC NGỌC LAM & SINH VẬT         |
|         - Hồ nước turquoise trong veo (30-35% diện tích)  |
|         - 1 Chú rùa biển nhỏ bơi lội thanh bình           |
|         - Vài chú cá nhiệt đới bơi dưới mặt nước          |
|         - Vài cụm sao biển và ngọc trai viền mép hồ       |
|                                                           |
|          ĐÁY ĐẢO NỔI: KHỐI ĐÁ TỰ NHIÊN HÌNH NÓN NGƯỢC     |
|          - Vách đá san hô gồ ghề, rễ cây và tinh thể ngọc  |
+-----------------------------------------------------------+
```

---

## 3. Hệ Màu Chuẩn (Color Palette & Lighting)

- **Turquoise Blue (`#06b6d4`, `#22d3ee`):** Dành cho mặt hồ nước, dòng thác và làn sóng viền.
- **Coral Pink (`#f472b6`, `#fb7185`):** Dành cho các mái vòm vỏ sò và cụm san hô chính.
- **Warm Cream & Sandy Peach (`#fef3c7`, `#fde68a`):** Dành cho tường lâu đài, bậc thang và nền đá.
- **Soft Lavender (`#c084fc`):** Điểm nhấn fantasy cho một vài nhánh san hô sừng hươu quý hiếm.
- **Amber Glow (`#f59e0b`):** Ánh sáng ấm cúng phát ra từ các ô cửa sổ lâu đài.

---

## 4. Master AI Generation Prompt (Production-Grade)

Dành cho Midjourney v6 / DALL-E 3 (ChatGPT Plus) / Flux.1:

```text
A premium stylized 3D miniature floating island diorama, "Whimsical Coral Kingdom", isolated on a seamless completely flat pure white background (#FFFFFF). 

Composition and Visual Hierarchy:
- BACKGROUND (Focal point): An elegant, grand fantasy castle sculpted from giant pastel peach-pink and warm cream seashell structures, featuring spiraling nautilus spires, smooth porcelain shell textures, and arched windows glowing with soft warm amber interior light. Clean, majestic silhouette against the open sky.
- MIDGROUND: A gently curving stone staircase in light warm ivory ascending from the lagoon to the castle entrance. On the right cliff, a small turquoise waterfall cascades down smoothly over natural sea-rock ledges into the pool. 4 to 6 deliberate, sculpted coral clusters in soft lavender and coral pink, leaving ample breathing room and negative space to show the natural sandy rock terrain.
- FOREGROUND: A crystal-clear tranquil turquoise lagoon covering 30% of the island's surface. One adorable small stylized sea turtle happily swimming near the surface, accompanied by 3 to 4 tiny vibrant tropical fish. A few smooth decorative pearls and pastel starfish resting naturally at the water's sandy edge.
- ISLAND BASE: A tapered floating fantasy rock mass beneath the island with layered coral stone, eroded sea cavities, and subtle embedded glowing aquamarine crystals.

Style & Render:
- High-end stylized 3D game environment art, orthographic isometric 3/4 camera angle, soft cinematic daylight with gentle natural ambient occlusion and smooth contact shadows, translucent water with realistic sub-surface scattering, clean rounded geometry, zero dark outlines, zero plastic gloss.
- Absolutely NO flying stingrays, NO hovering jellyfish in the sky, NO floating bubbles outside the island, NO greenhouse domes, NO glitter or lens flares, NO ground shadows on the white backdrop. Entire island fits comfortably within the 1:1 frame with safe margins. --ar 1:1 --v 6.1 --style raw
```
