# GLOSSARY — Tarot AI (single-context)

Ngôn ngữ dùng chung cho spec, ticket và code. Không chứa chi tiết implementation.

## Spread
Layout trải bài: số lượng + ý nghĩa từng vị trí. Phase 1 có 3 spread: `single` (1 lá), `three-card` (3 lá), `celtic-cross` (10 lá).

## Reading
Một lần xem cụ thể: spread + câu hỏi (optional) + các lá đã rút (kèm upright/reversed) + timestamp + locale.

## Upright / Reversed (Xuôi / Ngược)
Trạng thái của lá trong 1 reading. Upright = đúng chiều, nghĩa gốc. Reversed = xoay 180°, nghĩa đảo/blocked. Tỉ lệ reversed mặc định 30%.

## Arcana
Bộ bài 78 lá: Major Arcana (22 lá, đánh số 0–21) + Minor Arcana (56 lá, 4 suit × 14).

## Suit
4 chất của Minor Arcana: Wands (Gậy), Cups (Cốc), Swords (Kiếm), Pentacles (Tiền).

## Position meaning
Ý nghĩa của *vị trí* trong spread (vd Celtic Cross vị trí 2 = Challenge). Khác với *card meaning*.

## Card meaning
Nghĩa của *lá bài*: keywords + meaning_upright + meaning_reversed, có cả 2 locale `vi`/`en`.

## Locale
Ngôn ngữ hiển thị: `vi` (mặc định) hoặc `en`. Toggle 1 chạm, lưu preference.
