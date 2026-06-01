<img width="1690" height="931" alt="whispurr-cover" src="https://github.com/user-attachments/assets/effd8a8b-0cab-4dc9-84d5-43fe00f8ec81" />

<div align="center">
  <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=20232A" alt="React Native" />
  <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
  <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/-NativeWind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="NativeWind" />
  <img src="https://img.shields.io/badge/-Convex-black?style=for-the-badge&logoColor=white&logo=convex&color=EE4E3A" alt="Convex" />
  <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=6C47FF" alt="Clerk" />
  <img src="https://img.shields.io/badge/-Stream-black?style=for-the-badge&logoColor=white&logo=stream&color=005FFF" alt="Stream" />
  <img src="https://img.shields.io/badge/-Giphy-black?style=for-the-badge&logoColor=white&logo=giphy&color=FF6666" alt="Giphy" />
</div>

---

## 📋 Table of Contents

1. 📋 [Project Overview](#project-overview)
2. 🔋 [Key Features](#key-features)
3. 🚀 [Planned Features](#planned-features)
4. 📌 [Getting Started](#getting-started)

---

## <a name="project-overview">📋 Project Overview</a>

**Whispurr** is a privacy-first encrypted messaging app built with **React Native** and **Expo**. Every message, image, and GIF is encrypted with **AES-256** on your device before it ever leaves — only you and your recipient can read it. Sign up in seconds, chat in real time powered by **Convex**, and stay notified with instant push delivery. No ads, no data harvesting, no compromises.

---

## <a name="key-features">🔋 Key Features</a>

👉 **End-to-End Encryption**: all messages and media are encrypted with AES-256-CBC on your device before transmission — the server never sees your plaintext

👉 **Real-Time Messaging**: instant message delivery powered by Convex, with live typing indicators and read receipts

👉 **GIF Support**: search and send GIFs directly in chat via the Giphy SDK — encrypted the same as any other message

👉 **Image Sharing**: pick photos from your gallery or snap directly with your camera and share them in any conversation

👉 **Link Previews**: URLs shared in chat automatically generate rich inline previews — title, description, and thumbnail

👉 **Message Reactions**: long-press any message to react with emoji — expressive without being verbose

👉 **Pin Conversations**: long-press any chat to pin it to the top of your inbox so your most important people are always front and centre

👉 **Push Notifications**: instant push delivery via Expo Notifications, with privacy-preserving lock screen previews that never expose message content

👉 **Authentication**: sign up with email/password or Google OAuth via Clerk, with session management and protected routes

👉 **Dark / Light Mode**: system-aware theme that automatically follows your device appearance, with OLED-friendly blacks in dark mode

---

## <a name="planned-features">🚀 Planned Features</a>

📞 **Voice & Video Calls**: real-time encrypted voice and video calls built on the Stream Video SDK — no phone number required, no third-party app needed

💬 **Group Chats**: create group conversations with multiple contacts, with per-group encryption keys and admin controls

💣 **Disappearing Messages**: set any conversation to auto-delete messages after a configurable timer — 1 hour, 24 hours, or 7 days

---

## <a name="getting-started">📌 Getting Started</a>

### Prerequisites

- Node.js 20+
- pnpm
- Expo CLI (`pnpm add -g expo-cli`)
- iOS Simulator (Xcode) or a physical iOS/Android device
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- A [Stream](https://getstream.io) account (for video calling)
- A [Giphy](https://developers.giphy.com) API key

### Installation

**Clone the repository**

```bash
git clone https://github.com/jaimenguyen168/Whispurr.git
cd Whispurr
```

**Install dependencies**

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```env
# Convex
CONVEX_DEPLOYMENT=
EXPO_PUBLIC_CONVEX_URL=

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_CLERK_FRONTEND_API_URL=

# Stream Video
EXPO_PUBLIC_STREAM_API_KEY=
STREAM_API_SECRET=

# Giphy
EXPO_PUBLIC_GIPHY_API_KEY=
```

### Convex Setup

```bash
pnpm dlx convex dev
```

This will prompt you to log in, create a project, and sync your schema automatically.

### Run the Development Server

```bash
pnpm start
```

Then press `i` for iOS Simulator or `a` for Android emulator, or scan the QR code with the Expo Go app on your device.

---

<div align="center">
  <p>Built with ❤️ using <a href="https://stackcraft.dev">StackCraft</a> · <a href="https://github.com/jaimenguyen168/Whispurr">View Repository</a></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
