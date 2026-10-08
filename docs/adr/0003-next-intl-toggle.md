# ADR 0003 — Song ngữ bằng next-intl toggle, không route riêng

- Status: accepted
- Date: 2026-10-08

## Context
Yêu cầu song ngữ VI/EN. Lựa chọn: 2 route riêng (`/vi/*`, `/en/*`) theo pattern `app/[lang]` của Next docs, hay 1 codebase + toggle next-intl.

## Decision
Dùng `next-intl` với toggle 1 chạm, default `vi`, lưu preference vào localStorage. Dataset bài (`data/cards.json`) chứa sẵn cả 2 locale nên toggle không cần refetch.

## Consequences
- (+) 1 URL duy nhất, share link không lo locale. Code ít hơn ~30% so với dual-route.
- (−) SEO 2 ngôn ngữ yếu hơn dual-route. Chấp nhận vì web dùng cá nhân trước, SEO sau.
