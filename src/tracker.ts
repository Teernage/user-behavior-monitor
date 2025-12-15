import { sendBehaviorData } from './sender';
import { getUserID, incrementPV } from './storage';

// 页面加载时间
let pageLoadTime: number = Date.now();
// 上一个页面的 URL
let lastPageUrl: string = window.location.href;
let lastDwellReportedForLoadTime: number | null = null;


/**
 * @description: 跟踪用户行为（用户点击、MPA 首次加载 PV、通用停留时间、SPA 路由行为）
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 */
export const trackUserBehavior = (projectName: string, reportUrl: string) => {
  // 1. 通过事件委托捕获点击
  trackClicks(projectName, reportUrl);

  // 2. MPA 首次加载（页面初次进入）PV 上报
  trackMpaPageView(projectName, reportUrl);

  // 3. 通用停留时间（关闭页面/切换标签）上报
  trackPageDwellTime(projectName, reportUrl);

  // 4. SPA 路由行为（路由变化：先上报旧页面停留，再上报新页面 PV）
  trackSpaBehavior(projectName, reportUrl);
};

/**
 * @description: 上报页面停留时间
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 * @returns 
 */
const reportDwellTime = (projectName: string, reportUrl: string) => {
  if (lastDwellReportedForLoadTime === pageLoadTime) return;
  const dwellTime = Date.now() - pageLoadTime;
  if (dwellTime > 0) {
    sendBehaviorData({
      behavior: 'dwell',
      userId: getUserID(),
      projectName,
      timestamp: new Date().toISOString(),
      pageUrl: lastPageUrl,
      dwellTime,
    }, reportUrl);
    lastDwellReportedForLoadTime = pageLoadTime;
  }
};


/**
 *  捕获首屏 PV（MPA传统网页）
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 */
const trackMpaPageView = (projectName: string, reportUrl: string) => {
  window.addEventListener('load', () => {
    const userId = getUserID();
    const pv = incrementPV(); // 增加 PV 计数

    // 发送 PV 数据
    sendBehaviorData({
      behavior: 'pv',
      userId,
      projectName,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer || '', // 记录来源
      pv,
    }, reportUrl);

    // 记录页面加载时间
    pageLoadTime = Date.now();
    lastPageUrl = window.location.href;
  });
};


/**
 * @description: 捕获点击事件，通过 data-track-click 属性简化识别​
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 * @returns 
 */
const trackClicks = (projectName: string, reportUrl: string) => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // 如果目标元素带有 data-track-click 属性​
    if (target && target.dataset.trackClick) {
      const behaviorData = {
        behavior: 'click',
        userId: getUserID(),
        projectName,
        timestamp: new Date().toISOString(),
        element: target.tagName,
        action: target.dataset.trackClick,  // 自定义的点击行为​
        pageUrl: window.location.href,
        referrer: lastPageUrl, // 记录点击时的页面来源
      };

      // 发送点击事件数据到服务端​
      sendBehaviorData(behaviorData, reportUrl);
    }
  });
};



/**
 * @description: 捕获页面停留时间（关闭/隐藏）
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 * @returns 
 */
const trackPageDwellTime = (projectName: string, reportUrl: string) => {
  // 在 beforeunload 时计算停留时间
  window.addEventListener('beforeunload', () => {
    reportDwellTime(projectName, reportUrl);
  });

  window.addEventListener('pagehide', () => {
    reportDwellTime(projectName, reportUrl);
  });

  // 在 visibilitychange（切换标签）时计算停留时间
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportDwellTime(projectName, reportUrl);
    }
  });
};

/**
 * @description: 捕获 SPA 路由行为（路由变化：先上报旧页面停留，再上报新页面 PV）
 * @param projectName 项目名称
 * @param reportUrl 上报 URL
 * @returns 
 */
const trackSpaBehavior = (projectName: string, reportUrl: string) => {
  /**
   * @description: 处理路由变化事件回调
   * @returns 
   */
  const handleRouteChange = () => {

    if (window.location.href === lastPageUrl) return;

    // 1. 上报前一个页面的停留时间
    reportDwellTime(projectName, reportUrl);

    // 2. 更新为新页面的状态
    pageLoadTime = Date.now();
    lastPageUrl = window.location.href;

    // 3. 上报新页面 PV
    const userId = getUserID();
    const pv = incrementPV();
    sendBehaviorData({
      behavior: 'pv',
      userId,
      projectName,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: lastPageUrl, // SPA 内部跳转，来源是上一个页面
      pv,
    }, reportUrl);
  };

  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('popstate', handleRouteChange);

  const originalPush = history.pushState;
  const originalReplace = history.replaceState;

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPush.apply(this, args);
    handleRouteChange();
  };

  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    originalReplace.apply(this, args);
    handleRouteChange();
  };
};