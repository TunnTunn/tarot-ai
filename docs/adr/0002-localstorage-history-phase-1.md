# ADR 0002 — Lịch sử localStorage phase 1, DB để phase AI

- Status: accepted
- Date: 2026-10-08

## Context
Lưu lịch sử readings cần nơi chứa. Lựa chọn: localStorage ẩn danh ngay, hay Postgres (+auth) từ đầu.

## Decision
Phase 1: ẩn danh, localStorage key versioned (`tarot:readings:v1`, cap 50 entries). Không login. DB + sync đa thiết bị dời sang phase AI.

## Consequences
- (+) Không auth, không backend state, ship nhanh 1 tuần.
- (−) Đổi máy mất lịch sử. Ghi rõ trong UI + FAQ.
