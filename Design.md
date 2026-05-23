# CatHealth Design System

## 1. 共通カラーパレット (Color Palette)
- **Primary**: `#EA5EAD` (メインピンク: ボタン、アクティブ状態)
- **Primary-Subtle**: `#FFF0F5` (薄いピンク: 選択行の背景)
- **Background**: `#F7F7F7` (アプリ全体の背景)
- **Card**: `#FFFFFF` (カード背景、モーダル本体)
- **Text-Main**: `#111827` (重要なテキスト、名前)
- **Text-Body**: `#374151` (標準テキスト)
- **Text-Muted**: `#9CA3AF` (補足テキスト、単位、前回値)
- **Status-Error**: `#EF4444` (削除、異常値)
- **Divider**: `#F0F0F0` (区切り線)

## 2. タイポグラフィ

### テキストスタイル定義

| スタイル名 | サイズ | ウェイト | 色 | 用途 |
|---|---|---|---|---|
| Title-Large | text-base (16px) | font-semibold | Text-Main #111827 | ページタイトル（お世話、フード等） |
| Title-Medium | text-lg (18px) | font-bold | Text-Main #111827 | 日付表示（2026年5月15日） |
| Title-Small | text-sm (14px) | font-medium | Text-Main #111827 | カテゴリ名（食事、投与、体重等） |
| Body | text-sm (14px) | font-normal | Text-Body #374151 | 標準テキスト、インライン記録 |
| Caption | text-xs (12px) | font-normal | Text-Muted #9CA3AF | 補足テキスト（前回、単位、日付） |
| Cat-Name | text-base (16px) | font-bold | Text-Main #111827 | 猫の名前 |
| Cat-Age | text-sm (14px) | font-normal | Text-Muted #9CA3AF | 年齢表示（13歳 6ヶ月） |
| Tag | text-xs (12px) | font-medium | Text-Body #374151 | タグ（ドライ、ウェット等） |
| Input | text-sm (14px) | font-normal | Text-Main #111827 | 入力欄の値 |
| Placeholder | text-sm (14px) | font-normal | Text-Muted #9CA3AF | プレースホルダー |

### 使用ルール
- 1画面内でフォントサイズは最大4種類まで（xl, lg/base, sm, xs）
- ウェイトはbold, semibold, medium, normalの4段階のみ使用
- 色は必ずText-Main, Text-Body, Text-Mutedの3色から選ぶ
- インラインスタイルでのフォント指定は禁止（Tailwindクラスを使う）

## アイコンスタイル

| スタイル名 | サイズ | 色 | 用途 |
|---|---|---|---|
| Icon-Action | w-5 h-5 (20px) | Text-Body #374151 | シェブロン（>）、＋ボタン |
| Icon-Category | w-5 h-5 (20px) | Text-Main #111827 | カテゴリアイコン（食事、投与等） |

### ルール
- アイコンの色をインラインで個別指定しない
- 上記の定義に従い、Tailwindクラスで指定する

## 3. スペーシング・レイアウト (Layout Rules)
Figma上のゆらぎを整理し、以下のルールで統一する。
- **Base Padding**: `16px` (ページ左右、カード内)
- **Tight Gap**: `8px` (項目間の狭い余白)
- **Wide Gap**: `24px` (セクション間の広い余白)
- **Radius-Card**: `16px`
- **Radius-Button**: `12px`
- **Radius-Pill**: `999px`

## 3. コンポーネント設計 (Component Specs)

### A. 汎用リスト行 (General Row)
- **Header Row**: [Icon] + [Title] + [Add Button (+)]
- **Record Row**: [Value/Status] + [Edit Button (pencil)]

### B. 血液検査テーブル (Lab Result Table)
- **Sticky Column**: 左端の項目名エリアを固定。
- **Item Name**: 英語略称（上段/Bold）と日本語名（下段/Small）を縦にスタック。
- **Horizontal Scroll**: 数値入力欄と「前回値」エリアを横スクロールで比較。
- **Alert Logic**: 基準値を外れた数値は `Status-Error` で表示。

## 4. ページ構成 (App Structure)
- **Daily**: 今日のタスク（食事、排泄、体重）のチェックと記録。
- **Foods**: 猫ごとの食事プランと、フードマスターデータの管理。
- **Hospital**: 動物病院のマスター管理と、詳細な通院・検査記録。

## 5. アイコン
- src/assets/icons/ にSVG形式で保存済み
- 使用時はこのフォルダを確認すること

## 6. アクティブ状態のルール
- カレンダーバー：アクティブ日付は下線（ピンク）のみ。日付・曜日の文字色は変えない
- タブバー：アクティブタブは下線（ピンク）のみ。アイコン・ラベルの色は変えない
- 曜日の文字色：日曜は赤、土曜は青、平日は黒
- 矢印（左右）は同じサイズで実装すること
- カレンダーバーのアクティブ下線：カレンダーエリア下端にぴったり配置、太さ4px
- タブバーのアクティブ下線：タブバー上端にぴったり配置、太さ4px

## 7. モーダル共通ルール
- モーダル上端から閉じるボタン・保存ボタンの上端まで16px
- 閉じるボタン（×）と保存ボタンの高さは両方42px
- 閉じるボタン：白い丸（アウトライン枠線なし）の上に×アイコン
- 保存ボタン：Primary色（#FF4081）、Radius-Pill
- モーダル表示中は背景スクロール無効

## 8. 実装時の参照ルール
- 実装・修正時は必ずFigmaのURLを参照すること
- CLAUDE.mdとDesign.mdも毎回読み直すこと

## 9. スクロール時の注意
- ヘッダーは常に固定表示（スクロールで隠れない）