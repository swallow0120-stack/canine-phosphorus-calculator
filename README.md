# 犬用磷（P）靜脈輸注計算器

繁體中文、手機與桌面響應式的純前端工具。使用 HTML / CSS / JavaScript，不需要後端、安裝套件或建置；可直接開啟 `index.html`，或部署至 GitHub Pages。輸入資料只在瀏覽器記憶體運算，不儲存、不傳送，重新整理後重置。託管服務本身仍可能記錄一般網站存取紀錄。

> **臨床安全提示：本工具只執行數學換算，不替代獸醫處方。** 實際輸注前，須由獸醫確認製劑濃度、磷鹽種類、稀釋液相容性、最大安全輸注速率、血磷／血鈣／腎功能等。數學驗算通過不代表臨床安全。本工具沒有建立或宣稱任何安全劑量界線。

## 輸入與使用

|符號|輸入|單位|驗證|
|---|---|---|---|
|X|狗體重|kg|有限數值，> 0|
|Y|目標磷輸注速率|mmol/kg/hr|有限數值，≥ 0|
|P|磷原液濃度|mmol/mL|有限數值，> 0；預設 3，可修改|
|R|輸液速率|mL/hr|有限數值，> 0|
|Z|最終總液量|mL|有限數值，> 0|

0.02–0.06 mmol/kg/hr 是使用者提供的常用輸入範圍，**不是經來源確認的安全範圍**；超出時顯示核對提示，不自行判斷臨床適用性。Y = 0 時顯示無磷補充提示。

1. 依處方填寫 5 欄。首次開啟僅預填 P = 3，務必核對實際製劑。
2. 結果即時更新；「載入計算範例」僅供理解計算。
3. 最終總液量 Z **包含原液**：磷原液 + 其他輸液 = Z；不是在 Z mL 的輸液上額外加入原液。
4. 「清空重填」清除 X、Y、R、Z，並將 P 恢復預設 3。
5. 輸入無效時立即隱藏並清除舊結果，不可將上次結果套用新條件。

## 完整公式

令 V 為磷原液體積：

```text
每小時所需磷 H（mmol/hr） = X × Y
配製後磷濃度 C（mmol/mL） = H ÷ R
所需磷總量 T（mmol） = C × Z
磷原液體積 V（mL） = T ÷ P = X × Y × Z ÷ (R × P)
其他輸液體積 D（mL） = Z − V
預計輸注時間 t（hr） = Z ÷ R
反向驗算 Y_actual（mmol/kg/hr） = ((V × P ÷ Z) × R) ÷ X
```

量綱：`kg × mmol/kg/hr = mmol/hr`；再除以 `mL/hr` 得 `mmol/mL`；乘以 `mL` 得 `mmol`；除以 `mmol/mL` 得 `mL`。

修正原 Excel 邏輯：**每小時所需磷必須引用目前的 X × Y**，不可把 Y 固定為 0.02，也不能把除以 R 後的濃度誤標為每小時量。

### 範例

輸入：X = 10 kg、Y = 0.06 mmol/kg/hr、P = 3 mmol/mL、R = 3 mL/hr、Z = 20 mL。

|輸出|結果|
|---|---|
|每小時所需磷|0.6 mmol/hr|
|配製後磷濃度|0.2 mmol/mL|
|總磷量|4 mmol|
|磷原液|4/3 mL ≈ **1.333 mL**|
|其他輸液|56/3 mL ≈ **18.667 mL**|
|最終總液量|20 mL|
|預計輸注時間|20/3 hr ≈ 6.667 hr|
|反向驗算|0.06 mmol/kg/hr|

反算 `((4/3 × 3 ÷ 20) × 3) ÷ 10 = 0.06`。

### 精度與邊界

- 所有運算使用 JavaScript Number（雙精度浮點），中間結果不四捨五入。
- 顯示最多 6 位小數；非零絕對值小於 0.001 或 ≥ 10⁷ 時，以 6 位有效數字的科學記號顯示，以免微小正數看起來是 0。
- 反向驗算要求 `|Y_actual − Y| ≤ max(Number.MIN_VALUE, |Y| × 10⁻¹²)`；Y = 0 的結果應為 0。
- 拒絕空白、非有限數值、負數與除數為零；拒絕原液體積大於 Z；拒絕溢位、正數關鍵結果下溢為零或驗算失敗。
- V = Z 在數學上可成立，但會提醒「其他輸液為 0 不表示原液可直接輸注」。
- 顯示小數位數不是量取精度。驗算使用**未取整**體積，不代表器材量取後仍是同樣速率。輸注時間假設恆定流速，不包含管路死腔、殘留或泵浦誤差。

## GitHub Pages 部署

建立專用 repository，避免覆寫既有專案。將本資料夾內容放在 `main` 根目錄，保留 `.nojekyll` 與 `.github`。

1. 在 GitHub 專案開啟 **Settings → Pages**。
2. **Build and deployment → Source** 選 **Deploy from a branch**。
3. Branch 選 **main**，Folder 選 **/(root)**，按 **Save**。
4. 等待部署完成，使用 Pages 顯示的網站連結。網址通常為 `https://<帳號>.github.io/<專案名稱>/`。

所有資源使用相對路徑，可支援 repository 子路徑。此專案沒有編譯步驟；`.github/workflows/test.yml` 是自動測試，不是部署流程。Pages 分支部署不以測試工作為前置閘門，更新前應先執行測試。

官方依據：[設定 GitHub Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[建立 GitHub Pages 網站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

## 測試

安裝 Node.js 22 或更新版本後，在本資料夾執行（無需 npm install）：

```sh
node --test tests/calculator.test.cjs
```

包含 7 組明確數學案例、120 組條件守恆與反算、目標速率修改的回歸測試、可修改原液濃度、零值／負值／空白／非數值、原液超量、浮點精度與溢位／下溢。

手動介面檢查：載入範例應顯示 1.333333 與 18.666667；將目標改為 0.02，原液應變成 0.444444；把 R 改為 0 應停止顯示結果；清空後應回到等待輸入。另於窄螢幕確認單欄排版與所有欄位／按鈕可操作。

## 檔案結構

```text
index.html                   介面與安全提醒
style.css                    響應式樣式
calculator.js                純計算函式（瀏覽器與 Node 共用）
app.js                       即時輸入、驗證與結果顯示
.nojekyll                    停用 Jekyll 處理
tests/calculator.test.cjs    自動測試
.github/workflows/test.yml   GitHub 自動測試
package.json                 測試捷徑，無外部相依
README.md                    說明、公式與部署指南
```
