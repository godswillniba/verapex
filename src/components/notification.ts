import { useEffect } from 'react';

// Function to check if running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone || 
         document.referrer.includes('android-app://');
}

// Hook to check notification support on component mount
export function useNotificationCheck() {
  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('Notifications are not supported on your browser');
      alert('Notifications are not supported on your browser');
    }
  }, []);
}

export async function requestNotificationPermission(): Promise<void> {
  try {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        await setupNotificationSubscription();
      } catch (error) {
        console.error('Subscription error:', error);
      }
    }
  } catch (error) {
    console.error('Permission error:', error);
  }
}

export async function handleNotificationClick(): Promise<void> {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      try {
        await setupNotificationSubscription();
      } catch (error) {
        console.error('Subscription error:', error);
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Permission error:', error);
  }
}

async function setupNotificationSubscription(): Promise<void> {
  // Register service worker if not already registered
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  // Get subscription
  const subscription = await registerPushSubscription();

  if (!subscription) {
    throw new Error('Failed to create push subscription');
  }

  // Save subscription to server
  const response = await saveSubscription(subscription);

  if (response?.success) {
    // Send welcome notification through service worker
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Notifications Enabled', {
      body: 'You will now receive push notifications from VeraPex',
      icon: '/favicon/web-app-manifest-192x192.png',
      badge: '/favicon/web-app-manifest-192x192.png',
      tag: 'notification-setup',
      vibrate: [100, 50, 100],
      requireInteraction: false
    });
  } else {
    throw new Error('Server response error: ' + JSON.stringify(response));
  }
}

async function registerPushSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Using existing push subscription');
      return existingSubscription;
    }

    console.log('Creating new push subscription');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BJrydm1aMTGQPSCTbh3OoPxGEcK2N00UlCL8oPuu9THDMomCTdyPOacATELouVKvjg1J1vv-RNfX4ZnGznHOwhQ'
      )
    });

    return subscription;
  } catch (error) {
    console.error('Error creating push subscription:', error);
    throw new Error('Failed to create push subscription: ' + error.message);
  }
}

async function saveSubscription(subscription: PushSubscription): Promise<{ success?: boolean } | null> {
  try {
    const response = await fetch('https://e3a4d8a4-7f92-4dd5-bbcb-9635bb636555-00-18b13vc85azfk.spock.replit.dev/save-subscription.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw new Error('Failed to save subscription: ' + error.message);
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}