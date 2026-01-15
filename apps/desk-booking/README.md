# Sancturary.OS // Desk Booking System

A futuristic, solarpunk-inspired desk management application built for the organization to manage office space for members and staff.

## 🌿 Aesthetic: Futuristic Solarpunk
This application embraces a **Solarpunk** design philosophy:
- **Organic & Harmonious**: Deep teals, lush greens, and sunlight gold accents.
- **Glassmorphism**: Translucent interfaces that feel light and integrated.
- **Micro-interactions**: Subtle animations and glows that breathe life into the workspace grid.
- **Noise Textures**: Grainy overlays for a tactile, "analog-future" feel.

## 🚀 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [ShadCN UI](https://ui.shadcn.com)
- **Backend/Database**: [Convex](https://convex.dev) (Real-time sync, conflict resolution)
- **Package Manager**: `pnpm`

## 🛠 Features
- **Interactive Floorplan**: A "Blueprint" style visualization of the office.
- **Admin Editor (`/admin`)**: Drag-and-drop interface to place and label desk units.
- **Conflict-Free Booking**: Backend logic ensures a desk cannot be double-booked for the same time slot.
- **Live Monitoring**: Real-time updates when desks are added or moved.

## 🏁 Getting Started

### 1. Start the Convex Backend
In a separate terminal, run the Convex development server to handle the database and functions:
```bash
npx convex dev
```

### 2. Start the Frontend
Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the user view or [http://localhost:3000/admin](http://localhost:3000/admin) for the organization admin view.

## 📂 Project Structure
- `/convex`: Database schema and serverless functions.
- `/src/app`: Next.js pages and layouts (Solarpunk theme implementation).
- `/src/components`: UI components including the `FloorPlan` and `AdminFloorPlanEditor`.

