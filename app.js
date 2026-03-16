App({
  // 全局数据
  globalData: {
    starsAdjustHistory: []
  },

  onLaunch() {
    // 初始化数据
    this.initData();
  },

  // 初始化数据
  initData() {
    if (!wx.getStorageSync('tasks')) {
      wx.setStorageSync('tasks', [
        {
          id: '1',
          name: '早起',
          desc: '7点前起床',
          stars: 1,
          completedDates: []
        },
        {
          id: '2',
          name: '阅读',
          desc: '阅读30分钟',
          stars: 2,
          completedDates: []
        },
        {
          id: '3',
          name: '运动',
          desc: '运动20分钟',
          stars: 2,
          completedDates: []
        },
        {
          id: '4',
          name: '学习',
          desc: '学习新技能',
          stars: 3,
          completedDates: []
        },
        {
          id: '5',
          name: '冥想',
          desc: '冥想15分钟',
          stars: 0.5,  // 0.5颗星的任务示例
          completedDates: []
        }
      ]);
    }
    
    if (!wx.getStorageSync('rewards')) {
      wx.setStorageSync('rewards', [
        {
          id: '1',
          name: '冰淇淋',
          icon: '/images/icecream.png',
          cost: 5,
          description: '享受一支美味的冰淇淋'
        },
        {
          id: '2',
          name: '看电影',
          icon: '/images/movie.png',
          cost: 10,
          description: '看一场喜欢的电影'
        },
        {
          id: '3',
          name: '小礼物',
          icon: '/images/gift.png',
          cost: 20,
          description: '给自己买个小礼物'
        },
        {
          id: '4',
          name: '大餐',
          icon: '/images/dinner.png',
          cost: 30,
          description: '吃一顿美味大餐'
        },
        {
          id: '5',
          name: '小零食',
          icon: '/images/snack.png',
          cost: 2.5,  // 2.5颗星的奖励示例
          description: '买个小零食'
        }
      ]);
    }
    
    if (!wx.getStorageSync('stats')) {
      wx.setStorageSync('stats', {
        totalStars: 0,
        completedTasks: 0,
        exchangedRewards: []
      });
    }
    
    if (!wx.getStorageSync('starsAdjustHistory')) {
      wx.setStorageSync('starsAdjustHistory', []);
    }
    
    this.globalData.starsAdjustHistory = wx.getStorageSync('starsAdjustHistory') || [];
  },

  // 获取任务列表
  getTasks() {
    return wx.getStorageSync('tasks') || [];
  },

  // 获取奖励列表
  getRewards() {
    return wx.getStorageSync('rewards') || [];
  },

  // 获取统计数据
  getStats() {
    return wx.getStorageSync('stats') || { 
      totalStars: 0, 
      completedTasks: 0, 
      exchangedRewards: [] 
    };
  },

  // 根据ID获取奖励
  getRewardById(id) {
    const rewards = this.getRewards();
    return rewards.find(r => r.id === id) || {};
  },

  // 完成任务
  completeTask(taskId) {
    const tasks = this.getTasks();
    const stats = this.getStats();
    const today = new Date().toDateString();
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { success: false, message: '任务不存在' };
    }
    
    // 检查今天是否已完成
    if (tasks[taskIndex].completedDates.includes(today)) {
      return { success: false, message: '今天已完成该任务' };
    }
    
    // 更新任务
    tasks[taskIndex].completedDates.push(today);
    
    // 更新统计（支持小数）
    const earnedStars = tasks[taskIndex].stars;
    const oldTotal = stats.totalStars;
    stats.totalStars = this.roundToHalf(parseFloat(stats.totalStars) + parseFloat(earnedStars));
    stats.completedTasks += 1;
    
    // 保存数据
    wx.setStorageSync('tasks', tasks);
    wx.setStorageSync('stats', stats);
    
    // 记录调整历史（完成任务）
    this.addStarsAdjustHistory(earnedStars, `完成任务:${tasks[taskIndex].name}`, oldTotal, stats.totalStars);
    
    return { 
      success: true, 
      stars: earnedStars 
    };
  },

  // 兑换奖励
  exchangeReward(rewardId) {
    const rewards = this.getRewards();
    const stats = this.getStats();
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: '奖励不存在' };
    }
    
    if (parseFloat(stats.totalStars) < parseFloat(reward.cost)) {
      return { success: false, message: '星星不足' };
    }
    
    const oldTotal = stats.totalStars;
    
    // 扣除星星（支持小数）
    stats.totalStars = this.roundToHalf(parseFloat(stats.totalStars) - parseFloat(reward.cost));
    
    // 记录兑换历史
    if (!stats.exchangedRewards) {
      stats.exchangedRewards = [];
    }
    stats.exchangedRewards.push({
      rewardId: rewardId,
      rewardName: reward.name,
      cost: reward.cost,
      date: new Date().toLocaleString()
    });
    
    // 保存数据
    wx.setStorageSync('stats', stats);
    
    // 记录调整历史（兑换奖励）
    this.addStarsAdjustHistory(-reward.cost, `兑换:${reward.name}`, oldTotal, stats.totalStars);
    
    return { success: true };
  },

  // ========== 星星调整相关方法 ==========
  
  // 四舍五入到0.5
  roundToHalf(num) {
    return Math.round(num * 2) / 2;
  },

  // 调整星星数量（支持小数）
  adjustStars(amount, reason) {
    const stats = this.getStats();
    const oldTotal = parseFloat(stats.totalStars);
    const newTotal = this.roundToHalf(Math.max(0, oldTotal + parseFloat(amount)));
    
    stats.totalStars = newTotal;
    wx.setStorageSync('stats', stats);
    
    // 记录调整历史
    this.addStarsAdjustHistory(amount, reason, oldTotal, newTotal);
    
    return {
      success: true,
      oldTotal: oldTotal,
      newTotal: newTotal,
      change: amount
    };
  },

  // 添加调整历史
  addStarsAdjustHistory(amount, reason, oldTotal, newTotal) {
    const history = wx.getStorageSync('starsAdjustHistory') || [];
    
    history.unshift({
      time: new Date().toLocaleString(),
      amount: amount,
      reason: reason,
      oldTotal: oldTotal,
      newTotal: newTotal
    });
    
    if (history.length > 50) {
      history.pop();
    }
    
    wx.setStorageSync('starsAdjustHistory', history);
    this.globalData.starsAdjustHistory = history;
  },

  // 获取调整历史
  getStarsAdjustHistory(limit = 20) {
    const history = wx.getStorageSync('starsAdjustHistory') || [];
    return history.slice(0, limit);
  },

  // 清除调整历史
  clearStarsAdjustHistory() {
    wx.setStorageSync('starsAdjustHistory', []);
    this.globalData.starsAdjustHistory = [];
    return { success: true };
  }
});