import SwiftUI
import WebKit

@main
struct Game2048iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct WebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        if let url = Bundle.module.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        WebView()
            .ignoresSafeArea()
    }
}
