// Google Analytics 4 helper functions
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const trackPageView = (title: string, path: string) => {
  gtag('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path
  });
};

export const trackReadingTime = (articleTitle: string, timeSeconds: number) => {
  gtag('event', 'reading_time', {
    article_title: articleTitle,
    time_seconds: timeSeconds
  });
};

export const trackShare = (articleTitle: string, method: string) => {
  gtag('event', 'share', {
    content_type: 'article',
    item_id: articleTitle,
    method: method
  });
};
