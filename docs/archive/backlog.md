# Backlog（アーカイブ）

2026-09-29 に凍結した、GitHub Issues へ移行する前のバックログ。完了した Story と取り下げた Story だけを残す。編集しない。

- 未完了の Story / Task は [GitHub Issues](https://github.com/sooom1627/stamp-log/issues)、Epic は [Milestones](https://github.com/sooom1627/stamp-log/milestones) にある
- 運用ルールは [agile-workflow](../../.cursor/rules/agile-workflow.mdc)
- 移行前の全文（未完了分・旧運用ルールを含む）は git 履歴の `docs/backlog.md` を参照する

---

## Epic: E-001 ラリーを作る

ゴール: ユーザーが集めたいテーマに名称とタイプ（人 / 場所 / 行動）を付けてラリーを作れるようにする。ラリーはすべての記録の起点であり、テーマや達成条件はアプリ側で固定しない。

### Story: S-001 ラリーを作成する

As a 自分だけのスタンプラリーを作りたいユーザー
I want 名称とタイプを決めてラリーを作りたい
so that 何を集めるかを自分で決めて、スタンプを押す先を用意したい

受け入れ:

- Given ホームを開いている When ラリー作成を開始する Then 作成画面が開く
- Given 名称とタイプ（人 / 場所 / 行動）を入力した When 保存する Then そのラリーがホームのラリー一覧に名称とタイプ付きで表示される
- Given 名称が空（または空白のみ） When 保存しようとする Then 保存できない
- Given ラリーを複数作成した When ホームを見る Then すべてのラリーを確認できる
- Given ラリーが一覧にある When 削除ボタンを見る Then そのラリーに削除ボタンがある
- Given 削除ボタンを押した When 確認ダイアログが出る Then 確定するまで削除されない
- Given 確認で削除した When ホームを見る Then そのラリーが一覧から消えている

Tasks:

- [x] T-001: ホームからラリーを作成し、ホームに名称とタイプが並ぶ
  - [x] ST-001: ホームに「ラリーを作る」入口があり、作成画面（formSheet）を開ける（永続化なし）
  - [x] ST-002: 名称とタイプ（人 / 場所 / 行動）を入れて保存すると、ホームのラリー一覧に名称とタイプが出る（SQLite `rallies` + Query はこの Sub で初めて入れる）
  - [x] ST-003: 名称が空（または空白のみ）のときは保存できない
  - [x] RT-001: ラリー feature を schemas / db / hooks / constants / components / screens に分割
  - [x] RT-002: Uniwind で既存画面を className にする
    - [x] ST-004: Uniwind を配線し、ホームの inline style を className にする
    - [x] ST-005: 作成画面とタイプ選択の inline style を className にする
- [x] T-002: ホームのラリーを確認のうえ削除できる
  - [x] ST-001: 一覧の各ラリーに削除ボタンが出る
  - [x] ST-002: 削除を押すと確認（Confirm）が出る。キャンセルすると残る
  - [x] ST-003: 確認するとラリーが消え、ホーム一覧から消える

### Story: S-023 ラリーに絵文字を付ける

As a ラリーを作るユーザー
I want ラリーに好きな絵文字を付けたい
so that 一覧でテーマを一目で見分けたい

受け入れ:

- Given 作成画面を開いている When 見る Then タイプに応じた初期絵文字が出ている
- Given 絵文字を選ぶ When 絵文字Pickerから1つ選択する Then その絵文字に変わる
- Given 初期絵文字または選んだ絵文字で保存した When ホームを見る Then ラリー行に絵文字が出て、タイプアイコンは出ない
- Given 絵文字カラムのない既存ラリーがある When ホームを見る Then タイプに応じた初期絵文字が出る
- Given 絵文字を変更せずタイプを切り替えた When 見る Then 初期絵文字がタイプに追随する
- Given 絵文字を自分で選んだ When タイプを切り替える Then 選んだ絵文字を保つ

Tasks:

- [x] T-001: 作成時に絵文字を指定し、ホームのラリー行で確認できる
  - [x] ST-001: ラリー絵文字のスキーマとタイプ別初期値
  - [x] ST-002: rallies の絵文字を SQLite に保存し、既存行を補完する
  - [x] ST-003: 作成画面で絵文字を指定し、ホームのタイプアイコンを絵文字に置き換える

### Story: S-024 formSheet の保存操作を初期表示で見せる

As a ラリーやメモを入力するユーザー
I want formSheet を開いた時点で保存操作を確認したい
so that シートを広げなくても入力後の操作が分かる

受け入れ:

- Given ラリー作成の formSheet を開いた When 見る Then 入力欄の下に Save が見える
- Given 絵文字Pickerを開いた When 見る Then シートが内容に合わせて伸び、Save が見える
- Given メモ追加の formSheet を開いた When 見る Then 入力欄の下に Save が見える

Tasks:

- [x] T-001: formSheet を内容の高さに合わせて Save を見せる
  - [x] ST-001: create-rally / add-stamp-memo を fitToContents にして既存の保存操作を保つ

---

## Epic: E-002 ラリーにスタンプを押す

ゴール: ラリーを選んでワンタップでスタンプを押せる。記録の本体は日時。補足メモは押した直後に任意。位置情報は別 Story。タイプによる入力差はない。

### Story: S-002 ラリーにスタンプを押す

As a ラリーを持つユーザー
I want ラリーを選んでワンタップでスタンプを押したい
so that 体験したその場で、入力に煩わされず記録を残したい

受け入れ:

- Given ラリーがある When 「スタンプを押す」を押す Then そのラリーに日時付きスタンプが付き、ホームのそのラリー直下で確認できる
- Given 人・場所・行動いずれのラリーがある When スタンプを押す Then 同じ操作で押せ、タイプで記録内容は変わらない
- Given スタンプを押した When 「メモを追加しますか？」のトーストが約5秒で消える Then メモなしのまま完了する（スタンプは残る。操作は止まらない）
- Given スタンプを押した When トーストの「メモを追加」を選ぶ Then formSheet でメモを入れられ、保存するとそのスタンプにメモが見える

Tasks:

- [x] T-001: どのタイプのラリーでもワンタップでスタンプが付く
  - [x] ST-001: stamps の型（Zod）
  - [x] ST-002: stamps の SQLite（save / list）
  - [x] ST-003: stamps の Query hooks
  - [x] ST-004: ホームで押し、ラリー直下に日時が出る（人・場所・行動で形は同じ）
  - [x] RT-001: デバッグ残骸の除去と Query/エラーを既存パターンに揃える
  - [x] RT-002: ホームのラリー行を RallyRow に抽出
  - [x] RT-003: getDb / QueryClient / 日時表示を shared へ
  - [x] RT-004: db を rallies-db / stamps-db に分割
- [x] T-002: 押したあと任意でメモを足せる
      注記: 確認は Alert にしない（操作が止まる）。`sonner-native` のトースト。約5秒で消えるとメモなし。明示の「いいえ」は置かない。`memo` は nullable。押下時は日時だけ保存し、メモは update。
  - [x] ST-001: 押すと「メモを追加しますか？」のトーストが出る。約5秒で消えたらメモなしで残る
  - [x] ST-002: stamp に任意 memo の型（Zod）
  - [x] ST-003: stamps の SQLite（memo カラム + update）
  - [x] ST-004: memo 更新の Query hook
  - [x] ST-005: トーストの「メモを追加」で formSheet が開き、保存するとラリー直下にメモが見える
  - [x] RT-001: 1箇所専用の constants をやめ、タイプラベルだけスキーマ横に置く
  - [x] RT-002: Query / Mutation の失敗表示を揃える
    - [x] ST-001: QueryClient に MutationCache.onError（layout が toast.error を渡す）。query retry は false
    - [x] ST-002: ホームの list 失敗は読込エラー+再試行。mutation の inline は外し toast に統一
  - [x] RT-003: ホーム画面テストを画面 / コンポーネントに分割する
    - [x] ST-001: RallyRow / RallyTypeRadios のコンポーネントテスト
    - [x] ST-002: create-rally / add-stamp-memo の画面テストを切り出し
    - [x] ST-003: home を seed + 結合だけに削る

### Story: S-025 過去の日付にスタンプを押す

As a ラリーを持つユーザー
I want 忘れた日を選んでスタンプを押したい
so that あとからでも、そのラリーの記録を欠けなく残したい

受け入れ:

- Given ラリー詳細を開いている When 「過去のスタンプ」を選ぶ Then 日付と時刻を選べる formSheet が開く
- Given formSheet で日付と時刻を選んだ When 保存する Then そのラリーに、選んだ日時のスタンプが付き、ラリー詳細の収集数とホーム（直近 7 日の週表示・収集数）で確認できる
- Given ラリー作成日より前の日付 When 選んで保存する Then 保存できる
- Given 現在より未来の日時 When 保存しようとする Then 保存できない
- Given そのラリーで同じカレンダー日に既にスタンプがある When 過去のスタンプを保存しようとする Then 保存できない（時刻が違っても同一日は不可）
- Given 過去日でスタンプを保存した When 保存が成功する Then S-002 と同様、任意メモのトーストが出る（約5秒で消えればメモなしのまま）

Tasks:

- [x] T-001: ラリー詳細から日時を選んでスタンプを足せる
  - [x] ST-001: `saveStampInputSchema` に任意 `stampedAt`（ISO）を足し、未来日時を reject（schema テスト）
  - [x] ST-002: `saveStamp` が指定 `stampedAt` で保存し、`stampedAt` 指定時のみ同一ラリー・同一ローカル日を reject。`listStamps` を `stamped_at` の新しい順に。`localDateKey` を `src/shared/utils/` へ移す（db / utils テスト）
  - [x] ST-003: 既存 `useSaveStamp` で past 保存後に stamps Query に反映、同日重複は mutation error（hooks テスト）
  - [x] ST-004: S-002 のメモトーストを共通関数に切り出し、ホームを置き換える（既存ホーム RNTL が Green のまま）
  - [x] ST-005: `/add-past-stamp` formSheet（日付・時刻ピッカー + Save、未来・同日はインラインで保存不可、成功後に共通メモトースト。RNTL）
  - [x] ST-006: ラリー詳細に「過去のスタンプ」ボタンだけ置き、formSheet を開く（RNTL）
  - [x] ST-007: `pnpm run check` と手動確認（DoD）

実装順: ST-001 → ST-002 → ST-003 → ST-004 → ST-005 → ST-006 → ST-007（UI Sub でも schema / db / hooks を先に）。

ブランチ:

1. Docs: `docs/s-025-past-stamp` → `master`（本 Story の画面 Markdown と backlog 更新）
2. Story: `feat/s-025-past-stamp`（`master` から 1 回）
3. Task: `feat/s-025-t-001-past-stamp-datetime`（Story から。Sub はこの Task 上）

注記: 画面は [add-past-stamp.md](../screens/add-past-stamp.md) / [rally-detail.md](../screens/rally-detail.md)。コード着手前に docs を `master` に揃える。

注記（スコープ外）:

- 同日 1 件ルールは過去のスタンプ（`stampedAt` 指定）だけに適用する。いま押すスタンプはホームの UI 制御のまま（db では enforce しない）
- 今後、ラリー作成時に「1 日 1 回 / 何回でも」を選べるようにしたい。その Story で同日ルールをラリー設定に従わせる（本 Story では実装しない）
- ラリー詳細のスタンプ一覧・スタンプ詳細 `/stamps/[id]` からの入口は本 Story では作らない。ラリー詳細は今後カレンダーとタイムラインを置く想定
- カレンダー / 記録タブでの確認は E-004 で扱う

### Story: S-004 行動のラリーにスタンプを押す

取り下げ: タイプ別の行動入力は不要。押す操作は S-002 に統合した。

---

## Epic: E-003 ラリーの中身と進捗を見る

ゴール: ラリーごとに何が集まったか、どれだけ進んだかを確認できるようにする。「集めている」「進んでいる」感覚を与えることを目的とする。

注記: S-002 Done の次はここ。S-003（位置情報）は後回し。実装前に [design.md](../design.md) と該当 `docs/screens/*.md` を `master` に揃える。Tasks はデザインが `master` に入ってから分割する。画面は [home.md](../screens/home.md) / [create-rally.md](../screens/create-rally.md) / [rally-detail.md](../screens/rally-detail.md) / [stamp-detail.md](../screens/stamp-detail.md)。タブの枠は S-018。

### Story: S-018 3つの領域をタブで切り替える

As a ユーザー
I want ホーム・記録・カレンダーをタブで行き来したい
so that 押す場所と振り返る場所をすぐ切り替えたい

受け入れ:

- Given アプリを開いている When 見る Then ホーム・記録・カレンダーのタブがある
- Given ホームにいる When 記録を選ぶ Then 記録の骨格（空状態）が見える
- Given ホームにいる When カレンダーを選ぶ Then カレンダーの骨格が見える

Tasks:

- [x] T-001: 3タブで領域を切り替えられる
  - [x] ST-001: NativeTabs でホーム / 記録 / カレンダーを切り替えられる（記録・カレンダーは骨格）

### Story: S-019 タブルートのヘッダーを揃える

As a ユーザー
I want ホーム・記録・カレンダーで同じヘッダーを見たい
so that タブを切り替えても、今どこにいるかが同じ枠で分かる

受け入れ:

- Given タブルートを開いている When 見る Then 大きな挨拶（Hello / Welcome back / Good morning のいずれか）が出る
- Given 同じ起動のままタブを切り替える When 見る Then 挨拶は変わらない
- Given タブルートを開いている When 見る Then 今日の日付が `26 May, 2026` 形式で本文先頭にある
- Given タブルートを開いている When 見る Then 左にロゴのプレースホルダ、右にメニューがある
- Given メニューを押す When 今の時点 Then 何も起きない

Tasks:

- [x] T-001: タブルートのヘッダーが揃う
  - [x] ST-001: 日付フォーマットと起動時挨拶の helper + 層テスト
  - [x] ST-002: `TabRootScreen` を3タブに載せ、large title / ロゴ / メニュー / 日付を出す

### Story: S-020 ホームをシンプルに見渡す

As a ラリーを持つユーザー
I want ホームのラリーと主要操作を迷わず見つけたい
so that 素早くラリーを作成し、スタンプを押せる

受け入れ:

- Given ホームを開いている When 見る Then ラリーが区切り線のあるフラットな一覧で並ぶ
- Given ラリーがある When 見る Then 名称、タイプ、スタンプ数、直近の記録がまとまって見える
- Given ラリーがある When 見る Then タイプはアイコンで分かり、名称と同じ行からスタンプを押せ、名称直下にスタンプ数が見える
- Given ホームを開いている When 見る Then 右下のフローティングボタンからラリーを作れる
- Given ラリーがある When 見る Then スタンプと削除の操作を識別できる
- Given ラリーがある When ホームを見る Then 今日までの直近7日の記録有無が丸の色で分かる
- Given 直近7日を表示している When `Last 7 days` を開く Then 過去21日が上へ加わり、直近28日が古い週から順に見える
- Given ヒートマップを開閉する When 見る Then 既存のスタンプ保存、メモ、削除、総数表示は変わらない
- Given ホームを開いている When 見る Then 累計スタンプ数、今月の件数、人・場所・行動の構成比が上部に見える

Tasks:

- [x] T-001: ホームをフラット一覧と作成 FAB に整える
  - [x] ST-001: 既存の操作を保ったままホームのレイアウトを簡素化する
- [x] T-002: 色とアイコンでホームの情報階層を分かりやすくする
  - [x] ST-001: フラット一覧を保ち、薄いブルーグレーの背景、ネイビーの主要操作、オレンジのアクセント、最新3件の記録で視認性を整える
- [x] T-003: 直近の活動日を丸型ヒートマップで見渡せる
  - [x] ST-001: 表示デザインだけを7日/28日ヒートマップとアコーディオンへ変える（schema / db / hooks は変更しない）
- [x] T-004: コレクション全体の積み重ねをホーム上部で見渡せる
  - [x] ST-001: 累計、今月、タイプ別件数を構成比バー付きのサマリーで表示する
- [x] T-005: ラリー行を主要情報と操作がまとまる配置にする
  - [x] ST-001: タイプ文言を省き、名称行にスタンプ操作、名称直下に収集数を配置する

### Story: S-021 タブと入力画面の見た目を揃える

As a アプリを使うユーザー
I want タブと入力画面が同じ配色と操作感で表示されてほしい
so that 画面を移動しても迷わず主要操作を見つけられる

受け入れ:

- Given タブを表示している When 選択中のタブを見る Then ネイビーで識別できる
- Given formSheet を開いている When 見る Then 英語のネイティブタイトルと整理された入力欄が表示される
- Given 有効な値を入力している When Return / Done または下部の保存を押す Then 保存できる
- Given 保存処理中 When formSheet を見る Then 保存中であることが分かり、二重送信できない

Tasks:

- [x] T-001: タブと formSheet を共通カラーと操作感に揃える
  - [x] ST-001: タブ、ラリー作成、メモ追加をネイビー・ブルーグレー・オレンジの階層で整える

### Story: S-022 直近の活動を軽く見渡す

As a ラリーを持つユーザー
I want 直近の活動をラリー行になじむ軽い表示で見たい
so that ホームの情報を箱に区切られすぎず見渡せる

受け入れ:

- Given ラリーがある When ホームを見る Then 直近7日の曜日と記録有無が背景や見出しなしで横幅いっぱいに見える
- Given 直近7日を見る When 今日を確認する Then 今日だけリングで識別できる
- Given ホームを見る When 活動表示を確認する Then 比較切替やアコーディオンは表示されない
- Given 今日が未記録 When 今日の `＋` を押す Then そのラリーにスタンプが付く
- Given 今日が記録済み When 今日を見る Then オレンジの丸になりホームから同日に追加できない
- Given ラリーがある When ホームを見る Then 一覧の上に Your Days が見える

Tasks:

- [x] T-001: 箱なし inset の3案をホームで切り替えて比較できる
  - [x] ST-001: RallyRow に flush / weekOnly / todayRing を追加し、ホームに一時切替を置く
- [x] T-002: todayRing に固定し、活動表示を横幅いっぱいにする
  - [x] ST-001: 見出し、アコーディオン、一時切替を削除して直近7日だけを表示する
- [x] T-003: 今日のセルからスタンプを押せる
  - [x] ST-001: 上部の押すボタンを今日の `＋` へ移し、記録済みならホームUIだけ無効にする
- [x] T-004: 一覧に Your Days 見出しを置く
  - [x] ST-001: ラリーがあるときだけ英語のセクション見出しを表示する
