Page({
  data: {
    totalStars: 0,
    rewards: [],
    history: [],
    manageMode: false,
    showStarsModal: false,
    showRewardModal: false,
    showDeleteModal: false,
    rewardModalTitle: '添加奖励',
    editStarsValue: '',
    editReward: {
      id: '',
      name: '',
      desc: '',
      cost: 10,
      icon: '/images/gift.png'
    },
    deleteRewardId: '',
    deleteRewardName: ''
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  loadData() {
    const app = getApp();
    const stats = app.getStats();
    const rewards = app.getRewards();
    
    this.setData({
      totalStars: stats.totalStars || 0,
      rewards: rewards,
      history: stats.exchangedRewards || []
    });
  },

  // ========== 星星调整功能 ==========
  
  // 显示星星编辑弹窗
  showStarsEdit() {
    this.setData({
      showStarsModal: true,
      editStarsValue: ''
    });
  },

  // 隐藏星星编辑弹窗
  hideStarsEdit() {
    this.setData({
      showStarsModal: false
    });
  },

  // 快速调整星星
  adjustStars(e) {
    const type = e.currentTarget.dataset.type;
    const amount = parseInt(e.currentTarget.dataset.amount);
    const app = getApp();
    
    let newTotal = this.data.totalStars;
    if (type === 'plus') {
      newTotal += amount;
    } else {
      newTotal = Math.max(0, newTotal - amount);
    }
    
    const change = type === 'plus' ? amount : -amount;
    app.adjustStars(change, `快速调整${change > 0 ? '+' : ''}${change}`);
    
    this.setData({
      totalStars: newTotal
    });
    
    wx.showToast({
      title: `星星已调整为 ${newTotal}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 手动输入星星
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
    
    const app = getApp();
    let newTotal = this.data.totalStars;
    let change = 0;
    
    if (type === 'plus') {
      newTotal += value;
      change = value;
    } else {
      newTotal = Math.max(0, newTotal - value);
      change = -value;
    }
    
    app.adjustStars(change, `手动调整${change > 0 ? '+' : ''}${change}`);
    
    this.setData({
      totalStars: newTotal,
      editStarsValue: ''
    });
    
    wx.showToast({
      title: `星星已调整为 ${newTotal}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 在Page对象中添加这个函数
// 格式化星星显示（去掉.0，保留.5）
formatStars(num) {
  if (num === undefined || num === null) return '0';
  if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(1);
  }
},
  // ========== 奖励管理功能 ==========
  
  // 切换管理模式
  toggleManageMode() {
    this.setData({
      manageMode: !this.data.manageMode
    });
  },

  // 显示添加奖励弹窗
  showAddReward() {
    this.setData({
      showRewardModal: true,
      rewardModalTitle: '添加奖励',
      editReward: {
        id: '',
        name: '',
        desc: '',
        cost: 10,
        icon: '/images/gift.png'
      }
    });
  },

  // 编辑奖励
  editReward(e) {
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.rewards.find(r => r.id === rewardId);
    
    if (reward) {
      this.setData({
        showRewardModal: true,
        rewardModalTitle: '编辑奖励',
        editReward: {
          id: reward.id,
          name: reward.name,
          desc: reward.description || reward.desc || '',
          cost: reward.cost,
          icon: reward.icon || '/images/gift.png'
        }
      });
    }
  },

  // 隐藏奖励弹窗
  hideRewardModal() {
    this.setData({
      showRewardModal: false
    });
  },

  // 输入奖励名称
  onRewardNameInput(e) {
    let name = e.detail.value;
    if (name.length > 20) {
      name = name.substring(0, 20);
    }
    this.setData({
      'editReward.name': name
    });
  },

  // 输入奖励描述
  onRewardDescInput(e) {
    let desc = e.detail.value;
    if (desc.length > 30) {
      desc = desc.substring(0, 30);
    }
    this.setData({
      'editReward.desc': desc
    });
  },

// 输入所需星星（支持小数）
onRewardCostInput(e) {
  let cost = parseFloat(e.detail.value);
  if (isNaN(cost) || cost < 0.5) {
    cost = 0.5;
  } else if (cost > 999) {
    cost = 999;
  } else {
    // 四舍五入到0.5
    cost = Math.round(cost * 2) / 2;
  }
  this.setData({
    'editReward.cost': cost
  });
},

// 快速选择星星数量（支持小数）
quickSelectCost(e) {
  const cost = parseFloat(e.currentTarget.dataset.cost);
  this.setData({
    'editReward.cost': cost
  });
},

  // 快速选择星星数量
  quickSelectCost(e) {
    const cost = parseInt(e.currentTarget.dataset.cost);
    this.setData({
      'editReward.cost': cost
    });
  },

  // 选择图标
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      'editReward.icon': icon
    });
  },

  // 保存奖励
  saveReward() {
    const reward = this.data.editReward;
    
    if (!reward.name) {
      wx.showToast({
        title: '请输入奖励名称',
        icon: 'none'
      });
      return;
    }
    
    if (!reward.cost || reward.cost < 1) {
      wx.showToast({
        title: '请输入有效的星星数量',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    let rewards = app.getRewards();
    
    if (reward.id) {
      // 编辑现有奖励
      const index = rewards.findIndex(r => r.id === reward.id);
      if (index !== -1) {
        rewards[index] = {
          ...rewards[index],
          name: reward.name,
          description: reward.desc || '暂无描述',
          cost: reward.cost,
          icon: reward.icon
        };
      }
    } else {
      // 添加新奖励
      const newReward = {
        id: Date.now().toString(),
        name: reward.name,
        description: reward.desc || '暂无描述',
        cost: reward.cost,
        icon: reward.icon
      };
      rewards.push(newReward);
    }
    
    wx.setStorageSync('rewards', rewards);
    
    this.setData({
      rewards: rewards,
      showRewardModal: false
    });
    
    wx.showToast({
      title: reward.id ? '修改成功' : '添加成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 删除奖励
  deleteReward(e) {
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.rewards.find(r => r.id === rewardId);
    
    this.setData({
      showDeleteModal: true,
      deleteRewardId: rewardId,
      deleteRewardName: reward ? reward.name : ''
    });
  },

  // 隐藏删除弹窗
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteRewardId: '',
      deleteRewardName: ''
    });
  },

  // 确认删除
  confirmDelete() {
    const rewardId = this.data.deleteRewardId;
    const rewards = this.data.rewards.filter(r => r.id !== rewardId);
    
    wx.setStorageSync('rewards', rewards);
    
    this.setData({
      rewards: rewards,
      showDeleteModal: false,
      deleteRewardId: '',
      deleteRewardName: ''
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000
    });
  },

  // ========== 兑换功能 ==========
  
  // 显示奖励详情
  showRewardDetail(e) {
    if (this.data.manageMode) return;
    
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.rewards.find(r => r.id === rewardId);
    
    wx.showModal({
      title: reward.name,
      content: `${reward.description || reward.desc || '暂无描述'}\n需要 ${reward.cost} 颗星星`,
      confirmText: '兑换',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          this.exchangeReward(e);
        }
      }
    });
  },

  // 兑换奖励
  exchangeReward(e) {
    if (this.data.manageMode) return;
    
    const rewardId = e.currentTarget.dataset.id;
    const app = getApp();
    const reward = this.data.rewards.find(r => r.id === rewardId);
    
    if (this.data.totalStars < reward.cost) {
      wx.showToast({
        title: '星星不足',
        icon: 'none'
      });
      return;
    }
    
    const result = app.exchangeReward(rewardId);
    if (result.success) {
      this.loadData();
      wx.showToast({
        title: '兑换成功',
        icon: 'success',
        duration: 2000
      });
    }
  }
});