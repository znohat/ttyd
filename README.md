## Herdr integration

This custom ttyd build is designed to work with the [Herdr Ably notification plugin](https://github.com/znohat/herdr-ttyd-ably), which publishes Herdr agent status events for ttyd to display as browser notifications.

![herdr-ttyd-ably-preview](https://raw.githubusercontent.com/znohat/ttyd/main/herdr-ttyd-ably-preview.gif)

## Desktop Notification

Desktop notifications are optional. When enabled, ttyd listens for `herdr.agent.done` messages on an Ably channel. Each message carries the agent status, such as `idle`, `done`, or `blocked`; ttyd shows it in a browser notification after the user grants permission.

If notification permission has not already been granted, the browser permission prompt is requested on the first interaction with the page, such as a click, tap, or key press. Allow it to enable desktop notifications.

To set it up:

1. In the [Ably dashboard](https://ably.com), create or select an app, then create a dedicated API key in its API Keys tab.
2. Restrict the key to the notification channel and grant it only the `subscribe` capability. The key is sent to browser clients, so do not use a key with broader permissions. See [Ably capabilities](https://ably.com/docs/auth/capabilities).
3. Start ttyd with the key and the same channel your Herdr event publisher uses:

   ```sh
   ttyd --ably-notify 'ABLY_SUBSCRIBE_ONLY_KEY@YOUR_NOTIFICATION_CHANNEL' herdr
   ```

Use `YOUR_NOTIFICATION_CHANNEL` for both the Herdr plugin and ttyd. You don't
need to create the channel in advance; Ably creates it on demand when ttyd
subscribes.

## Theming

```
ttyd -t 'theme={"background":"#faf4ed","foreground":"#575279","cursor":"#575279","cursorAccent":"#faf4ed","selectionBackground":"#dfdad9","black":"#f2e9e1","red":"#b4637a","green":"#286983","yellow":"#ea9d34","blue":"#56949f","magenta":"#907aa9","cyan":"#d7827e","white":"#575279","brightBlack":"#9893a5","brightRed":"#b4637a","brightGreen":"#286983","brightYellow":"#ea9d34","brightBlue":"#56949f","brightMagenta":"#907aa9","brightCyan":"#d7827e","brightWhite":"#575279"}' herdr
```

## Acknowledgments

This project builds on the original [ttyd](https://github.com/tsl0922/ttyd). Thank you to its authors and contributors for their work.
