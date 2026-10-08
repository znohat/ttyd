import { Realtime } from 'ably';
import { Component } from 'preact';
import { buildNotificationContent } from '../notification-content';

export class Notifications extends Component {
    private realtime?: Realtime;
    private notificationRegistration?: ServiceWorkerRegistration;
    private enableStarted = false;
    private subscribeKey?: string;
    private channelName?: string;

    async componentDidMount() {
        try {
            const response = await fetch('notification-config');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const config = (await response.json()) as {
                enabled?: boolean;
                subscribeKey?: string;
                channel?: string;
            };
            if (!config.enabled || !config.subscribeKey || !config.channel) return;

            this.subscribeKey = config.subscribeKey;
            this.channelName = config.channel;
            document.addEventListener('pointerdown', this.enableOnInteraction, true);
            document.addEventListener('keydown', this.enableOnInteraction, true);
        } catch (error) {
            console.error('ttyd notifications: could not load notification configuration.', error);
        }
    }

    componentWillUnmount() {
        this.removeInteractionListeners();
        this.realtime?.close();
    }

    render() {
        return null;
    }

    private enable = async () => {
        if (this.enableStarted) return;
        this.enableStarted = true;
        const subscribeKey = this.subscribeKey;
        const channelName = this.channelName;
        if (!subscribeKey || !channelName) {
            this.enableStarted = false;
            return;
        }

        if (!('Notification' in window)) {
            this.enableStarted = false;
            console.warn('ttyd notifications: this browser does not support desktop notifications.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                this.enableStarted = false;
                console.info(`ttyd notifications: permission ${permission}; notifications are disabled.`);
                return;
            }

            if ('serviceWorker' in navigator) {
                try {
                    this.notificationRegistration = await navigator.serviceWorker.register('notifications-sw.js');
                } catch (error) {
                    console.warn('ttyd notifications: could not register the notification click handler.', error);
                }
            }

            this.realtime?.close();
            const realtime = new Realtime({ key: subscribeKey, clientId: 'ttyd-browser' });
            this.realtime = realtime;
            realtime.connection.on('failed', change => {
                this.enableStarted = false;
                console.error('ttyd notifications: Ably connection failed.', change.reason);
            });
            const channel = realtime.channels.get(channelName);
            await channel.subscribe(async message => {
                if (message.name !== 'herdr.agent.done' || !message.data) return;

                const data = message.data as {
                    status?: string;
                    agent?: string | null;
                };
                if (typeof data.status !== 'string' || !data.status.trim()) return;

                const content = buildNotificationContent(data.status, data.agent);
                if (!content) return;
                const { title, body } = content;
                const options: NotificationOptions = {
                    body,
                    data: { url: window.location.href },
                };
                if (content.icon) options.icon = new URL(content.icon, window.location.href).href;
                try {
                    if (this.notificationRegistration) {
                        await this.notificationRegistration.showNotification(title, options);
                    } else {
                        const notification = new Notification(title, options);
                        notification.onclick = () => window.focus();
                        notification.onshow = () => console.debug('ttyd notifications: desktop notification shown.');
                        notification.onerror = () =>
                            console.error('ttyd notifications: the browser could not display the notification.');
                    }
                    console.debug(`ttyd notifications: requested “${title}” notification.`);
                } catch (error) {
                    console.error('ttyd notifications: could not show desktop notification.', error);
                }
            });
            console.info(`ttyd notifications: listening on ${channelName}.`);
        } catch (error) {
            this.enableStarted = false;
            this.realtime?.close();
            this.realtime = undefined;
            console.error('ttyd notifications: could not connect to Ably.', error);
        }
    };

    private enableOnInteraction = () => {
        this.removeInteractionListeners();
        void this.enable();
    };

    private removeInteractionListeners() {
        document.removeEventListener('pointerdown', this.enableOnInteraction, true);
        document.removeEventListener('keydown', this.enableOnInteraction, true);
    }
}
