# Daily Inspirational Quotes – Microsoft Edge Extension

This repository contains the **client‑side** source code for the *Daily Inspirational Quotes* extension for Microsoft Edge. The extension displays a daily inspirational quote and allows users to like/dislike quotes and submit feedback.

## 📁 Files Included

- `manifest.json` – Extension configuration
- `popup.html` – The popup interface
- `popup.js` – Extension logic (fetches quotes, sends votes/feedback)
- `icons/` – Icons for the extension (16px, 48px, 128px)

## 🔧 How It Works

1. The extension communicates with a backend server at `https://inspirefeeds.com/api`.
2. It generates an anonymous user ID (UUID) and stores it locally.
3. On opening the popup, it requests a random quote from the server.
4. User interactions (likes, dislikes, feedback) are sent to the server for permanent storage.

## 🚀 Live Extension

The published extension is available on the [Microsoft Edge Add‑ons store](https://microsoftedge.microsoft.com/addons/) (link to be added after approval).

## 📄 Privacy Policy

The privacy policy is hosted separately:  
[https://shaneclarke120192.github.io/privacy-policy/privacy-policy.html](https://shaneclarke120192.github.io/privacy-policy/privacy-policy.html)

## 👨‍💻 Author

- GitHub: [@shaneclarke120192](https://github.com/shaneclarke120192)

## 📝 License

This project is open source and available under the [MIT License](LICENSE). (You can add a `LICENSE` file later if you wish.)
