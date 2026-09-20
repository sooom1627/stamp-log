# Design

画面と情報設計（IA）の正。プロダクト原則は [product.md](./product.md)、チケットは [backlog.md](./backlog.md)。

Figma は使わない。色・余白・トークンはコード（Uniwind）側。この文書は配置・遷移・出す情報だけを決める。

実装は各 Story。ルート案はここに書くが、`src/` は Story ブランチで入れる。

## 書き方

新規画面・既存画面の見た目を変える Story は、該当する `docs/screens/<kebab>.md` を `master` に入れてから実装する。

画面 Markdown の型:

- 目的 / 対応 Story
- 入りと出（ルート案）
- レイアウト（ASCII）
- 出すデータ
- 空 / 読込 / エラー
- 未決事項

既存画面は「現状 → 目標」を書く。E-004 は骨格（配置・遷移・空状態）まで。ワイヤーまで書くのは既存と E-003。

## IA

3 領域はタブ前提。product.md 2.2 の詳細。

```
[ ホーム ]  [ 記録 ]  [ カレンダー ]
```

- **ホーム:** 押す場所。ラリー一覧、作成、ワンタップ。収集数。直下は最新数件まで。全件はラリー詳細へ。
- **記録:** 振り返り。横断タイムラインがこのタブのルート。ここからラリー詳細・スタンプ詳細。
- **カレンダー:** 月 → 日詳細。実装は E-004。E-003 ではタブがあっても中身は骨格でよい。

ラリー詳細・スタンプ詳細はタブではなくスタック。ホームからも記録からも開ける。

```
ホーム ──タップ（ラリー行）──► ラリー詳細 ──タップ（スタンプ）──► スタンプ詳細
  │                                ▲
  └──タップ（スタンプ行）──────────┘
記録（タイムライン）──タップ──► スタンプ詳細
カレンダー ──日付──► 日詳細 ──タップ──► スタンプ詳細
```

### 目標数（S-009）

作成シートに任意項目として置く。未入力なら目標なし。編集画面は E-005 なので、この段階では **作成時のみ** 設定できる、と明記する。スキーマ実装は E-003 の Story。

### 将来（E-005）

画面名だけ: ラリー編集 / スタンプ編集 / スタンプの移動。ワイヤーは書かない。

## 画面一覧

| 画面 | ファイル | 深さ | Story |
| --- | --- | --- | --- |
| ホーム | [screens/home.md](./screens/home.md) | 既存 → 目標 | S-001, S-002, S-008 |
| ラリーを作る | [screens/create-rally.md](./screens/create-rally.md) | 既存 → 目標 | S-001, S-009 |
| メモを追加 | [screens/add-stamp-memo.md](./screens/add-stamp-memo.md) | 既存 → 目標 | S-002 |
| ラリー詳細 | [screens/rally-detail.md](./screens/rally-detail.md) | ワイヤー | S-006, S-008, S-009 |
| スタンプ詳細 | [screens/stamp-detail.md](./screens/stamp-detail.md) | ワイヤー | S-007 |
| 記録（タイムライン） | [screens/records-timeline.md](./screens/records-timeline.md) | 骨格 | S-010 |
| カレンダー | [screens/calendar.md](./screens/calendar.md) | 骨格 | S-011 |
| 日詳細 | [screens/day-detail.md](./screens/day-detail.md) | 骨格 | S-012 |

## ルート案

実装は Story 側。案だけ固定する。

- `/` — ホーム（タブ）
- `/create-rally` — ラリーを作る（formSheet）
- `/add-stamp-memo?stampId=` — メモを追加（formSheet）
- `/rallies/[id]` — ラリー詳細（スタック）
- `/stamps/[id]` — スタンプ詳細（スタック）
- `/records` — 記録タイムライン（タブ）
- `/calendar` — カレンダー（タブ）
- `/calendar/[date]` — 日詳細（スタック）
