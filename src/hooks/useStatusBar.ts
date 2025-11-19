import { useEffect, useCallback } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  const setStatusBarStyle = useCallback(async (style: Style) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setStyle({ style });
    } catch (e) {
      console.error('Failed to set status bar style', e);
    }
  }, []);

  const setStatusBarColor = useCallback(async (color: string) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (e) {
      console.error('Failed to set status bar color', e);
    }
  }, []);

  const setOverlay = useCallback(async (overlay: boolean) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay });
    } catch (e) {
      console.error('Failed to set overlay', e);
    }
  }, []);

  return { setStatusBarStyle, setStatusBarColor, setOverlay };
};

