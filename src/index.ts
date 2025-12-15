
import { trackUserBehavior } from './tracker';
import { getUserID, isUVRecorded, setUVRecorded } from './storage';
import { sendBehaviorData } from './sender';

interface MonitorConfig {
  projectName: string; // 当前项目名称，用于区分项目​
  reportUrl: string;   // 上报服务器的地址​
}

// 初始化用户行为监控​
export const initUserBehaviorMonitor = ({ projectName, reportUrl }: MonitorConfig) => {
  const userId = getUserID();

  // UV 统计：如果是用户首次访问，记录 UV​
  if (!isUVRecorded()) {
    sendBehaviorData({
      behavior: 'uv',
      userId,
      projectName,
      timestamp: new Date().toISOString(),
    }, reportUrl);
    setUVRecorded();
  }

  // 启动点击行为、PV 统计和页面停留时间监控​
  trackUserBehavior(projectName, reportUrl);
};​