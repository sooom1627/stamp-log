# Design

画面と情報設計（IA）の正。プロダクト原則は [product.md](./product.md)、Story / Task は [GitHub Issues](https://github.com/sooom1627/stamp-log/issues)。この文書は現在の仕様（目標を含む）だけを書き、Story ごとの判断やスコープ外は Issue に書く。

Figma は使わない。色・余白・トークンはコード（Uniwind）側。この文書は配置・遷移・出す情報だけを決める。

## 書き方

画面ごとに `docs/screens/<kebab>.md` を置く。画面を足す・変える Story は、この文書を先に `master` へ入れる（[agile-workflow](../.cursor/rules/agile-workflow.mdc)）。

画面 Markdown の型:

- 目的 / 対応 Story
- 入りと出（ルート案）
- レイアウト（ASCII）
- 出すデータ
- 空 / 読込 / エラー
- 未決事項

既存画面は「現状 → 目標」を書く。着手前の画面は骨格（配置・遷移・空状態）まででよい。

## IA

3 領域はボトムタブ。product.md 2.2 の詳細。タブバーはプラットフォームのネイティブ（`NativeTabs`）。自前のバーは作らない。

大きな枠（全タブルート共通）:

```
┌─────────────────────────────────┐
│                                 │
│         （そのタブの中身）         │
│                                 │
├─────────────────────────────────┤
│ [ ホーム ] [ 記録 ] [ カレンダー ] │
└─────────────────────────────────┘
```

- ラベルと順はこの3つで固定。4つ目は足さない
- **タブルート**（ホーム / 記録 / カレンダー）に出す
- **スタック**（ラリー詳細 / スタンプ詳細 / 日詳細）でも残す。戻ると元のタブ
- **formSheet**（ラリーを作る / メモを追加 / 過去のスタンプ / スタンプを編集）では出さない
- アイコンは実装時（iOS は SF Symbol、Android は Material）。色・選択色は Uniwind / システム
- **ホーム:** 押す場所。ラリー一覧、作成、ワンタップ。収集数。直下は最新数件まで。全件はラリー詳細へ。
- **記録:** 振り返り。横断タイムラインがこのタブのルート。ここからラリー詳細・スタンプ詳細。
- **カレンダー:** 月 → 日詳細。

ラリー詳細・スタンプ詳細はタブではなくスタック。ホームからも記録からも開ける。

```
ホーム ──タップ（ラリー行）──► ラリー詳細 ──タップ（スタンプ）──► スタンプ詳細
  │                                ▲
  └──タップ（スタンプ行）──────────┘
記録（タイムライン）──タップ──► スタンプ詳細
カレンダー ──日付──► 日詳細 ──タップ──► スタンプ詳細
```

### 目標数

作成シートに任意項目として置く。未入力なら目標なし。

### ラリーの絵文字

作成シートに絵文字項目を置く。タイプに応じた初期値を持ち、絵文字Pickerから1つ選べる。ホームのラリー行ではタイプアイコンを絵文字に置き換える。

### スタンプの日時

スタンプの日時は英語（en-US）の 12 時間表記で出す。例: `Sep 20, 11:40 AM`。今年以外のスタンプは年を付ける。例: `Sep 20, 2025, 11:40 AM`。ラリー詳細・スタンプ詳細・記録タイムラインで共通。

## 画面一覧

| 画面                 | ファイル                                                     | 深さ        | Story                      |
| -------------------- | ------------------------------------------------------------ | ----------- | -------------------------- |
| ホーム               | [screens/home.md](./screens/home.md)                         | 既存 → 目標 | S-001, S-002, S-008        |
| ラリーを作る         | [screens/create-rally.md](./screens/create-rally.md)         | 既存 → 目標 | S-001, S-009               |
| メモを追加           | [screens/add-stamp-memo.md](./screens/add-stamp-memo.md)     | 既存 → 目標 | S-002                      |
| 過去のスタンプ       | [screens/add-past-stamp.md](./screens/add-past-stamp.md)     | 既存        | S-025                      |
| スタンプを編集       | [screens/edit-stamp.md](./screens/edit-stamp.md)             | ワイヤー    | S-006, S-014               |
| ラリー詳細           | [screens/rally-detail.md](./screens/rally-detail.md)         | 既存 → 目標 | S-006, S-008, S-009, S-025 |
| スタンプ詳細         | [screens/stamp-detail.md](./screens/stamp-detail.md)         | ワイヤー    | S-007                      |
| 記録（タイムライン） | [screens/records-timeline.md](./screens/records-timeline.md) | 骨格        | S-010                      |
| カレンダー           | [screens/calendar.md](./screens/calendar.md)                 | 骨格        | S-011                      |
| 日詳細               | [screens/day-detail.md](./screens/day-detail.md)             | 骨格        | S-012                      |

## ルート案

- `/` — ホーム（タブ）
- `/create-rally` — ラリーを作る（formSheet）
- `/add-stamp-memo?stampId=` — メモを追加（formSheet）
- `/add-past-stamp?rallyId=` — 過去の日にスタンプ（formSheet）
- `/edit-stamp?stampId=` — スタンプを編集（formSheet）
- `/rallies/[id]` — ラリー詳細（スタック）
- `/stamps/[id]` — スタンプ詳細（スタック）
- `/records` — 記録タイムライン（タブ）
- `/calendar` — カレンダー（タブ）
- `/calendar/[date]` — 日詳細（スタック）
