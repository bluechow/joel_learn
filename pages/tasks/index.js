Page({
  data: {
    tasks: [],
    showModal: false,
    showDeleteModal: false,
    modalTitle: '添加任务',
    deleteTaskId: '',
    deleteTaskName: '',
    editTask: {
      id: '',
      name: '',
      desc: '',
      stars: 1
    }
  },

  onLoad() {
    this.loadTasks();
  },

  onShow() {
    this.loadTasks();
  },

  // 加载任务列表
  loadTasks() {
    const app = getApp();
    this.setData({
      tasks: app.getTasks()
    });
  },

  // 显示添加任务弹窗
  showAddTask() {
    this.setData({
      showModal: true,
      modalTitle: '添加任务',
      editTask: {
        id: '',
        name: '',
        desc: '',
        stars: 1
      }
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 编辑任务
  editTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      this.setData({
        showModal: true,
        modalTitle: '编辑任务',
        editTask: {
          id: task.id,
          name: task.name,
          desc: task.desc,
          stars: task.stars
        }
      });
    }
  },

  // 显示删除确认弹窗
  deleteTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    this.setData({
      showDeleteModal: true,
      deleteTaskId: taskId,
      deleteTaskName: task ? task.name : ''
    });
  },

  // 隐藏删除弹窗
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteTaskId: '',
      deleteTaskName: ''
    });
  },

  // 确认删除
  confirmDelete() {
    const taskId = this.data.deleteTaskId;
    const tasks = this.data.tasks.filter(t => t.id !== taskId);
    
    wx.setStorageSync('tasks', tasks);
    
    this.setData({
      tasks: tasks,
      showDeleteModal: false,
      deleteTaskId: '',
      deleteTaskName: ''
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 输入任务名称
  onTaskNameInput(e) {
    let name = e.detail.value;
    if (name.length > 20) {
      name = name.substring(0, 20);
    }
    this.setData({
      'editTask.name': name
    });
  },

  // 输入任务描述
  onTaskDescInput(e) {
    let desc = e.detail.value;
    if (desc.length > 30) {
      desc = desc.substring(0, 30);
    }
    this.setData({
      'editTask.desc': desc
    });
  },

  // 输入星星数量
  onTaskStarsInput(e) {
    let stars = parseInt(e.detail.value);
    if (isNaN(stars) || stars < 1) {
      stars = 1;
    } else if (stars > 99) {
      stars = 99;
    }
    this.setData({
      'editTask.stars': stars
    });
  },

  // 输入星星数量（支持小数）
onTaskStarsInput(e) {
  let stars = parseFloat(e.detail.value);
  if (isNaN(stars) || stars < 0.5) {
    stars = 0.5;
  } else if (stars > 999) {
    stars = 999;
  } else {
    // 四舍五入到0.5
    stars = Math.round(stars * 2) / 2;
  }
  this.setData({
    'editTask.stars': stars
  });
},

// 快速选择星星数量（支持小数）
quickSelectStar(e) {
  const stars = parseFloat(e.currentTarget.dataset.stars);
  this.setData({
    'editTask.stars': stars
  });
},

  // 快速选择星星数量
  quickSelectStar(e) {
    const stars = parseInt(e.currentTarget.dataset.stars);
    this.setData({
      'editTask.stars': stars
    });
  },

  // 保存任务
  saveTask() {
    const task = this.data.editTask;
    if (!task.name) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const tasks = this.data.tasks;
    
    if (task.id) {
      // 编辑任务
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        tasks[index] = { 
          ...tasks[index], 
          name: task.name,
          desc: task.desc || '暂无描述',
          stars: task.stars
        };
      }
    } else {
      // 添加任务
      const newTask = {
        id: Date.now().toString(),
        name: task.name,
        desc: task.desc || '暂无描述',
        stars: task.stars || 1,
        completedDates: []
      };
      tasks.push(newTask);
    }
    
    wx.setStorageSync('tasks', tasks);
    
    this.setData({
      tasks: tasks,
      showModal: false
    });
    
    wx.showToast({
      title: task.id ? '修改成功' : '添加成功',
      icon: 'success',
      duration: 2000
    });
  }
});