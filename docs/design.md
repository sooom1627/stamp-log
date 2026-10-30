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
- **スタック**（ラリー詳細）でも残す。戻ると元のタブ
- **formSheet**（ラリーを作る / ラリーを編集 / メモと写真を追加 / 過去のスタンプ / スタンプを編集 / ラリーの日 / Logs の日 / 設定 / 言語）では出さない
- **全画面モーダル**（スタンプの写真）でも出さない
- アイコンは実装時（iOS は SF Symbol、Android は Material）。色・選択色は Uniwind / システム
- **タブルートの見出し:** ホームは大見出しが今日の月日（例: `September 20`）、その下に曜日（例: `Sunday`）。記録は大見出しが `Logs`、その下に一言 `Your days, one stamp at a time`（日付は出さない）。挨拶は出さない
- **タブルートのヘッダー:** 左にロゴ（アプリアイコンと同じ太陽のマーク。ライトは帯がネイビー、ダークは帯が明るいグレー）、右に Menu ボタン。Menu ボタンは [設定](./screens/settings.md)（formSheet）を開く
- **ホーム:** 押す場所。今日押したラリーを見せる今日の判子のカード、ラリーの 2 列タイル、ワンタップ、作成（一覧の最後）。収集数。全件はラリー詳細へ。
- **記録:** 振り返り。上にカレンダー、下にラリー横断のタイムラインと写真のアルバム（`Stamps / Album` で切り替える）。カレンダーの日付から Logs の日（formSheet）、投稿からラリー詳細。UI のラベルは `Logs`。

ラリー詳細はタブではなくスタック。ホームからも記録からも開ける。

初回起動では、ホームの代わりに [オンボーディング](./screens/onboarding.md) を全画面で出す（タブバーは出さない）。終えるとホームになり、以降は出さない。

スタックのヘッダーはネイティブの透明ヘッダーにし、白い帯を出さずに画面の地をそのまま見せる。タブルートの大見出しも同じく透明。

formSheet はネイティブのヘッダーを出さない。内容の先頭に小さい補足行（任意。スタンプ系はラリーの絵文字と名前、ラリーの日と Logs の日は曜日）と大きい見出し（操作名、ラリーの日と Logs の日は日付）を置き、全シートで同じ形にする。閉じるのはシートを下げる操作。

スタンプの写真は全画面モーダル（iOS の全画面表示）で開き、ネイティブのヘッダーを出さない。閉じるのは画面の閉じるボタンだけ（全画面表示には下スワイプで閉じる操作が無く、独自には作らない）。

```
ホーム ──タップ（ラリーのタイル）──► ラリー詳細
記録 ──タップ（投稿）──► ラリー詳細
記録 ──日付（カレンダー）──► Logs の日（formSheet）
投稿の写真マーク / Album のマス ──► スタンプの写真（全画面モーダル）
タブルートの Menu ボタン ──► 設定（formSheet）──► 言語（formSheet）
```

### ラリーの絵文字

作成シートに絵文字項目を置く。初期値は ✨ で、絵文字Pickerから1つ選べる。ホームのラリーのタイルには絵文字を出す。

### 言語

アプリは英語と日本語で出す。既定は端末に合わせ、端末の言語が `ja` なら日本語、それ以外は英語。[言語](./screens/language.md)のシートで English か日本語に固定できる。用語と文体は [brand.md](./brand.md)「2.3 日本語の用語と文体」に従う。

日本語で出すときも、次は英語のまま出す。

- アプリ名 `Ato`
- ホームとラリー一覧の見出し `Your Days`
- 画面に見える日付（月名・曜日名と、それを含む日付）。例: `September 20` / `Sunday` / `October 2026` / `Th` / `Fri, Sep 18`
- 数の表記。例: `1 stamp` / `4 stamps`、`3 rallies`、`3 photos`。日本語の文の中にもこの形で入れる
- ユーザーが入力したもの（ラリー名・メモ）
- 書き出しファイルの名前と中身
- ライセンスの本文

日付まわりの言葉（日付そのものではないもの）と、読み上げ（`aria-label`）の日付は言語に合わせる。例: `Today` / `今日`、`3 days ago` / `3 日前`、読み上げの `Sep 20, 2026` / `2026年9月20日`。

### スタンプの日時

スタンプの日時は、言語や端末の 12/24 時間設定に関係なく 24 時間表記で出す。例: `Sep 20, 11:40`。今年以外のスタンプは年を付ける。例: `Sep 20, 2025, 11:40`。

ラリー詳細と Logs のタイムラインは 1 日分を 1 枚のカードにまとめてカードの上に日の見出しを置き、投稿には時刻だけを出す。例: `19:02`。見出しは今日が `Today`（日本語は `今日`）、昨日が `Yesterday`（`昨日`）で、右に曜日付きの日付を小さく添える。それ以外は曜日付きの日付。例: `Fri, Sep 18`。今年以外は年を付ける。例: `Fri, Sep 18, 2025`。ラリーの日と Logs の日（formSheet）も見出しに日付があるので、投稿には時刻だけを出す。

### 予期しないエラー

画面の描画中に予期しない例外が起きたら、どのルートでも同じエラー表示に置き換える。新しい画面ではない。

```
┌─────────────────────────────────┐
│                                 │
│      Something went wrong       │
│  This screen couldn't be shown. │
│                                 │
│         [ Try again ]           │
│                                 │
└─────────────────────────────────┘
```

- 文言は端末の言語に合わせる（日本語は `エラーが起きました` / `この画面を表示できませんでした。` / `再試行`）。エラーの中身（例外のメッセージ）は出さない
- `Try again` を押すと、その画面をもう一度描画する
- データの読み込み失敗は各画面の「読み込めませんでした」+ 再試行で扱い、この表示は出さない

## 画面一覧

| 画面             | ファイル                                                     | 深さ        | Story                                                         |
| ---------------- | ------------------------------------------------------------ | ----------- | ------------------------------------------------------------- |
| ホーム           | [screens/home.md](./screens/home.md)                         | 既存 → 目標 | S-001, S-002, S-008, S-029, S-032, S-039                      |
| ラリーを作る     | [screens/create-rally.md](./screens/create-rally.md)         | 既存 → 目標 | S-001, S-040, S-039                                           |
| ラリーを編集     | [screens/edit-rally.md](./screens/edit-rally.md)             | ワイヤー    | S-013, S-040                                                  |
| メモと写真を追加 | [screens/add-stamp-memo.md](./screens/add-stamp-memo.md)     | 既存 → 目標 | S-002, S-035                                                  |
| 過去のスタンプ   | [screens/add-past-stamp.md](./screens/add-past-stamp.md)     | 既存        | S-025                                                         |
| スタンプを編集   | [screens/edit-stamp.md](./screens/edit-stamp.md)             | ワイヤー    | S-006, S-014, S-036                                           |
| ラリー一覧       | [screens/rallies-list.md](./screens/rallies-list.md)         | ワイヤー    | S-039                                                         |
| ラリー詳細       | [screens/rally-detail.md](./screens/rally-detail.md)         | 既存 → 目標 | S-006, S-008, S-013, S-025, S-028, S-032, S-039, S-035, S-037 |
| ラリーの日       | [screens/rally-day.md](./screens/rally-day.md)               | ワイヤー    | S-028, S-035, S-037                                           |
| 記録（Logs）     | [screens/records-timeline.md](./screens/records-timeline.md) | ワイヤー    | S-010, S-011, S-012, S-035, S-037                             |
| Logs の日        | [screens/logs-day.md](./screens/logs-day.md)                 | ワイヤー    | S-012, S-035, S-037                                           |
| スタンプの写真   | [screens/stamp-photos.md](./screens/stamp-photos.md)         | ワイヤー    | S-037                                                         |
| 設定             | [screens/settings.md](./screens/settings.md)                 | ワイヤー    | S-044, S-041, S-045                                           |
| 言語             | [screens/language.md](./screens/language.md)                 | ワイヤー    | S-045                                                         |
| オンボーディング | [screens/onboarding.md](./screens/onboarding.md)             | ワイヤー    | S-047                                                         |

## ルート案

- `/` — ホーム（タブ）
- `/onboarding` — オンボーディング（全画面。初回起動だけ、ホームの代わりに開く）
- `/create-rally` — ラリーを作る（formSheet）
- `/edit-rally?rallyId=` — ラリーを編集（formSheet）
- `/add-stamp-memo?stampId=` — メモと写真を追加（formSheet）
- `/add-past-stamp?rallyId=&date=` — 過去の日にスタンプ（formSheet。`date` は任意）
- `/rally-day?rallyId=&date=` — ラリーの日（formSheet）
- `/edit-stamp?stampId=` — スタンプを編集（formSheet）
- `/rallies-list` — ラリー一覧（ホームのスタック。`View All` から）
- `/rallies/[id]` — ラリー詳細（ホームのスタック）
- `/records/rallies/[id]` — ラリー詳細（Logs のスタック。戻ると Logs）
- `/records` — 記録（タブ。カレンダーとタイムライン）
- `/logs-day?date=` — Logs の日（formSheet）
- `/settings` — 設定（formSheet。タブルートの Menu ボタンから）
- `/language` — 言語（formSheet。設定の Language 行から）
- `/about-ato` — 紹介の見直し（全画面のモーダル。設定の About Ato から）
- `/stamp-photos?photoId=` — スタンプの写真（全画面モーダル。開いた写真と同じ日・同じラリーの写真をめくる）
