# stamp-log

日常を、自分だけのスタンプラリーにする。

人・場所・行動をスタンプとして記録し、ラリーとしてまとめ、カレンダーから振り返るモバイルアプリです。

## Documentation

- [docs/product.md](docs/product.md) — プロダクト定義（概要・ビジョン・基盤）
- [docs/backlog.md](docs/backlog.md) — Epic / Story / Task

## Requirements

- [pnpm](https://pnpm.io/) `10.11.0`（`packageManager` フィールド参照）
- Node.js 22（CI は `22.13.0`）
- Expo Go または iOS / Android シミュレータ

## Get started

```bash
pnpm install
pnpm start
```

ルートは [`src/app`](src/app)（Expo Router）です。

## Quality

```bash
pnpm run check
```

format → lint → typecheck → test をまとめて実行します。pre-commit（husky）でも同じゲートが走ります。
