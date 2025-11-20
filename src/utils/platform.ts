import { Capacitor } from "@capacitor/core";

export const isIOSNative = (): boolean => {
	if (typeof window === "undefined") {
		return false;
	}

	if (!Capacitor.isNativePlatform()) {
		return false;
	}

	return Capacitor.getPlatform() === "ios";
};
