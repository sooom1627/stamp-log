# Backlog

Single source of truth for Epic / Story / Task / Sub. Lightweight agile only — no sprints, velocity, or points.

プロダクト定義（概要・ビジョン・基盤）は [product.md](./product.md) を参照する。画面・IA は [design.md](./design.md) を参照する。

## How to use

1. Add or refine a **Story** before implementation. Link it under an **Epic**.
2. If the Story adds or changes screens, write or update `docs/screens/*.md` on a `docs/` branch and merge to `master` before coding (see [design.md](./design.md)).
3. Cut a **Story branch once**, then plan: split into **Tasks** (user-visible behavior) and **Subs** (implementation units; horizontal layers are allowed: schema / db / hooks / UI). Write them in this file.
4. Cut a **Task branch** from the Story branch. On it: each **Sub** = test → confirm (non-UI: layer tests; UI: RNTL acceptance). **Do not commit unless asked** (then one Sub = one commit). Mark Sub checkboxes after that commit.
5. When a Task’s Subs are Done, **merge the Task branch into the Story branch**. When the Story is Done, merge the Story branch to `main`.
6. IDs: `E-###`, `S-###`, `T-###`, `ST-###`（Sub は Task 内で 001 から。Task が変わるたびにリセット）。Reference Story + Task + Sub IDs in commit messages.

Template (copy under an epic):

```markdown
## Epic: E-001 Title

ゴール:

### Story: S-001 Title

As a ... I want ... so that ...

受け入れ:

- Given ... When ... Then ...

Tasks:

- [ ] T-001: （ユーザーに見える振る舞いのまとまり）
  - [ ] ST-001: （schema / db / hooks / UI など、層でも可）
  - [ ] ST-002: （次の層）
```

---

<!-- Product epics and stories go below. Keep this file the only backlog. -->

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

### Story: S-003 スタンプに位置情報を付けられる

注記: 後回し。E-002 の実装順から外す。S-002 のスキーマ・ワンタップには混ぜない。タイプは問わない。位置用の確認ダイアログは出さない（取れなければスキップ）。必要になったときに着手する。

As a スタンプを押したユーザー
I want 取れるときだけ位置も残したい
so that 押す操作を増やさずに、あとからどこにいたかを思い出せるようにしたい

受け入れ:

- Given 位置情報が使える When スタンプを押す Then 日時に加えて位置が記録され、ラリー直下で「位置情報あり」と分かる
- Given 位置情報が使えない When スタンプを押す Then 日時だけのスタンプとして押せる（ブロックしない）
- Given どのタイプのラリーでも When 位置を付ける Then 操作もデータ形も同じである

Tasks:

- [ ] T-001: 取れたときだけ位置が付く
  - [ ] ST-001: 位置が使えると、押したスタンプに位置が付き「位置情報あり」と分かる（`expo-location` + nullable カラムはこの Sub）
  - [ ] ST-002: 使えない／拒否でも、日時スタンプはこれまで通り押せる

### Story: S-004 行動のラリーにスタンプを押す

取り下げ: タイプ別の行動入力は不要。押す操作は S-002 に統合した。

### Story: S-005 押したスタンプに補足を残す

注記: 押下直後の任意メモは S-002 T-002。本 Story は E-002 の実装順から外す。写真等の証跡は必要になってから扱う。

As a スタンプを押したユーザー
I want 必要なときだけスタンプに補足情報を加えたい
so that 後で見返したときに当時の状況を思い出したい

受け入れ:

- Given スタンプを押している、または編集している When メモを追加する Then スタンプにメモが残る
- Given 補足情報を入力していない When 押す Then スタンプを押せる
- Given 将来の拡張として When データ構造を定義する Then 写真等の証跡を追加できる構造とする

Tasks:

- （写真等が必要になったときに Task / Sub で追加）

---

## Epic: E-003 ラリーの中身と進捗を見る

ゴール: ラリーごとに何が集まったか、どれだけ進んだかを確認できるようにする。「集めている」「進んでいる」感覚を与えることを目的とする。

注記: S-002 Done の次はここ。S-003（位置情報）は後回し。実装前に [design.md](./design.md) と該当 `docs/screens/*.md` を `master` に揃える。Tasks はデザインが `master` に入ってから分割する。画面は [home.md](./screens/home.md) / [create-rally.md](./screens/create-rally.md) / [rally-detail.md](./screens/rally-detail.md) / [stamp-detail.md](./screens/stamp-detail.md)。タブの枠は S-018。

### Story: S-018 3つの領域をタブで切り替える

As a ユーザー
I want ホーム・記録・カレンダーをタブで行き来したい
so that 押す場所と振り返る場所をすぐ切り替えたい

受け入れ:

- Given アプリを開いている When 見る Then ホーム・記録・カレンダーのタブがある
- Given ホームにいる When 記録を選ぶ Then 記録の骨格（空状態）が見える
- Given ホームにいる When カレンダーを選ぶ Then カレンダーの骨格が見える

Tasks:

- [ ] T-001: 3タブで領域を切り替えられる
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

### Story: S-006 ラリーの内容を見る

As a ラリーにスタンプを押してきたユーザー
I want ラリーに押したスタンプを一覧で見たい
so that そのテーマでこれまで何を集めたかを確認したい

受け入れ:

- Given ラリーにスタンプがある When ラリー詳細を開く Then 押したスタンプを確認できる
- Given 複数のスタンプがある When 一覧をたどる Then 新しいものから過去のものへ確認できる
- Given スタンプがある When スタンプを選ぶ Then スタンプの詳細へ移動できる

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-007 スタンプの詳細を見る

As a スタンプを押したユーザー
I want 過去に押したスタンプの詳細を見たい
so that そのときに残した情報を改めて確認したい

受け入れ:

- Given スタンプが存在する When 詳細を開く Then 内容（誰 / どこ / 何）と押した日時を確認できる
- Given 補足情報が記録されている When 詳細を開く Then 補足情報を確認できる
- Given スタンプが存在する When 詳細を開く Then 属しているラリーを確認できる

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-008 ラリーの収集数を見る

As a ラリーを持つユーザー
I want ラリーにいくつスタンプが集まったかを知りたい
so that 自分の活動が積み上がっていることを実感したい

受け入れ:

- Given ラリーにスタンプがある When ラリーを確認する Then スタンプ数を確認できる
- Given 複数のラリーがある When ホームのラリー一覧を見る Then 各ラリーのスタンプ数を確認できる

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-009 目標数に対する進捗を見る

As a ラリーを持つユーザー
I want 目標数を設定したラリーの達成状況を見たい
so that 目標までどれくらい進んだかを楽しみたい

受け入れ:

- Given ラリーを作成または編集している When 目標数を設定する Then ラリーに目標数が保持される
- Given 目標数が設定されたラリーがある When 進捗を確認する Then 現在数 / 目標数を確認できる
- Given 目標数が設定されていないラリーがある When 進捗を確認する Then 目標なしのラリーとして扱える

Tasks:

- （実装着手時に Task / Sub で追加）

---

## Epic: E-004 時間軸で振り返る

ゴール: ラリーを横断して、いつ何をしていたかを時系列やカレンダーから振り返れるようにする。

注記: 実装前に [design.md](./design.md) と該当 `docs/screens/*.md` を `master` に揃える。Tasks はデザインが `master` に入ってから分割する。骨格は [records-timeline.md](./screens/records-timeline.md) / [calendar.md](./screens/calendar.md) / [day-detail.md](./screens/day-detail.md)。

### Story: S-010 すべての記録を時系列で見る

As a スタンプを押してきたユーザー
I want ラリーをまたいで押したスタンプを時系列で見たい
so that 自分が最近何をしていたかを簡単に振り返りたい

受け入れ:

- Given スタンプが押されている When 記録一覧を開く Then ラリーをまたいで押したスタンプを確認できる
- Given 複数のスタンプがある When 一覧をたどる Then 新しい記録から過去の記録へ確認できる
- Given 人・場所・行動のラリーのスタンプがある When 一覧を見る Then タイプの違いを識別できる
- Given 人・場所・行動のラリーのスタンプがある When タイプで絞り込む Then そのタイプの記録だけを確認できる

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-011 記録がある日をカレンダーで見る

As a スタンプを押してきたユーザー
I want どの日にスタンプを押したかをカレンダーで確認したい
so that 自分の活動の流れを時間軸で振り返りたい

受け入れ:

- Given カレンダーを開いている When 月を表示する Then 月単位で日付を確認できる
- Given ある日にスタンプがある When カレンダーを見る Then 記録が存在する日を識別できる

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-012 特定の日の記録を見る

As a スタンプを押してきたユーザー
I want カレンダーの日付を選択して、その日の記録を見たい
so that その日に何をしていたかを思い出したい

受け入れ:

- Given カレンダーを開いている When 日付を選ぶ Then その日を選択できる
- Given 選択した日にスタンプがある When 日詳細を開く Then その日のスタンプを確認できる
- Given 同じ日に人・場所・行動のスタンプがある When 日詳細を開く Then 同じ日付内でタイプとラリーを確認できる

Tasks:

- （実装着手時に Task / Sub で追加）

---

## Epic: E-005 後から修正・整理する

ゴール: 押すときの入力負荷を下げ、必要な修正や整理は後から行えるようにする。誤記録の修正、ラリー間の移動、削除に対応する。

### Story: S-013 ラリーを編集する

As a ラリーを持つユーザー
I want 作成済みのラリーの名称や目標数を後から変えたい
so that テーマの言い方や目標を途中で見直したい

受け入れ:

- Given 作成済みのラリーがある When 名称を編集して保存する Then 変更が反映される
- Given 作成済みのラリーがある When 目標数を追加・変更・解除して保存する Then 変更が反映される
- Given スタンプが押されているラリーがある When タイプを変更しようとする Then 変更できない（タイプはスタンプの入力内容を決めるため）

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-014 スタンプを編集する

As a スタンプを押したユーザー
I want 押したスタンプを後から編集したい
so that 入力間違いを修正したり、後から情報を補足したい

受け入れ:

- Given 押したスタンプがある When 主要情報（誰 / どこ / 何）を編集して保存する Then 変更が反映される
- Given 押したスタンプがある When 任意情報を追加・変更して保存する Then 変更が反映される

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-015 スタンプを別のラリーへ移す

As a スタンプを押したユーザー
I want 押し間違えたスタンプを別のラリーへ移したい
so that 押す瞬間にラリーを間違えても、記録を作り直さずに済ませたい

受け入れ:

- Given スタンプと同じタイプの別ラリーがある When 移動先を選んで移す Then スタンプが移動先のラリーに属し、元のラリーからは外れる
- Given スタンプと異なるタイプのラリーがある When 移動先を選ぶ Then そのラリーは選べない
- Given スタンプを移した When スタンプを確認する Then 内容と押した日時は失われていない

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-016 スタンプを削除する

As a スタンプを押したユーザー
I want 不要になったスタンプを削除したい
so that 誤って押した記録を残したくない

受け入れ:

- Given 自分のスタンプがある When 削除を実行する Then スタンプが削除され、ラリーの収集数が減る
- Given 削除を開始した When 確認なしに即削除しようとしても Then 意図しない削除を防ぐ手段がある

Tasks:

- （実装着手時に Task / Sub で追加）

### Story: S-017 ラリーを削除する

注記: ホームでの確認付き削除の基本フロー（削除ボタン → Confirm → 削除）は S-001 T-002。本 Story はスタンプが入ったラリーの扱い（中身も消えることの明示など）を対象とする。

As a ラリーを持つユーザー
I want 不要になったラリーを削除したい
so that 使わなくなったテーマでホームが埋まらないようにしたい

受け入れ:

- Given スタンプのないラリーがある When 削除を実行する Then ラリーが削除される
- Given スタンプのあるラリーがある When 削除を実行する Then 中のスタンプも一緒に削除されることが事前に明示される
- Given 削除を開始した When 確認なしに即削除しようとしても Then 意図しない削除を防ぐ手段がある

Tasks:

- （実装着手時に Task / Sub で追加）
