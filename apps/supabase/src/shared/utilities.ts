const RUNTIME_ENVIRONMENT = import.meta.env.PUBLIC_RUNTIME_ENVIRONMENT;

export const emitEvent = (element: HTMLElement, name: string, detail = {}, bubbles = true, composed = true) => {
  element.dispatchEvent(
    new CustomEvent(name, { bubbles, composed, detail }),
  );
};

export const isObjectEmpty = <T extends object>(obj: T): boolean => {
  return Object.entries(obj).length === 0;
}

export const isLocalhost = RUNTIME_ENVIRONMENT === 'local';
export const isDevelopment = RUNTIME_ENVIRONMENT === 'development';
export const isProduction = RUNTIME_ENVIRONMENT === 'production';

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T & { cancel: () => void } => {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return throttled;
};
