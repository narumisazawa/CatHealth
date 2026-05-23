# CLAUDE.md — narumi のワークスペース

新しいセッションでも文脈を引き継げるよう、環境・プロジェクト全体の概要をまとめたファイル。

---

## 環境

| 項目 | 内容 |
|---|---|
| OS | macOS (Darwin 23.6.0) |
| Shell | zsh |
| Node.js 管理 | nvm（`source ~/.nvm/nvm.sh` でロード） |
| Node.js バージョン | v24.14.1（LTS） |
| パッケージマネージャー | npm |
| Git ユーザー | narumi (51066289+narumisazawa@users.noreply.github.com) |
| 制約 | Homebrew・sudo は使用不可。Node は nvm のみ |

### 開発サーバー起動の定型コマンド

```bash
# nvm を有効化してから Vite を起動（ポート 5173 固定）
source ~/.nvm/nvm.sh && cd <プロジェクトパス> && lsof -ti:5173 | xargs kill -9 2>/dev/null; npx vite
```

---

## プロジェクト一覧

### 1. CatHealth（現行・最新）

**パス：** `/Users/narumi/claude-workspace/CatHealth/`

猫の健康管理アプリの最新バージョン。コンポーネント分割・Tailwind CSS v4 を採用したリアーキテクチャ版。
NekoHealth の経験を踏まえて新規設計。

**技術スタック：**

| 項目 | 内容 |
|---|---|
| UI | React 19 |
| ビルド | Vite 8 |
| スタイリング | Tailwind CSS v4（`@tailwindcss/vite`） |
| ストレージ | localStorage |
| ルーティング | useState による画面切り替え（ライブラリなし） |
| 状態管理 | useState / useEffect のみ |

**フォルダ構成：**

```
CatHealth/
├── src/
│   ├── App.jsx             ← タブ切り替えのルート
│   ├── main.jsx
│   ├── index.css           ← Tailwind @theme カスタムトークン定義
│   ├── assets/icons/       ← SVG アイコン置き場
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── CatDashboard.jsx
│   │   ├── CatFormModal.jsx
│   │   ├── CatsTab.jsx
│   │   ├── DailyExamSheet.jsx
│   │   ├── DailyFoodSheet.jsx
│   │   ├── DailyHospitalSheet.jsx
│   │   ├── DailyPeeSheet.jsx
│   │   ├── DailyPoopSheet.jsx
│   │   ├── DailyVomitSheet.jsx
│   │   ├── DailyWeightSheet.jsx
│   │   ├── FoodFormModal.jsx
│   │   └── HospitalFormModal.jsx
│   └── screens/
│       ├── CatDetailScreen.jsx
│       ├── DailyScreen.jsx
│       ├── FoodDetailScreen.jsx
│       ├── FoodsScreen.jsx
│       ├── HospitalDetailScreen.jsx
│       ├── HospitalScreen.jsx
│       └── HospitalVisitDetailScreen.jsx
├── figma-sketch/           ← Figma デザインのスクリーンショット（実装参照用）
├── Figma-data/
├── Design.md               ← デザインシステム定義（カラー・スペーシング・ルール）
├── tailwind.config.ts
├── vite.config.js
└── package.json
```

**画面構成（タブ）：**

| タブ | コンポーネント | 概要 |
|---|---|---|
| cats | CatsTab | 猫プロフィール一覧・ダッシュボード |
| daily | DailyScreen | 今日のタスク（食事・排泄・体重チェック） |
| foods | FoodsScreen | 食事プラン・フードマスター管理 |
| hospital | HospitalScreen | 動物病院マスター・通院・検査記録 |

デザインの詳細はDesign.mdを参照

---

### 2. NekoHealth（旧バージョン群・プレゼン用）

**パス：** `/Users/narumi/claude-workspace/NekoHealth/`

猫の健康管理アプリの開発履歴を V1〜V16 まで保持。
左右 2 分割のプレゼン画面（`src/main.jsx`）で各バージョンを比較表示できる。

**最新バージョン：** NekoHealthV16.jsx（DaisyUI cupcake テーマ）

**開発ルール：各バージョンは別ファイルに保存し、過去バージョンは変更しない。**

詳細は `/Users/narumi/claude-workspace/NekoHealth/CLAUDE.md` を参照。

---

### 3. neko-health-dev（旧開発環境）

**パス：** `/Users/narumi/Desktop/neko-health-dev/`

NekoHealth の初期開発環境。現在は主に参照用。

---


## 共通メモ

- 複数の猫を管理するアプリ
- ICS データ（Mac カレンダーエクスポート）を使った体重・病院記録の取り込み機能あり（NekoHealth V5 以降）
- Claude API（`claude-opus-4-6`）による血液・尿検査の AI 解析機能あり（NekoHealth）
- localStorage の容量制限対策として、猫プロフィール写真は `nekohealth_photo_{catId}` に個別保存


## 参照ファイル

- OOUI.md：オブジェクトモデル・インタラクション定義
  実装時は必ず参照すること
- principles.md：デザイン原則（ソシオメディアHIG準拠）
  UI実装時は必ず参照すること
- Design.md：デザイントークン・カラー・スペーシング
  スタイル実装時は必ず参照すること

## 禁止事項
- Vue.jsは使用しない（ReactとVueの混在禁止）
- インラインスタイルは使用しない（Tailwind CSSを使用すること）
- DaisyUIは使用しない
- 新しいnpmパッケージの追加は事前に確認を求めること
- テキストのフォントサイズ・ウェイト・色はDesign.mdのタイポグラフィ定義に必ず従うこと
- Design.mdに定義されていないフォントサイズや色を勝手に使わないこと
- テキストスタイルをインラインスタイルで指定しないこと（Tailwindクラスを使う）
- メッセージが途切れていると判断した場合、推測で補完せず、必ずユーザーに確認すること