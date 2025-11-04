# コマンドRPG（街と洞窟とダンジョン）

![Demo](./assets/demo.gif)

React + TypeScript + Viteで作成したブラウザで遊べるコマンドバトルRPGです。

## 🎮 ゲームの特徴

- **街**: 冒険者を雇って仲間にできます（最大3人まで）
- **洞窟**: ボスと戦って勝利を目指します
- **ダンジョン**: 奥深くまで進み、イベントやバトルを経験しながら最終ボスに挑みます
- **戦闘システム**: ターン制バトル、スキル、アイテムシステム
- **アイテム**: ダンジョンでアイテムを収集して、戦闘や移動中に使用できます

## 🚀 セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview
```

## 🛠️ 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **ESLint** - コード品質の維持

## 📸 デモGIFの作成方法

### 方法1: 自動生成（推奨）

Puppeteerを使った自動生成スクリプトで簡単にデモGIFを作成できます：

```bash
# 1. アプリをビルド
pnpm build

# 2. プレビューサーバーを起動（別ターミナルで）
pnpm preview

# 3. GIFを生成（別ターミナルで）
pnpm generate-gif
```

生成されたGIFは `assets/demo.gif` に保存されます。

**注意:** 初回実行時、Puppeteerが自動的にChromiumをダウンロードします。

### 方法2: 手動キャプチャ

スクリーンキャプチャツールを使って手動で録画することもできます：

#### 1. アプリを起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 にアクセスします。

#### 2. スクリーンキャプチャツールを使用

**Windows:**
- [ScreenToGif](https://www.screentogif.com/)
- [LICEcap](https://www.cockos.com/licecap/)

**macOS:**
- [Gifox](https://gifox.app/)
- [Kap](https://getkap.co/)
- LICEcap

**Linux:**
- [Peek](https://github.com/phw/peek)
- [SimpleScreenRecorder](https://www.maartenbaert.be/simplescreenrecorder/) + ffmpegでGIF変換

#### 3. GIFを保存

キャプチャしたGIFを `assets/demo.gif` として保存します。

#### 推奨キャプチャ内容

1. 街で仲間を雇う
2. ダンジョンに入る
3. 移動してイベント発生
4. 戦闘シーンを数ターン
5. アイテム使用
6. 勝利またはクリア画面

## 📝 開発

このプロジェクトはViteのReact + TypeScriptテンプレートをベースに開発されています。

### プロジェクト構造

```
src/
├── game/
│   ├── components/     # ゲーム画面のコンポーネント
│   ├── data.ts        # ゲームデータ（キャラクター、敵、アイテム）
│   ├── logic.ts       # 戦闘ロジック
│   ├── dungeonLogic.ts # ダンジョンロジック
│   ├── types.ts       # 型定義
│   └── Game.tsx       # メインゲームコンポーネント
└── App.tsx            # アプリケーションルート
```

## 📄 ライセンス

MIT
