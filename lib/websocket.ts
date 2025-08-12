import {
	Client,
	type IMessage,
	type StompHeaders,
	type StompSubscription,
	type IFrame,
} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Notification } from "@/types";

const WS_URL = "https://api-auction.tenzorsoft.uz/ws";


const DBG = true;
const log  = (...a: unknown[]) => DBG && console.log("%c[WS]", "color:#0bf", ...a);
const warn = (...a: unknown[]) => console.warn("[WS]", ...a);
const err  = (...a: unknown[]) => console.error("[WS]", ...a);

export function connectNotifications(
 userId: number | string,
 onMessage: (n: any) => void
): () => void {


	const client = new Client({
		webSocketFactory: () => new SockJS(WS_URL),
		reconnectDelay: 3000,
		debug: (s) => log("[STOMP]", s),
		connectHeaders: { userId: String(userId) } as StompHeaders,
	});

	let subById: StompSubscription | null = null;
	let subAll : StompSubscription | null = null;

	client.onConnect = (frame: IFrame) => {
		log("CONNECTED frame headers:", frame.headers);

		const topicById = `/topic/notification/getAllNotifications/${userId}`;
		subById = client.subscribe(topicById, (msg: IMessage) => handleMsg(msg, onMessage));

		const topicAll = "/topic/notification/getAllNotifications";
		subAll = client.subscribe(topicAll, (msg: IMessage) => handleMsg(msg, onMessage));

		log("SUBSCRIBED:", topicById, "and", topicAll);

		client.publish({
			destination: `/app/notification/getAllNotifications/${userId}`,
			body: "",
		});
		log("PUBLISH history request for", userId);
	};

	client.onStompError = (frame: IFrame) => {
		err("STOMP ERROR:", frame.headers["message"], frame.body);
	};
	client.onWebSocketError = (e: Event) => err("WebSocket ERROR:", e);
	client.onWebSocketClose = (e: CloseEvent) => warn("WebSocket CLOSED:", e.code, e.reason);
	client.onDisconnect = (frame: IFrame) => log("DISCONNECTED:", frame?.headers);

	client.activate();

	return () => {
		try {
			subById?.unsubscribe();
			subAll?.unsubscribe();
		} catch {}
		client.deactivate().catch(() => {});
	};
}

function handleMsg(msg: IMessage, onMessage: (n: Notification) => void): void {
	const body = msg.body ?? "";
	try {
		const parsed = JSON.parse(body);
		if (Array.isArray(parsed)) {
			log("RECV (array)", parsed.length);
			for (const it of parsed) {
				const n = toNotificationDto(it);
				if (n) onMessage(n);
			}
		} else {
			log("RECV (obj)", parsed);
			const n = toNotificationDto(parsed);
			if (n) onMessage(n);
		}
	} catch {
		warn("RECV (raw)", body);
	}
}

function toNotificationDto(raw: unknown): Notification | null {
	if (!raw || typeof raw !== "object") return null;
	const r = raw as any;

	const title = r.title != null ? String(r.title) : "";
	const body  = r.body  != null ? String(r.body)  : "";
	if (!title && !body) return null;

	const n: Notification = {
		id: String(r.id || Date.now()),
		userId: String(r.userId || ""),
		title,
		body,
		type: r.type || "GENERAL",
		createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
		isRead: Boolean(r.read ?? false),
	};
	return n;
}