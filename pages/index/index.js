Page({
  data: {
    totalStars: 0,
    todayTasks: [],
    rewards: [],
    showStarsModal: false,
    editStarsValue: '',
    tempStars: 0,
    adjustHistory: []
  },

  onLoad() {
    this.loadData();
    this.loadAdjustHistory();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  loadData() {
    const app = getApp();
    const tasks = app.getTasks();
    const rewards = app.getRewards();
    const stats = app.getStats();
    
    // 获取今日任务
    const today = new Date().toDateString();
    const todayTasks = tasks.map(task => ({
      ...task,
      completed: task.completedDates && task.completedDates.includes(today)
    }));
    
    this.setData({
      totalStars: stats.totalStars || 0,
      todayTasks: todayTasks,
      rewards: rewards.slice(0, 4)
    });
  },

  // 加载调整历史
  loadAdjustHistory() {
    const history = wx.getStorageSync('starsAdjustHistory') || [];
    this.setData({ adjustHistory: history.slice(0, 5) });
  },

  // 显示星星编辑弹窗
  showStarsEdit() {
    this.setData({
      showStarsModal: true,
      tempStars: this.data.totalStars,
      editStarsValue: ''
    });
  },

  // 隐藏星星编辑弹窗
  hideStarsEdit() {
    this.setData({
      showStarsModal: false,
      editStarsValue: ''
    });
  },

  // 快速调整星星数量
  adjustStars(e) {
    const type = e.currentTarget.dataset.type;
    const amount = parseInt(e.currentTarget.dataset.amount);
    let newTotal = this.data.totalStars;
    
    if (type === 'plus') {
      newTotal += amount;
    } else {
      newTotal = Math.max(0, newTotal - amount);
    }
    
    this.updateStars(newTotal, type === 'plus' ? `快速+${amount}` : `快速-${amount}`);
  },

  // 手动输入星星数量
  onStarsInput(e) {
    this.setData({
      editStarsValue: e.detail.value
    });
  },

  // 手动调整星星
  manualAdjust(e) {
    const type = e.currentTarget.dataset.type;
    const value = parseInt(this.data.editStarsValue);
    
    if (isNaN(value) || value <= 0) {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      });
      return;
    }
    
    let newTotal = this.data.totalStars;
    if (type === 'plus') {
      newTotal += value;
    } else {
      newTotal = Math.max(0, newTotal - value);
    }
    
    this.updateStars(newTotal, `手动${type === 'plus' ? '+' : '-'}${value}`);
    this.setData({ editStarsValue: '' });
  },

  // 更新星星数量
  updateStars(newTotal, reason) {
    const app = getApp();
    const stats = app.getStats();
    const oldTotal = stats.totalStars;
    
    // 更新星星数量
    stats.totalStars = newTotal;
    wx.setStorageSync('stats', stats);
    
    // 记录调整历史
    const history = wx.getStorageSync('starsAdjustHistory') || [];
    const change = newTotal - oldTotal;
    history.unshift({
      time: new Date().toLocaleString(),
      amount: change,
      reason: reason,
      oldTotal: oldTotal,
      newTotal: newTotal
    });
    
    if (history.length > 20) {
      history.pop();
    }
    wx.setStorageSync('starsAdjustHistory', history);
    
    this.setData({
      totalStars: newTotal,
      adjustHistory: history.slice(0, 5)
    });
    
    wx.showToast({
      title: `星星已调整为 ${newTotal}`,
      icon: 'success',
      duration: 2000
    });
  },

  // 保存调整
  saveStarsAdjust() {
    this.hideStarsEdit();
  },

  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const app = getApp();
    
    const result = app.completeTask(taskId);
    if (result.success) {
      wx.showToast({
        title: `获得${result.stars}颗星星`,
        icon: 'success',
        duration: 2000
      });
      this.loadData();
    } else {
      wx.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 显示奖励详情
  showRewardDetail(e) {
    const rewardId = e.currentTarget.dataset.id;
    const app = getApp();
    const reward = app.getRewardById(rewardId);
    
    wx.showModal({
      title: reward.name,
      content: `${reward.description || '暂无描述'}\n需要 ${reward.cost} 颗星星`,
      confirmText: '兑换',
      success: (res) => {
        if (res.confirm) {
          this.exchangeReward(e);
        }
      }
    });
  },

  // 兑换奖励
  exchangeReward(e) {
    const rewardId = e.currentTarget.dataset.id;
    const app = getApp();
    const reward = app.getRewardById(rewardId);
    
    if (this.data.totalStars < reward.cost) {
      wx.showToast({
        title: '星星不足',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '兑换确认',
      content: `确定要兑换"${reward.name}"吗？需要${reward.cost}颗星星`,
      success: (res) => {
        if (res.confirm) {
          const result = app.exchangeReward(rewardId);
          if (result.success) {
            this.updateStars(this.data.totalStars - reward.cost, `兑换:${reward.name}`);
            wx.showToast({
              title: '兑换成功',
              icon: 'success'
            });
            this.loadData();
          }
        }
      }
    });
  },

  // 跳转到任务页面
  goToTasks() {
    wx.switchTab({
      url: '/pages/tasks/index'
    });
  },

  // 跳转到奖励页面
  goToRewards() {
    wx.switchTab({
      url: '/pages/rewards/index'
    });
  }
});