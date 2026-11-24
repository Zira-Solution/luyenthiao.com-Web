# Design Specification: Redesign 3D Fantasy Island From Scratch — Ốc Đảo Nghìn Lẻ Một Đêm (Arabian Nights)

- **Date:** 2026-11-23
- **Status:** Completed & Integrated
- **Role:** Senior 3D Environment & Asset Artist
- **Target Asset:** `src/public/assets/planets/planet_arabian_nights.png` (and WebP)
- **Reference Standards:** `planet_melody_island.png`, `planet_candy_wonderland.png`, `planet_coral_wonderland.png`

---

## 1. Vấn Đề Cốt Lõi Cần Khắc Phục

1. **Khắc phục triệt để lỗi thủng cấu trúc:**
   - Phiên bản trước tồn tại khoảng trống xuyên qua cung điện làm lộ background.
   - Phiên bản mới tái tạo toàn bộ mặt đảo thành **một khối địa hình liên tục, vững chắc, 0 lỗ thủng xuyên qua đảo**.
   - Cung điện, tháp, sân đá, cồn cát và ốc đảo gắn kết hữu cơ trên nền móng sa thạch vững chãi.
2. **Thiết kế lại cung điện trung tâm:**
   - Không chồng chất nhiều tháp chen chúc.
   - Một cung điện trung tâm nguy nga chiếm 35–40% diện tích, mái vòm củ hành men gốm xanh Sapphire và Turquoise viền vàng kim hoàng gia.
   - Tường sa thạch màu kem cát ấm, ô cửa vòm phát ánh sáng vàng ấm cúng.
3. **Thế giới cổ tích sống động:**
   - **Tiền cảnh trái:** Đèn thần vàng đồng trên bệ đá, tỏa làn khói thần kỳ tím lavender uốn lượn mềm mại.
   - **Phía trên trái:** Tấm thảm bay đỏ ruby và xanh ngọc có tua rua vàng lơ lửng trong không khí.
   - **Bên phải:** Khu chợ Ả Rập mái bạt sọc đỏ san hô - kem, rương kho báu hé mở ánh vàng, bình gốm và đèn lồng.
   - **Xung quanh:** 3 cây chà là tán lá tròn mềm, hồ ốc đảo nước xanh turquoise tĩnh lặng, cồn cát vàng sa thạc. Tuyệt đối không có sông hay thác nước.
4. **Đế đảo nổi:**
   - Khối đá sa thạch tự nhiên hình nón ngược thuôn gọn, đường nét bo tròn mềm mại, không có góc cạnh sắc nhọn thô cứng.

---

## 2. Kiểm Soát Alpha & Bóc Tách

- Render trên nền trắng phẳng studio (`#FFFFFF`).
- Kênh alpha liên tục, subpixel anti-aliasing.
- Thuật toán Telea inpainting khử lem màu viền, loại bỏ 100% viền đen và viền trắng mờ trên mọi màu nền.
- Căn giữa tuyệt đối trong khung hình 1024x1024.
