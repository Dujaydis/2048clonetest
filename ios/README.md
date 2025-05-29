# Game2048iOS

This folder contains a minimal SwiftUI wrapper that packages the existing web-based 2048 game as an iOS application. The app uses a `WKWebView` to load the local `index.html` from the app bundle, so the gameplay and styles are identical to the web version.

## Building
1. Open this package in Xcode (`File > Open...`) and select `Package.swift`.
2. Choose an iOS simulator or device and run the `Game2048iOS` target.

The resources (`index.html`, `game.js`, and `styles.css`) are included as bundle resources, so no additional configuration is required.
