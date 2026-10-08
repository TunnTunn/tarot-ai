# ADR 0001 — Self-host ảnh 78 lá Rider-Waite

- Status: accepted
- Date: 2026-10-08

## Context
Cần ảnh minh họa cho 78 lá bài. 2 lựa chọn: hotlink API/CDN ngoài, hoặc tự host trong `public/cards/`.

## Decision
Tự host toàn bộ ảnh Rider-Waite (public domain) trong `public/cards/`, kèm placeholder khi thiếu.

## Consequences
- (+) Không phụ thuộc uptime bên thứ 3, load nhanh, deploy Vercel 1 nơi.
- (−) Tăng dung lượng repo (~vài MB). Chấp nhận được.
