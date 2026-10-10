# Design

画面と情報設計（IA）の正。プロダクト原則は [product.md](./product.md)、Story / Task は [GitHub Issues](https://github.com/sooom1627/stamp-log/issues)。この文書は現在の仕様（目標を含む）だけを書き、Story ごとの判断やスコープ外は Issue に書く。

Figma は使わない。色・余白・トークンはコード（Uniwind）側。この文書は配置・遷移・出す情報だけを決める。

## 書き方

画面ごとに `docs/screens/<kebab>.md` を置く。画面を足す・変える Story は、最初の Task の ST-001 でこの文書を更新する（[agile-workflow](../.cursor/rules/agile-workflow.mdc)）。

画面 Markdown の型:

- 目的 / 対応 Story
- 入りと出（ルート案）
- レイアウト（ASCII）
- 出すデータ
- 空 / 読込 / エラー
- 未決事項

既存画面は「現状 → 目標」を書く。着手前の画面は骨格（配置・遷移・空状態）まででよい。

## IA

2 領域はボトムタブ。product.md 2.2 の詳細。タブバーはプラットフォームのネイティブ（`NativeTabs`）。自前のバーは作らない。

大きな枠（全タブルート共通）:

```
┌─────────────────────────────────┐
│                                 │
│         （そのタブの中身）         │
│                                 │
├─────────────────────────────────┤
│        [ ホーム ] [ 記録 ]        │
└─────────────────────────────────┘
```

- ラベルと順はこの 2 つで固定。カレンダーは記録の中に置き、タブにしない
- **タブルート**（ホーム / 記録）に出す
- **スタック**（ラリー詳細 / スタンプ詳細）でも残す。戻ると元のタブ
- **formSheet**（ラリーを作る / ラリーを編集 / メモを追加 / 過去のスタンプ / スタンプを編集 / ラリーの日 / Logs の日）では出さない
- アイコンは実装時（iOS は SF Symbol、Android は Material）。色・選択色は Uniwind / システム
- **タブルートの見出し:** 大見出しは今日の月日（例: `September 20`）、その下に曜日（例: `Sunday`）。挨拶は出さない。2 タブで共通
- **ホーム:** 押す場所。今日押したラリーを見せる今日の判子のカード、ラリーの 2 列タイル、ワンタップ、作成（一覧の最後）。収集数。全件はラリー詳細へ。
- **記録:** 振り返り。上にカレンダー、下にラリー横断のタイムライン。カレンダーの日付から Logs の日（formSheet）、投稿からラリー詳細。UI のラベルは `Logs`。

ラリー詳細・スタンプ詳細はタブではなくスタック。ホームからも記録からも開ける。

スタックのヘッダーはネイティブの透明ヘッダーにし、白い帯を出さずに画面の地をそのまま見せる。タブルートの大見出しも同じく透明。

formSheet はネイティブのヘッダーを出さない。内容の先頭に小さい補足行（任意。スタンプ系はラリーの絵文字と名前、ラリーの日と Logs の日は曜日）と大きい見出し（操作名、ラリーの日と Logs の日は日付）を置き、全シートで同じ形にする。閉じるのはシートを下げる操作。

```
ホーム ──タップ（ラリーのタイル）──► ラリー詳細 ──タップ（スタンプ）──► スタンプ詳細
記録 ──タップ（投稿）──► ラリー詳細
記録 ──日付（カレンダー）──► Logs の日（formSheet）
```

### 目標数

作成シートに任意項目として置く。未入力なら目標なし。

### ラリーの絵文字

作成シートに絵文字項目を置く。タイプに応じた初期値を持ち、絵文字Pickerから1つ選べる。ホームのラリーのタイルではタイプアイコンを絵文字に置き換える。

### スタンプの日時

スタンプの日時は英語（en-US）の 12 時間表記で出す。例: `Sep 20, 11:40 AM`。今年以外のスタンプは年を付ける。例: `Sep 20, 2025, 11:40 AM`。スタンプ詳細はこの形。

ラリー詳細と記録のタイムラインは、曜日付きの日付（太字）と時刻（薄く）に分けて出す。例: `Fri, Sep 18` `7:02 PM`。今年以外は日付に年を付ける。例: `Fri, Sep 18, 2025`。ラリーの日と Logs の日（formSheet）は見出しに日付があるので、投稿には時刻だけを出す。

## 画面一覧

| 画面           | ファイル                                                     | 深さ        | Story                                    |
| -------------- | ------------------------------------------------------------ | ----------- | ---------------------------------------- |
| ホーム         | [screens/home.md](./screens/home.md)                         | 既存 → 目標 | S-001, S-002, S-008, S-029               |
| ラリーを作る   | [screens/create-rally.md](./screens/create-rally.md)         | 既存 → 目標 | S-001, S-009                             |
| ラリーを編集   | [screens/edit-rally.md](./screens/edit-rally.md)             | ワイヤー    | S-013                                    |
| メモを追加     | [screens/add-stamp-memo.md](./screens/add-stamp-memo.md)     | 既存 → 目標 | S-002                                    |
| 過去のスタンプ | [screens/add-past-stamp.md](./screens/add-past-stamp.md)     | 既存        | S-025                                    |
| スタンプを編集 | [screens/edit-stamp.md](./screens/edit-stamp.md)             | ワイヤー    | S-006, S-014                             |
| ラリー詳細     | [screens/rally-detail.md](./screens/rally-detail.md)         | 既存 → 目標 | S-006, S-008, S-009, S-013, S-025, S-028 |
| ラリーの日     | [screens/rally-day.md](./screens/rally-day.md)               | ワイヤー    | S-028                                    |
| スタンプ詳細   | [screens/stamp-detail.md](./screens/stamp-detail.md)         | ワイヤー    | S-007                                    |
| 記録（Logs）   | [screens/records-timeline.md](./screens/records-timeline.md) | ワイヤー    | S-010, S-011, S-012                      |
| Logs の日      | [screens/logs-day.md](./screens/logs-day.md)                 | ワイヤー    | S-012                                    |

## ルート案

- `/` — ホーム（タブ）
- `/create-rally` — ラリーを作る（formSheet）
- `/edit-rally?rallyId=` — ラリーを編集（formSheet）
- `/add-stamp-memo?stampId=` — メモを追加（formSheet）
- `/add-past-stamp?rallyId=&date=` — 過去の日にスタンプ（formSheet。`date` は任意）
- `/rally-day?rallyId=&date=` — ラリーの日（formSheet）
- `/edit-stamp?stampId=` — スタンプを編集（formSheet）
- `/rallies/[id]` — ラリー詳細（ホームのスタック）
- `/records/rallies/[id]` — ラリー詳細（Logs のスタック。戻ると Logs）
- `/stamps/[id]` — スタンプ詳細（スタック）
- `/records` — 記録（タブ。カレンダーとタイムライン）
- `/logs-day?date=` — Logs の日（formSheet）
