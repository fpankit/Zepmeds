
# How to Install Zepmeds on Your Phone

This guide explains two ways to get the Zepmeds app on your phone.

1.  **PWA Installation (Recommended for most users):** Install the web app directly to your home screen. It's fast, lightweight, and always up-to-date.
2.  **Native APK/IPA Build (For developers):** Convert the web app into a native Android (.apk) or iOS (.ipa) package using Capacitor.

---

## Method 1: PWA Installation (Directly from Browser)

This method makes the web app work just like a native app.

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

If you need a native `.apk` (Android) or `.ipa` (iOS) file, you can wrap the existing web app using Capacitor.

### Prerequisites

*   You must have **Node.js** installed on your computer.
*   You will need **Android Studio** (for Android) or **Xcode** (for iOS) installed.

### Step-by-Step Guide

**Step 1: Set up Capacitor in the Project**

Open a terminal in the project's root directory and run these commands one by one:

```bash
# Install the Capacitor CLI
npm install @capacitor/cli @capacitor/core

# Initialize Capacitor in your project
npx cap init "Zepmeds" "com.zepmeds.app"
```

**Step 2: Install Native Platforms**

Next, add the native platforms you want to target:

```bash
# For Android
npm install @capacitor/android
npx cap add android

# For iOS
npm install @capacitor/ios
npx cap add ios
```

**Step 3: Build the Web App**

Create an optimized, production-ready build of the web app. The PWA configurations we added earlier will be included.

```bash
npm run build
```

**Step 4: Sync the Web Build with Native Platforms**

This command copies your web build into the native Android/iOS projects.

```bash
npx cap sync
```

**Step 5: Open and Build the Native Project**

Now, you can open the native project in its dedicated IDE.

*   **For Android:**
    ```bash
    npx cap open android
    ```
    This will open your project in Android Studio. From there, you can use the IDE's build tools to generate a signed `.apk` or App Bundle.

*   **For iOS:**
    ```bash
    npx cap open ios
    ```
    This will open your project in Xcode. From there, you can build and archive the app for distribution.

This workflow gives you the flexibility of a PWA with the power of native packaging when you need it.
