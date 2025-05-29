# 2048 Clone

This is a simple web-based clone of the classic puzzle game **2048**. The game is implemented in plain HTML, CSS, and JavaScript. Just open `index.html` in your browser to start playing.

## Controls
- **Keyboard:** use the arrow keys to move the tiles.
- **Touch:** swipe in any direction on the board when using a touch device.
- **Undo:** click **Undo** to revert the last move (up to 20 steps are stored).
- **Dark Mode:** use **Toggle Theme** to switch between light and dark themes.

Your best score and theme preference are saved in your browser's `localStorage`.

Enjoy!


## iOS Version

An iOS wrapper using SwiftUI is included in the `ios` folder. The wrapper loads the existing web version in a `WKWebView` so the gameplay is identical. Open `ios/Package.swift` in Xcode and run the `Game2048iOS` target to play on iPhone or iPad.
