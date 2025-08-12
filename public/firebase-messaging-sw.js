importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
	apiKey: "AIzaSyBRfSRHUszwxuoQuDNfWgpakrMS6IWOmMA",
	authDomain: "auction-e9696.firebaseapp.com",
	projectId: "auction-e9696",
	storageBucket: "auction-e9696.firebasestorage.app",
	messagingSenderId: "714963113012",
	appId: "1:714963113012:web:4abf85c9bebbefdf8f2661",
	measurementId: "G-F45ME0EVE6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	console.log('[SW] onBackgroundMessage:', payload);
	const { title = "Notification!", body = "", icon } = payload.notification || {};
	self.registration.showNotification(title, { body, icon });
});