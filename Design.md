# CatHealth Design System

## 0. デザイン思想

**「医療的な不安を和らげ、ケアの喜びを伝える」**

- ピンクはUIの主役。愛情と温かさを表現する
- 警告色（赤）は本当に必要な時だけ使う
- ヒートマップは問題があっても飼い主が焦らず対処できるよう、穏やかな色にする
- 暗い色・重い色は使わない

## 1. カラーパレット

Figma Variables（Cat-DesignSystem）と完全に一致させること。

### Primitive Tokens（生の色値）

#### ピンク
| Token | 値 | 備考 |
|---|---|---|
| pink/500 | `#EA5EAD` | メインピンク。ブランドカラー |
| pink/300 | `#FF9BD3` | ピンク中間 |
| pink/100 | `#FFD4EC` | ピンク淡い |

#### ブラック
| Token | 値 | 備考 |
|---|---|---|
| black/500 | `#0F172A` | 最も濃いテキスト色 |

#### アルファ
| Token | 値 | 備考 |
|---|---|---|
| black-alpha/100 | `#000000` | 純黒 |
| black-alpha/70 | `rgba(0,0,0,0.70)` | 70%黒。補足テキスト用 |
| black-alpha/15 | `rgba(0,0,0,0.15)` | 15%黒。ボーダー・区切り線 |

#### グレー
| Token | 値 | 備考 |
|---|---|---|
| gray/700 | `#8A8987` | プレースホルダー文字色 |
| gray/500 | `#C3C3C3` | 非アクティブ要素 |
| gray/200 | `#EDEDED` | セクション背景・ヒートマップ未記録 |
| gray/100 | `#F7F7F7` | アプリ全体の背景色 |
| white | `#FFFFFF` | カード・モーダルの背景 |

#### レッド・ブルー
| Token | 値 | 備考 |
|---|---|---|
| red/500 | `#F40404` | エラー・血便・日曜日 |
| blue/600 | `#006FE5` | 土曜日の文字色 |
| blue/300 | `#79ACFE` | 予備のブルー |

#### ブラウン
| Token | 値 | 備考 |
|---|---|---|
| brown/700 | `#8B6347` | うんち・濃い茶色 |
| brown/500 | `#B8864E` | うんち・普通 |
| brown/400 | `#BFA68A` | うんち・コロコロ。グレー寄りの茶色 |
| brown/300 | `#D4A853` | うんち・軟便 |

#### オレンジ
| Token | 値 | 備考 |
|---|---|---|
| orange/700 | `#FF8C38` | ゲロ3回以上 |
| orange/500 | `#FFB06B` | ゲロ2回 |
| orange/300 | `#FFD4A8` | ゲロ1回 |

### Semantic Tokens（用途別エイリアス）

実装時はこちらを参照する。Primitiveを直接使わない。

#### ブランド
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| primary | pink/500 | `#EA5EAD` | ボタン、アクティブ下線、追加リンク |

#### 背景
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| background/main | gray/100 | `#F7F7F7` | アプリ全体の背景 |
| background/white | white | `#FFFFFF` | カード、モーダル背景 |
| background/gray | gray/200 | `#EDEDED` | セクション背景 |

#### テキスト
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| text/primary | black/500 | `#0F172A` | タイトル、名前、本文、タグ、入力値 |
| text/secondary | black-alpha/70 | `rgba(0,0,0,0.70)` | 補足テキスト、キャプション |
| text/placeholder | gray/700 | `#8A8987` | プレースホルダー |

#### ボーダー
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| border | black-alpha/15 | `rgba(0,0,0,0.15)` | 区切り線、ボーダー |

#### カレンダー
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| calendar/sun | red/500 | `#F40404` | カレンダー日曜 |
| calendar/sat | blue/600 | `#006FE5` | カレンダー土曜 |

#### ヒートマップ - うんち
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| heatmap/bg | gray/200 | `#EDEDED` | ヒートマップ未記録 |
| heatmap/poop/normal | brown/500 | `#B8864E` | うんち・普通 |
| heatmap/poop/constipation | gray/700 | `#8A8987` | うんち・便秘 |
| heatmap/poop/korokoro | brown/400 | `#BFA68A` | うんち・コロコロ |
| heatmap/poop/soft | brown/300 | `#D4A853` | うんち・軟便 |
| heatmap/poop/bloody | red/500 | `#F40404` | うんち・血便 |

#### ヒートマップ - ゲロ
| Token | 参照先 | 解決値 | 用途 |
|---|---|---|---|
| vomit/1x | orange/300 | `#FFD4A8` | ゲロ・1回 |
| vomit/2x | orange/500 | `#FFB06B` | ゲロ・2回 |
| vomit/3x | orange/700 | `#FF8C38` | ゲロ・3回以上 |

### Spacing Tokens

| Token | 値 |
|---|---|
| space/1 | 4px |
| space/2 | 8px |
| space/3 | 12px |
| space/4 | 16px |
| space/5 | 20px |
| space/6 | 24px |
| space/8 | 32px |
| space/10 | 40px |
| space/12 | 48px |

### カラー使用ルール
- 実装時はSemantic Tokenを参照する。Primitiveを直接使わない
- Figma Variablesに存在しない色を勝手に追加しない
- 警告色（red/500）は異常値・削除など本当に必要な時だけ使う
- ヒートマップの色は飼い主が焦らず冷静に対処できるよう、穏やかなトーンにする（暗い色・重い色は使わない）

## 2. タイポグラフィ

### テキストスタイル定義

| スタイル名 | サイズ | ウェイト | 色 | 用途 |
|---|---|---|---|---|
| Title-Large | text-base (16px) | font-semibold | text/primary #0F172A | ページタイトル（お世話、フード等） |
| Title-Medium | text-lg (18px) | font-bold | text/primary #0F172A | 日付表示（2026年5月15日） |
| Title-Small | text-sm (14px) | font-medium | text/primary #0F172A | カテゴリ名（食事、投与、体重等） |
| Body | text-sm (14px) | font-normal | text/primary #0F172A | 標準テキスト、インライン記録 |
| Caption | text-xs (12px) | font-normal | text/secondary rgba(0,0,0,0.70) | 補足テキスト（前回、単位、日付） |
| Cat-Name | text-base (16px) | font-bold | text/primary #0F172A | 猫の名前 |
| Cat-Age | text-sm (14px) | font-normal | text/primary #0F172A | 年齢表示（13歳 6ヶ月） |
| Tag | text-xs (12px) | font-medium | text/primary #0F172A | タグ（ドライ、ウェット等） |
| Input | text-sm (14px) | font-normal | text/primary #0F172A | 入力欄の値 |
| Placeholder | text-sm (14px) | font-normal | text/placeholder #8A8987 | プレースホルダー |

### 使用ルール
- 1画面内でフォントサイズは最大4種類まで（xl, lg/base, sm, xs）
- ウェイトはbold, semibold, medium, normalの4段階のみ使用
- テキスト色はtext/primary、text/secondary、text/placeholderの3色のみ
- インラインスタイルでのフォント指定は禁止（Tailwindクラスを使う）

## 3. アイコンスタイル

| スタイル名 | サイズ | 色 | 用途 |
|---|---|---|---|
| Icon-Action | w-5 h-5 (20px) | text/secondary rgba(0,0,0,0.70) | シェブロン（>）、＋ボタン |
| Icon-Category | w-5 h-5 (20px) | text/primary #0F172A | カテゴリアイコン（食事、投与等） |

### ルール
- アイコンの色をインラインで個別指定しない
- 上記の定義に従い、Tailwindクラスで指定する

## 4. スペーシング・レイアウト

- **Base Padding**: `16px`（space/4）ページ左右、カード内
- **Tight Gap**: `8px`（space/2）項目間の狭い余白
- **Wide Gap**: `24px`（space/6）セクション間の広い余白
- **Radius-Card**: `16px`
- **Radius-Button**: `12px`
- **Radius-Pill**: `999px`

### レイアウト定数

| 要素 | サイズ | Tailwindクラス |
|---|---|---|
| ヘッダー | 60px | h-[60px] |

## 5. コンポーネント設計

### A. 汎用リスト行
- **Header Row**: [Icon] + [Title] + [Chevron (>)]
- **Record Row**: [Value/Status]（シェブロンなし）

### B. 日付・時間ピッカー
- ピル型コンポーネント（DatePill / TimePill）
- 背景：background/main、角丸：16px、px-3 py-1
- テキスト：14px, font-medium, text/primary
- 未入力時：text/placeholder色
- カレンダーアイコン・時計アイコンは表示しない

### C. 血液検査テーブル
- **Sticky Column**: 左端の項目名エリアを固定
- **Item Name**: 英語略称（上段/Bold/text/primary）と日本語名（下段/text/secondary）を縦にスタック
- **Horizontal Scroll**: 数値入力欄と「前回値」エリアを横スクロールで比較
- **Alert Logic**: 基準値を外れた数値は red/500 で表示
- **展開/折りたたみ**: 「全て見る」（arrow_forward.svg）/「表示を減らす」（arrow_up.svg）

## 6. ページ構成
- **Daily**: 今日のタスク（食事、排泄、体重）のチェックと記録
- **Foods**: 猫ごとの食事プランと、フードマスターデータの管理
- **Hospital**: 動物病院のマスター管理と、詳細な通院・検査記録

## 7. アイコン
- src/assets/icons/ にSVG形式で保存済み
- 使用時はこのフォルダを確認すること

## 8. アクティブ状態のルール
- カレンダーバー：アクティブ日付は下線（primary）のみ。日付・曜日の文字色は変えない
- タブバー：アクティブタブは下線（primary）のみ。アイコン・ラベルの色は変えない
- 曜日の文字色：日曜はcalendar/sun、土曜はcalendar/sat、平日はtext/primary
- 矢印（左右）は同じサイズで実装すること
- カレンダーバーのアクティブ下線：カレンダーエリア下端にぴったり配置、太さ4px
- タブバーのアクティブ下線：タブバー上端にぴったり配置、太さ4px

## 9. モーダル共通ルール
- モーダル上端から閉じるボタン・保存ボタンの上端まで16px
- 閉じるボタン（×）と保存ボタンの高さは両方42px
- 閉じるボタン：白い丸（アウトライン枠線なし）の上に×アイコン
- 保存ボタン：primary色（#EA5EAD）、Radius-Pill
- モーダル表示中は背景スクロール無効

## 10. 実装時の参照ルール
- 実装・修正時は必ずFigmaのURLを参照すること
- CLAUDE.mdとDesign.mdも毎回読み直すこと

## 11. スクロール時の注意
- ヘッダーは常に固定表示（スクロールで隠れない）
