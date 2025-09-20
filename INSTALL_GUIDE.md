
# How to Install Zepmeds on Your Phone

This guide explains two ways to get the Zepmeds app on your phone.

1.  **PWA Installation (Recommended for most users):** Install the web app directly to your home screen. It's fast, lightweight, and always up-to-date.
2.  **Native APK/IPA Build (For developers):** Convert the web app into a native Android (.apk) or iOS (.ipa) package using Capacitor.

---

## Method 1: PWA Installation (Directly from Browser)

This method makes the web app work just like a native app and is the easiest way to install.

### For Android Users (Using Google Chrome)
1.  **Open the Website:** Launch Google Chrome and navigate to the Zepmeds website URL.
2.  **Look for the Install Prompt:**
    *   Chrome will often automatically show a pop-up banner: **"Add Zepmeds to Home Screen"**.
    *   Simply tap this banner.
3.  **Manual Installation (If no prompt):**
    *   Tap the **three-dot menu icon** in the top-right corner.
    *   Look for the **"Install app"** or **"Add to Home screen"** option and tap it.
4.  **Confirm Installation:** Tap **"Install"** or **"Add"**.
5.  **Done!** The Zepmeds icon will now be on your home screen.

### For iOS Users (iPhone/iPad using Safari)
1.  **Open the Website:** Launch Safari and navigate to the Zepmeds website URL.
2.  **Tap the Share Icon:** This is the square icon with an arrow pointing upwards.
3.  **Find "Add to Home Screen":** Scroll down and tap on **"Add to Home Screen"**.
4.  **Confirm the Name:** Tap **"Add"** in the top-right corner.
5.  **Done!** The Zepmeds app icon will appear on your home screen.

---

## Method 2: Native Build with Capacitor (For Developers)

If you need a native `.apk` (Android) or `.ipa` (iOS) file, you can wrap the existing PWA-enabled web app using Capacitor.

### Prerequisites

*   You must have **Node.js** and `npm` installed on your computer.
*   You will need **Android Studio** (for Android) or **Xcode** (for iOS) installed.

### Step-by-Step Guide

**Step 1: One-Time Project Setup**
_You only need to run these commands once for your project._

Open a terminal in the project's root directory and run these commands one by one:
```bash
# 1. Install Capacitor's command-line tools
npm install @capacitor/cli @capacitor/core

# 2. Initialize Capacitor in your project (sets app name and ID)
npx cap init "Zepmeds" "com.zepmeds.app"

# 3. Install and add the native Android platform
npm install @capacitor/android
npx cap add android

# (Optional) For iOS, run these commands
# npm install @capacitor/ios
# npx cap add ios
```

**Step 2: Build the Web App**
_**IMPORTANT:** You must run this command every time you make changes to the web app's code._

This command creates an optimized, production-ready build of your web app in a folder named `out`.
```bash
npm run build
```

**Step 3: Sync Web Build with Native Platforms**
This command copies the final web app files from the `out` folder into your native Android/iOS projects.
```bash
npx cap sync
```

**Step 4: Open and Build the Native Project**
Now, you can open the native project in its dedicated IDE to create the final app file.

*   **For Android (.apk):**
    1.  Run this command to open your project in Android Studio:
        ```bash
        npx cap open android
        ```
    2.  Wait for Android Studio to fully load and index the project.
    3.  From the top menu, go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
    4.  Once the build is complete, a notification will appear. Click on **"locate"** to find your `app-debug.apk` file.

*   **For iOS (.ipa):**
    1.  Run this command to open your project in Xcode:
        ```bash
        npx cap open ios
        ```
    2.  In Xcode, select your target device and use the "Product" -> "Archive" menu to build and export the app.

This workflow gives you the flexibility of a PWA with the power of native packaging when you need it.
