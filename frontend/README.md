# MedTrack: Frontend Patient Hub (Web)

The core web-first interface for **MedTrack**, a premium medication management and clinical adherence platform.

---

## 🛠️ Tech Stack & Implementation Details

### ⚡ Framework & Languages
*   **Next.js 15 (App Router)**: Utilizing React Server Components and optimized Client-Side Hydration.
*   **TypeScript**: Ensuring type-safe clinical data flows.
*   **Tailwind CSS**: Custom utility-first styling with a bespoke design system.

### 🎨 Visual Identity & UX
*   **Floating Sidebar Architecture**: Specialized 448px margin (`ml-[28rem]`) for floating UI boards.
*   **Minimalist Scrollbar Management**: Hidden scrollbars via `no-scrollbar` utility to maximize visual clarity.
*   **Premium Clinical Teal Theme**: Base hex `#008080`, with tints (`#e6f2f2`, `#f8fafb`) for backgrounds.
*   **Hydration-First Rendering**: Custom `mounted` state guards for all client pages to eliminate server-client mismatches.

---

## 🏗️ Project Structure

*   **/src/app**: Next.js App Router definitions.
    *   `/dashboard`: Core Patient/Doctor overview panels.
    *   `/today`: Active daily medication logging.
    *   `/history`: Historical medical record logs.
    *   `/login` & `/signup`: Premium split-screen authentication.
*   **/src/components**: Reusable clinical primitives.
    *   `Sidebar.tsx`: The primary floating navigation hub.
*   **/src/lib**: Business logic, API routes, and crypto utilities.
*   **/src/context**: Real-time state (Socket.io).

---

## 🚀 Development Workflow

1.  **Installation**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## 🔒 Security Notice
All patient identifiers and sensitive medical data are encrypted before persistent storage on client nodes. The Hub ensures end-to-end clinical privacy.

---
*MedTrack Frontend: Advancing Clinical Precision.*
