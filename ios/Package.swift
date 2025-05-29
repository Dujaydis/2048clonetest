// swift-tools-version: 6.1
import PackageDescription

let package = Package(
    name: "Game2048iOS",
    platforms: [
        .iOS(.v14)
    ],
    products: [
        .executable(name: "Game2048iOS", targets: ["Game2048iOS"])
    ],
    targets: [
        .executableTarget(
            name: "Game2048iOS",
            resources: [
                .copy("index.html"),
                .copy("game.js"),
                .copy("styles.css")
            ]
        )
    ]
)
