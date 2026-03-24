# Minigame Builder

Ứng dụng dành cho máy tính (Electron) giúp giáo viên tiếng Anh không có kỹ thuật tạo các trò chơi nhỏ tùy chỉnh cho lớp học **mà không cần viết code**. Giáo viên nhập từ ngữ, câu hỏi, hình ảnh và nội dung khác qua trình soạn thảo trực quan, sau đó xuất ra một trò chơi độc lập có thể mở trực tiếp trên bất kỳ trình duyệt nào.

---

## Cấu trúc dự án

```
minigame-builder/
├── build-templates.sh              # Công cụ build cục bộ (xem bên dưới)
├── .github/workflows/build-all.yml # CI: build các template rồi đóng gói ứng dụng
│
├── template-projects/              # Mỗi thư mục con là một loại trò chơi
│   ├── group-sort/                 # Trò chơi độc lập Vite + React
│   ├── plane-quiz/
│   ├── balloon-letter-picker/
│   └── pair-matching/
│
└── builder-projects/
    └── electron-app-mui/           # Ứng dụng trình soạn thảo Electron
        ├── src/
        │   ├── main/
        │   │   ├── index.ts        # Tiến trình chính Electron + tất cả IPC handlers
        │   │   └── gameRegistry.ts ← THÊM TRANSFORM VÀO ĐÂY cho trò chơi mới
        │   └── renderer/src/
        │       ├── games/
        │       │   ├── registry.ts ← THÊM TRÒ CHƠI MỚI VÀO ĐÂY (trình soạn thảo + dữ liệu khởi tạo)
        │       │   ├── group-sort/
        │       │   │   └── GroupSortEditor.tsx
        │       │   ├── plane-quiz/
        │       │   │   └── QuizEditor.tsx
        │       │   ├── balloon-letter-picker/
        │       │   │   └── BalloonLetterPickerEditor.tsx
        │       │   └── pair-matching/
        │       │       └── PairMatchingEditor.tsx
        │       ├── components/     # Các thành phần UI dùng chung (ImagePicker, EditorShared…)
        │       ├── pages/          # HomePage, ProjectPage
        │       ├── context/
        │       ├── hooks/
        │       └── types/
        └── templates/              # Tài sản trò chơi đã build được đưa vào lúc build
            ├── group-sort/
            │   ├── game/           # Đầu ra đã build (index.html + hình ảnh)
            │   └── meta.json
            ├── plane-quiz/
            │   ├── game/
            │   └── meta.json
            ├── balloon-letter-picker/
            │   ├── game/
            │   └── meta.json
            └── pair-matching/
                ├── game/
                └── meta.json
```

---

## Cách thức hoạt động

1. **Các dự án template** là các ứng dụng Vite + React độc lập. Mỗi template được build thành một tệp `index.html` duy nhất (thông qua `vite-plugin-singlefile`) cùng với các tài sản hình ảnh.
2. **Trình soạn thảo (builder)** đọc các tệp đã build từ thư mục `templates/` của nó. Khi giáo viên xuất một dự án, trình soạn thảo sẽ chèn dữ liệu của giáo viên trực tiếp vào HTML (`window.APP_DATA`) và sao chép các tài sản hình ảnh đi kèm.
3. Đầu ra cuối cùng là một thư mục đơn giản (hoặc tệp ZIP) hoạt động ngoại tuyến trên bất kỳ trình duyệt nào — không cần máy chủ.

---

## Yêu cầu đối với Game Template

Một dự án game template có thể sử dụng **bất kỳ công cụ nào** miễn là đầu ra build đáp ứng các yêu cầu dưới đây.

### Đầu ra build

| Tệp                  | Yêu cầu                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | **HTML một tệp** — tất cả JS và CSS phải được nhúng trực tiếp. Sử dụng `vite-plugin-singlefile` (hoặc tương đương) để đạt được điều này.                 |
| `images/` (tùy chọn) | Các tài sản hình ảnh không thể nhúng trực tiếp. Giữ số lượng tệp ở mức tối thiểu. Trình soạn thảo sẽ sao chép các tệp này cùng với `index.html` đã xuất. |

> Không được phát sinh các loại tài sản khác. Font chữ, biểu tượng và SVG nhỏ nên được nhúng trực tiếp vào HTML.

### Hợp đồng dữ liệu runtime

Trình soạn thảo chèn nội dung do giáo viên tạo **trước thẻ `<script>` đầu tiên** như sau:

```html
<script>
  window.APP_DATA = {
    /* dữ liệu của giáo viên */
  };
  window.MY_APP_DATA = window.APP_DATA; // bí danh cũ
  window.win = { DATA: window.APP_DATA }; // bí danh cũ
</script>
```

Trò chơi của bạn đọc `window.APP_DATA` khi khởi động. Hình dạng của đối tượng đó tùy thuộc vào bạn — chỉ cần đảm bảo trình soạn thảo tạo ra dữ liệu phù hợp (xem `gameRegistry.ts` ở tiến trình chính nếu cần transform).

### `meta.json`

Mỗi thư mục template phải chứa `meta.json` nằm cạnh thư mục con `game/`:

```json
{
  "name": "Tên Trò Chơi Dễ Đọc",
  "description": "Một câu mô tả hiển thị trên màn hình chính.",
  "gameType": "your-game-id",
  "version": "1.0.0"
}
```

Có thể đặt tệp `thumbnail.png` (hoặc `.jpg`/`.webp`) bên cạnh `meta.json` để hiển thị hình ảnh xem trước trên màn hình chính.

---

## Yêu cầu hệ thống

- **Node.js** 20+
- **Yarn** 4 (`corepack enable && corepack prepare yarn@4.12.0 --activate`)

---

## Phát triển cục bộ

```bash
# 1. Build tất cả game templates và sao chép chúng vào trình soạn thảo
./build-templates.sh

# 2. Khởi động trình soạn thảo ở chế độ dev
cd builder-projects/electron-app-mui
yarn install
yarn dev
```

Để chỉ build một game template đơn lẻ:

```bash
./build-templates.sh group-sort
```

---

## Thêm trò chơi mới — hướng dẫn đầy đủ

### Bước 1 — Tạo dự án template

Tạo một thư mục mới trong `template-projects/`:

```bash
cp -r template-projects/group-sort template-projects/tro-choi-moi-cua-toi
# hoặc khởi tạo từ đầu với: yarn create vite
```

**Các yêu cầu** (xem [Yêu cầu đối với Game Template](#yêu-cầu-đối-với-game-template) ở trên):

- Sử dụng `vite-plugin-singlefile` để quá trình build tạo ra một tệp `index.html` duy nhất.
- Đọc dữ liệu của giáo viên từ `window.APP_DATA` trong lúc runtime.
- Giữ các tài sản hình ảnh trong thư mục `images/`; không phát sinh các tài sản rời rạc khác.

Thêm `meta.json` ở cấp `template-projects/tro-choi-moi-cua-toi/`:

```json
{
  "name": "Trò Chơi Mới Của Tôi",
  "description": "Mô tả ngắn cho màn hình chính.",
  "gameType": "tro-choi-moi-cua-toi",
  "version": "1.0.0"
}
```

Có thể thêm `thumbnail.png` cho thẻ trò chơi trên màn hình chính.

### Bước 2 — Đăng ký template trong script build

Mở `build-templates.sh` và thêm một dòng vào mảng `GAMES`:

```bash
GAMES=(
  "template-projects/group-sort|group-sort"
  "template-projects/plane-quiz|plane-quiz"
  "template-projects/balloon-letter-picker|balloon-letter-picker"
  "template-projects/pair-matching|pair-matching"
  "template-projects/tro-choi-moi-cua-toi|tro-choi-moi-cua-toi"   # ← thêm dòng này
)
```

Chạy `./build-templates.sh tro-choi-moi-cua-toi` để xác minh quá trình build thành công và đầu ra nằm trong `builder-projects/electron-app-mui/templates/tro-choi-moi-cua-toi/game/`.

### Bước 3 — Đăng ký template trong quy trình CI

Mở `.github/workflows/build-all.yml` và thêm dự án của bạn vào ma trận job `build-templates`:

```yaml
matrix:
  include:
    - project_path: "template-projects/group-sort"
      game_id: "group-sort"
    - project_path: "template-projects/plane-quiz"
      game_id: "plane-quiz"
    - project_path: "template-projects/balloon-letter-picker"
      game_id: "balloon-letter-picker"
    - project_path: "template-projects/pair-matching"
      game_id: "pair-matching"
    - project_path: "template-projects/tro-choi-moi-cua-toi" # ← thêm dòng này
      game_id: "tro-choi-moi-cua-toi"
```

### Bước 4 — Thêm các kiểu dữ liệu TypeScript

Mở `builder-projects/electron-app-mui/src/renderer/src/types/index.ts`.

1. Định nghĩa hình dạng dữ liệu dự án của bạn:

```ts
// ── Trò Chơi Mới Của Tôi ───────────────────────────────────────────────────────────────
export interface TroChoiMoiCuaToiItem {
  id: string;
  text: string;
}
export interface TroChoiMoiCuaToiAppData {
  items: TroChoiMoiCuaToiItem[];
  _itemCounter: number;
}
```

2. Thêm nó vào union `AnyAppData`:

```ts
export type AnyAppData =
  | GroupSortAppData
  | QuizAppData
  | BalloonLetterPickerAppData
  | PairMatchingAppData
  | TroChoiMoiCuaToiAppData;
```

### Bước 5 — Viết thành phần trình soạn thảo

Tạo `builder-projects/electron-app-mui/src/renderer/src/games/tro-choi-moi-cua-toi/TroChoiMoiCuaToiEditor.tsx`.

Thành phần này phải chấp nhận các props sau:

```tsx
interface Props {
  appData: TroChoiMoiCuaToiAppData;
  projectDir: string;
  onChange: (data: TroChoiMoiCuaToiAppData) => void;
}
```

Gọi `onChange` với một bản sao (bất biến) mới của `appData` mỗi khi giáo viên thực hiện thay đổi — framework sẽ xử lý undo/redo và tự động lưu từ đó.

Sử dụng lại các thành phần cơ bản dùng chung từ `../../components/EditorShared` (các tab, bộ đếm, v.v.) và `../../components/ImagePicker` để chọn hình ảnh.

### Bước 6 — Đăng ký trình soạn thảo (registry ở renderer)

Mở `builder-projects/electron-app-mui/src/renderer/src/games/registry.ts` và thêm:

```ts
import TroChoiMoiCuaToiEditor from "./tro-choi-moi-cua-toi/TroChoiMoiCuaToiEditor";

export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  // ...các mục đã có...

  "tro-choi-moi-cua-toi": {
    Editor: TroChoiMoiCuaToiEditor as GameRegistryEntry["Editor"],
    createInitialData: () => ({
      items: [],
      _itemCounter: 0,
    }),
  },
};
```

`createInitialData` phải trả về một `TroChoiMoiCuaToiAppData` trống hợp lệ mà trình soạn thảo của bạn có thể hiển thị mà không bị lỗi.

### Bước 7 — Đăng ký transform dữ liệu nếu cần (tùy chọn)

Nếu hình dạng của `window.APP_DATA` mà game template của bạn **đọc trong lúc runtime** khác với hình dạng được lưu trong tệp dự án (ví dụ `balloon-letter-picker` làm phẳng một mảng đối tượng), hãy thêm transform vào `builder-projects/electron-app-mui/src/main/gameRegistry.ts`:

```ts
export const GAME_DATA_TRANSFORMS: Record<string, DataTransform> = {
  // ...các mục đã có...

  "tro-choi-moi-cua-toi": (appData) => {
    const data = appData as TroChoiMoiCuaToiAppData;
    // trả về hình dạng mà game template của bạn mong đợi
    return data.items.map(({ text }) => ({ text }));
  },
};
```

Nếu hình dạng runtime giống hệt hình dạng được lưu trữ, hãy bỏ qua bước này.

### Bước 8 — Kiểm tra cục bộ

```bash
# Build template mới và sao chép nó vào trình soạn thảo
./build-templates.sh tro-choi-moi-cua-toi

# Chạy trình soạn thảo ở chế độ dev
cd builder-projects/electron-app-mui
yarn dev
```

Kiểm tra rằng:

- [ ] Trò chơi của bạn xuất hiện dưới dạng thẻ trên màn hình chính với tên và mô tả chính xác.
- [ ] Tạo dự án mới mở được trình soạn thảo mà không có lỗi.
- [ ] Chỉnh sửa nội dung, lưu, đóng và mở lại hoạt động chính xác.
- [ ] Xem trước mở trò chơi với dữ liệu của giáo viên đã được tải.
- [ ] Xuất (dưới dạng thư mục và ZIP) tạo ra một trò chơi độc lập hoạt động được.

---

## CI / Release

Quy trình GitHub Actions (`.github/workflows/build-all.yml`) chạy tự động trên `workflow_dispatch`. Quy trình này:

1. Build mọi dự án template song song.
2. Tải tất cả các template đã build vào một khu vực tạm thời.
3. Sao chép chúng vào thư mục `templates/` của trình soạn thảo.
4. Đóng gói ứng dụng Electron cho Windows và Linux.
5. Tải lên các trình cài đặt dưới dạng artifacts của GitHub.
