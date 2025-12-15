const USER_ID_KEY = 'user_behavior_user_id';
const PV_COUNT_KEY = 'user_behavior_pv_count';
const UV_STORAGE_KEY = 'user_behavior_uv';

// 获取用户唯一标识（UUID）​
export const getUserID = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

/**
 * @description: 生成唯一标识符
 * @return {string} 唯一标识符
 */
const generateUUID = (): string => {
  return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};


export const incrementPV = (): number => {
  const today = new Date().toISOString().split('T')[0]; // 获取当天的日期​
  const pvData = localStorage.getItem(`${PV_COUNT_KEY}_${today}`);
  const newPV = (pvData ? parseInt(pvData, 10) : 0) + 1;
  localStorage.setItem(`${PV_COUNT_KEY}_${today}`, newPV.toString());
  return newPV;
};


// 检查是否已经记录 UV​
export const isUVRecorded = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(UV_STORAGE_KEY) === today;
};


// 设置 UV 记录​
export const setUVRecorded = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(UV_STORAGE_KEY, today);
};