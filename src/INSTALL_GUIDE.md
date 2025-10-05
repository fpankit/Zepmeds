# How to Build the Zepmeds Android App (.apk)

This guide provides the exact, step-by-step commands to build a native `.apk` file for Android from your Zepmeds web application using Capacitor. Follow them in order.

### Prerequisites

*   You must have **Node.js** and `npm` installed on your computer.
*   You will need **Android Studio** installed and correctly set up.

---

## Step 1: One-Time Project Setup

_You only need to run these commands **once** for your project._

Open a terminal in the project's root directory and run these commands one by one:

```bash
# 1. Install Capacitor's command-line tools and core library
npm install @capacitor/cli @capacitor/core

# 2. Initialize Capacitor in your project
# (This sets the app name and a unique package ID)
npx cap init "Zepmeds" "com.zepmeds.app"

# 3. Install and add the native Android platform
npm install @capacitor/android
npx cap add android
```
> **Note:** If you want to build for iOS in the future, you can also run `npm install @capacitor/ios` and `npx cap add ios`.

---

## Step 2: Build the Web App

_**IMPORTANT:** You must run this command **every time** you make changes to the web app's code. This command creates the `out` folder that Capacitor needs._

```bash
npm run build
```

---

## Step 3: Open and Build the Native Android Project

_Run this command **only after** `npm run build` has completed successfully._

This command opens your project directly in Android Studio, where you will create the final app file.

```bash
# 1. Run this command to open your project in Android Studio:
npx cap open android

# 2. Wait for Android Studio to fully load and index the project. This may take a minute.

# 3. From the top menu in Android Studio, go to:
#    Build -> Build Bundle(s) / APK(s) -> Build APK(s)

# 4. Once the build is complete, a notification will pop up in the bottom-right corner.
#    Click on "locate" to find your `app-debug.apk` file in your project's file system.
```

That's it! You now have a native Android APK that you can install on a device.
