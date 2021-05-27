import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import SocketService from './utils/socket_service'

//对服务端进行websocket的链接
SocketService.Instance.connect()

//其他组件可以 通过this.$socket
Vue.prototype.$socket = SocketService.Instance

//引入样式文件
import "./assets/css/global.less"

//引入字体文件
import './assets/font/iconfont.css'

//请求基准路径的配置
axios.defaults.baseURL = "http://127.0.0.1:8888/api/"

//将axios挂载到Vue的原型对象上
//在别的组件中 this.$http 
Vue.prototype.$http = axios

//将全局echarts对象挂在到vue的原型对象上
//别的组件中 this.$echarts
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')