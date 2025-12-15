/**
 * 发送用户行为数据
 * @param data - 用户行为数据
 * @param url - 数据上报的URL
 */
export const sendBehaviorData = (data: Record<string, any>, url: string) => {
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch((error) => console.error('Error sending behavior data:', error));
  }
};