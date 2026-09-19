# Backlog

Single source of truth for Epic / Story / Task / Sub. Lightweight agile only — no sprints, velocity, or points.

プロダクト定義（概要・ビジョン・基盤）は [product.md](./product.md) を参照する。

## How to use

1. Add or refine a **Story** before implementation. Link it under an **Epic**.
2. Cut a **Story branch once**, then plan: split into **Tasks** (user-visible behavior) and **Subs** (implementation units; horizontal layers are allowed: schema / db / hooks / UI). Write them in this file.
3. Cut a **Task branch** from the Story branch. On it: each **Sub** = test → confirm (non-UI: layer tests; UI: RNTL acceptance). **Do not commit unless asked** (then one Sub = one commit). Mark Sub checkboxes after that commit.
4. When a Task’s Subs are Done, **merge the Task branch into the Story branch**. When the Story is Done, merge the Story branch to `main`.
5. IDs: `E-###`, `S-###`, `T-###`, `ST-###`（Sub は Task 内で 001 から。Task が変わるたびにリセット）。Reference Story + Task + Sub IDs in commit messages.

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
- Given スタンプを押した When 「メモを追加しますか？」でいいえ Then メモなしのまま完了する（スタンプは残る）
- Given スタンプを押した When はいを選ぶ Then formSheet でメモを入れられ、保存するとそのスタンプにメモが見える

Tasks:

- [ ] T-001: どのタイプのラリーでもワンタップでスタンプが付く
  - [ ] ST-001: stamps の型（Zod）
  - [ ] ST-002: stamps の SQLite（save / list）
  - [ ] ST-003: stamps の Query hooks
  - [ ] ST-004: ホームで押し、ラリー直下に日時が出る（人・場所・行動で形は同じ）
- [ ] T-002: 押したあと任意でメモを足せる
  - [ ] ST-001: 押すと「メモを追加しますか？」が出る。いいえならメモなしで残る
  - [ ] ST-002: はいを選ぶと formSheet が開き、メモを保存するとラリー直下にメモが見える

### Story: S-003 スタンプに位置情報を付けられる

注記: S-002 Done 後に着手する。S-002 のスキーマ・ワンタップには混ぜない。タイプは問わない。位置用の確認ダイアログは出さない（取れなければスキップ）。

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
