# Legal Diary Pro - Mobile Setup Guide

Is project ko Mobile APK mein badalne ke liye neeche diye gaye steps follow karein.

## 1. Local Setup
1. Node.js install karein.
2. Commands run karein:
   ```bash
   npm install
   ```

## 2. PWA Testing
PWA ke roop mein chalane ke liye:
```bash
npm run build
npm run preview
```

## 3. Expo Mobile Build (APK)
APK banane ke liye hum **EAS Build** ka use karenge:
1. EAS CLI install karein:
   ```bash
   npm install -g eas-cli
   ```
2. Expo account mein login karein:
   ```bash
   eas login
   ```
3. Build start karein:
   ```bash
   eas build -p android --profile preview
   ```

## 4. Mobile Installation
EAS build poora hone ke baad aapko ek link/QR code milega. Use scan karke aap directly APK download karke install kar sakte hain.

---
*Created with ❤️ via AI Studio*
