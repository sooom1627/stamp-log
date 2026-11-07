---
version: alpha
name: Ato
description: 静かに記録を残すスタンプ帳。砂色の地に白いカード、ネイビーの文字、オレンジは「今」の印だけ。
colors:
  # ライトの値。ダークの値は tailwind.css の @variant dark が正(下の Colors の表)。
  canvas-top: "#f3ead9"
  canvas-mid: "#f7f3ec"
  canvas-bottom: "#f6f5f1"
  background: "#ffffff"
  surface: "#ffffff"
  surface-muted: "#f1f5f9"
  card-disc: "#fdfcf9"
  border: "#e2e8f0"
  foreground: "#1e293b"
  foreground-secondary: "#334155"
  foreground-muted: "#5b6b80"
  primary: "#1e293b"
  primary-foreground: "#ffffff"
  accent: "#f97316"
  accent-subtle: "#fff7ed"
  accent-soft: "#ffedd5"
  accent-strong: "#9a3412"
  danger: "#ef4444"
typography:
  # iOS の標準の文字の段(Dynamic Type の既定の大きさ)。書体はシステムの書体(SF Pro / ヒラギノ)。
  large-title:
    fontFamily: SF Pro
    fontSize: 34px
    lineHeight: 41px
    fontWeight: 700
  title1:
    fontFamily: SF Pro
    fontSize: 28px
    lineHeight: 34px
    fontWeight: 700
  title2:
    fontFamily: SF Pro
    fontSize: 22px
    lineHeight: 28px
    fontWeight: 700
  headline:
    fontFamily: SF Pro
    fontSize: 17px
    lineHeight: 22px
    fontWeight: 600
  body:
    fontFamily: SF Pro
    fontSize: 17px
    lineHeight: 22px
    fontWeight: 400
  body-long:
    fontFamily: SF Pro
    fontSize: 17px
    lineHeight: 26px
    fontWeight: 400
  subhead:
    fontFamily: SF Pro
    fontSize: 15px
    lineHeight: 20px
    fontWeight: 400
  footnote:
    fontFamily: SF Pro
    fontSize: 13px
    lineHeight: 18px
    fontWeight: 400
  caption2:
    fontFamily: SF Pro
    fontSize: 11px
    lineHeight: 13px
    fontWeight: 400
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  card: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  screen: 20px
  section: 24px
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: 16px
  rally-tile:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: 16px
  emoji-badge:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.lg}"
    size: 44px
  day-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 12px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: 16px
  list-row:
    typography: "{typography.body}"
    padding: 12px
    height: 52px
---

# Ato DESIGN.md

この app の見た目の決まり。AI に画面を作らせるときも人が作るときも、これに従う。値の正はコードの `tailwind.css`。値を変えるときは、このファイルと `tailwind.css` を同じ変更で直す。

画面の配置・遷移・出す情報は [docs/design.md](docs/design.md)、名前・言葉づかい・ロゴは [docs/brand.md](docs/brand.md)。

## Overview

静か、責めない、余白がある(brand.md 2.1)。押していない日は抜けではなく、ただの余白。

- 砂色から明るい灰へ薄れる地(タブの画面の全面グラデーション)に、白いカードを置く
- 文字と主な操作はネイビー。オレンジは「今」の印にだけ使う
- 影は使わない。面は色の差だけで分ける
- iOS の標準(文字の段、44pt の押せる大きさ、標準の部品)に寄せ、ウェブの既定値の見た目を持ち込まない

## Colors

トークンの名前で使う(`bg-surface`、`text-foreground-muted` など)。コンポーネントに 16 進の色を書かない。ライトとダークは同じ名前で切り替わるので、`dark:` は書かない。

| 役割                       | トークン                         | ライト                      | ダーク                      |
| -------------------------- | -------------------------------- | --------------------------- | --------------------------- |
| タブの地(上 → 下)          | canvas-top / mid / bottom        | #f3ead9 → #f7f3ec → #f6f5f1 | #1a1814 → #121212 → #141414 |
| カード・タイル             | surface                          | #ffffff                     | #334155                     |
| カードの中の淡い面         | surface-muted                    | #f1f5f9                     | #334155                     |
| 線                         | border                           | #e2e8f0                     | #334155                     |
| 文字(主 / 補 / 薄)         | foreground / -secondary / -muted | #1e293b / #334155 / #5b6b80 | #f1f5f9 / #cbd5e1 / #94a3b8 |
| 主な操作                   | primary                          | #1e293b                     | #f1f5f9                     |
| 今の印                     | accent                           | #f97316                     | #f97316                     |
| 今の印の淡い面 / 札 / 文字 | accent-subtle / -soft / -strong  | #fff7ed / #ffedd5 / #9a3412 | #431407 / #7c2d12 / #fdba74 |

- オレンジ(accent 系)は「今」を表す印にだけ使う。ホームでは今日の判子の輪と、タイルの押した印だけ。7 日の点は文字色で表す。
- 主な操作(保存、作る)は primary(ネイビー)。オレンジのボタンは作らない。
- 文字は foreground の 3 段だけ。薄い文字は補足と件数に使い、本文には使わない。

## Typography

書体はシステムの書体(英数字は SF Pro、日本語はヒラギノ)。文字の大きさは下の段だけを使う。

| 段          | 大きさ / 行の高さ | 使う場所                                             |
| ----------- | ----------------- | ---------------------------------------------------- |
| large-title | 34 / 41 bold      | タブの大見出し(iOS が出す)、オンボーディングの見出し |
| title1      | 28 / 34 bold      | シートの見出し                                       |
| title2      | 22 / 28 bold      | 画面の中の見出し、ラリーの名前、カレンダーの月       |
| headline    | 17 / 22 semibold  | 主な文、記録の名前、日の見出し、ボタン               |
| body        | 17 / 22 regular   | 1 行の本文、行の文字、カレンダーの日付               |
| body-long   | 17 / 26 regular   | 複数行になる日本語の文(メモ、説明)                   |
| subhead     | 15 / 20           | 補足の文、タイルの名前(semibold)                     |
| footnote    | 13 / 18           | 件数、カードの頭のラベル、設定の見出しと注記         |
| caption2    | 11 / 13           | 曜日、数字のラベル、7 日の点の曜日                   |

- 太さは 3 つ。bold は見出しだけ、semibold は名前と主な数、ほかは regular。medium は使わない。
- 絵文字は文字ではなく絵として扱い、この段に縛らない(大きさは置く場所で決める)。

### 日本語の行の高さ

iOS の行の高さ(body で約 1.3 倍)は欧文に合わせた値で、日本語は字面が大きいので複数行になると詰まって見える。

- 1 行で終わる文字(名前、ラベル、件数、見出し、ボタン)は上の表の iOS の値のまま。
- 複数行になる日本語の文(メモ、オンボーディングの説明、空の状態の文)は body-long(17 / 26、約 1.5 倍)を使う。
- 字間は広げない(システムの書体の既定のまま)。改行の位置(禁則)は iOS に任せる。

## Layout

余白は 4 の倍数の 6 つだけを使う。段の差で仲間を示す。

| 段      | 値  | 使う場所                                                                      |
| ------- | --- | ----------------------------------------------------------------------------- |
| xs      | 4   | 文字の縦の並び(名前と件数)、絵文字の集まり                                    |
| sm      | 8   | 見出しとその中身、アイコンと文字、日の見出しとカード                          |
| md      | 12  | カード同士・タイル同士の間、行の上下、カードの中の部品の間                    |
| lg      | 16  | カードの内側、切り替えとその中身の間                                          |
| screen  | 20  | 画面の左右(どの画面も同じ)                                                    |
| section | 24  | セクション同士の間(上部カードの塊と「Your Days」、パネルとカレンダー、日と日) |

- まとまりの中の間 < まとまり同士の間 < セクションの間、にする。隣り合う段で同じ値を使わない(見出しの下とタイルの間を同じにしない)。
- 画面の上端とボタンの前は 32(`pt-8` / `mt-8`)。シートの上端だけの例外。
- `.5` の付くクラス(`gap-2.5` など)と `[Npx]` の直書きは使わない。
- 例外: 写真の格子の 2px の線(iOS の写真と同じ)、44pt の押せる場所を作るための負の余白、点や線の位置合わせ(余白でなく位置)。
- 押せる場所は 44pt 以上。見た目が小さいボタンは `hitSlop` で広げる。

## Elevation & Depth

影は使わない。カードは地との色の差で浮かせる。重ねる面は 2 段まで(地 → カード → カードの中の淡い面)。

## Shapes

角は大きくしすぎない。角丸は 5 つ。`rounded-*` には必ず `border-continuous` を付ける(`rounded-full` は不要)。

| 段   | 値  | 使う場所                                             |
| ---- | --- | ---------------------------------------------------- |
| sm   | 8   | 小さな札、写真の格子、設定の行のアイコンの面         |
| md   | 12  | 記録の絵文字の面、写真の追加                         |
| lg   | 16  | 入力欄、ボタン、日のカード、絵文字のバッジ、設定の箱 |
| card | 20  | カード、タイル、パネル、カレンダー                   |
| full | —   | 丸いもの(丸いボタン、点、円)                         |

- 内側の角丸は外側より小さくする(20 のカードの中に 16 のバッジ)。

アイコンは lucide を `@/shared/components/icons` から使い、大きさは 5 つだけ: 12(11〜13 の文字の横)/ 16(15〜17 の文字の横、小さなボタンの中)/ 20(行の右の印、送り、行の頭)/ 24(単独のボタン)/ 32(空の状態などの大きな印)。

## Components

- **カード**: surface、角丸 card、内側 16。カードの中にカードを入れない。中を分けるときは余白か線で分ける。
- **タイル**(ホーム、ラリー一覧): カードと同じ形。左上に絵文字のバッジ、右上に押すボタン(32、押せる場所は 44)、下に名前(subhead semibold)と件数(footnote)、7 日の点。
- **日のカード**: 見出し(headline、右に補足)の 8 下に、角丸 lg の白い面。記録と記録の間は線、上下 12。
- **行**(設定、言語): 高さ 52 以上、左右 16、上下 12、行の頭のアイコンは 20。
- **入力欄**: surface-muted、角丸 lg、左右 16 上下 12、文字は body。
- **主なボタン**: primary、角丸 lg、上下 16、文字は headline。

## Do's and Don'ts

- Do: 余白と文字の大きさはこのファイルの段から選ぶ。迷ったら近い段に寄せる。
- Do: 新しい画面は、今ある部品(カード、タイル、日のカード、行)の組み合わせで作る。
- Do: 色はトークンの名前で書き、ライトとダークの両方で確かめる。
- Don't: どこも同じ余白にしない。仲間は近く、別のまとまりは離す。
- Don't: カードの中にカードを入れない。枠と余白だけが増える。
- Don't: 同じ形のカードを並べてすべてを同じ重さにしない。主なものを 1 つ決める。
- Don't: 影、グラデーションの飾り、光る効果を足さない(地の全面グラデーションだけは例外)。
- Don't: オレンジを「今」以外に使わない。オレンジのボタンや見出しを作らない。
- Don't: 等幅の小さな英大文字のラベル、空色や生成りのグラデーションを使わない。飾りだけのアイコンを角丸の四角に入れない(ラリーの絵文字のバッジは中身なので例外)。
- Don't: 値を形容詞で決めない(「ゆったり」でなく 24)。

## Text Size

端末の「文字サイズ」(Dynamic Type)の設定に従う。React Native の文字は既定で設定に合わせて大きくなる(`allowFontScaling` は既定でオン)ので、これを切らない。上の文字の段は「標準の大きさ」のときの値。

- 文と行は、大きくしても切れずに折り返す。行の高さを固定しない(`min-h-*` を使う)。
- 大きさが決まっている部品だけ、拡大に上限を付ける(`maxFontSizeMultiplier`)。対象: カレンダーの日付、7 日の点の曜日、上部カード(高さ 168 で固定)、件数の札。上限の値は実機で決める。
- 新しい画面は、設定の一番大きい文字(アクセシビリティの大きな文字は除く)でも主な操作が押せることを確かめる。

## Motion & Haptics

動きは「押したことへの小さな答え」にだけ使う。飾りの動きは足さない。

- 曲線は 1 つ: `easeOut`(`cubic-bezier(0.23, 1, 0.32, 1)`、`src/shared/utils/motion.ts`)。月を送る動きだけは `Easing.out(Easing.cubic)`。
- 長さは 3 段: 短い答え 100〜220ms(押した印が沈んで戻る)、ものが現れる 240〜380ms(スタンプが押される、今日の点がふくらむ)、画面の中の切り替え 260ms(月を送る、記録を薄くする)。400ms を超える動きは作らない。
- iOS の「視差効果を減らす」がオンのときは動かさない(Reanimated の timing と layout の動きは自動で最後の形に飛ぶ)。新しい動きもこれに従うものだけを使う。
- 触覚(haptics)は今は使っていない(`expo-haptics` は入っていない)。入れるときはこの章に、どの操作でどの強さを鳴らすかを書いてから実装する。
