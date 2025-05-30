# 2248 Inspired Puzzle

This project now hosts a game inspired by **2248**. Instead of sliding tiles, you connect chains of adjacent tiles with the same value. Selected tiles merge into one tile whose value is the sum of the chain. New numbers appear after each merge and the game tracks the highest tile you reach. Whenever a new maximum tile is created, all of the smallest tiles are cleared from the board to make more space.

## Controls
- **Mouse / Touch:** drag across adjacent tiles of the same value to create a chain.
- **New Game:** start a fresh board.
- **Toggle Theme:** switch between light and dark themes.

Your best score, theme preference and highest tile are stored in `localStorage`.

Enjoy!


## iOS Version

An iOS wrapper using SwiftUI is included in the `ios` folder. The wrapper loads the existing web version in a `WKWebView` so the gameplay is identical. Open `ios/Package.swift` in Xcode and run the `Game2048iOS` target to play on iPhone or iPad.
