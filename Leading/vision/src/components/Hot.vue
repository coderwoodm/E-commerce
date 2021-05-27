
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div> 
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle">{{catName}}</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils.js'
export default {
  watch: {
    theme () {

      //销毁当前的图表
      this.chartInstance.dispose()
      
      //重新以最新的主题名称初始化对象
      this.initChart()

      //完成屏幕的适配
      this.screenAdapter()

      //更新图表的展示
      this.updateChart()

    }
  },
  created(){
    //在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('hotData',this.getData)
  },
  data:()=>({

    //图形的对象
    chartInstance: null,

    //服务器返回的数据
    allData: null,

    //当前所展示的一级分类数据
    currentIndex: 0,

    //字体大小
    titleFontSize: ""
  }),

  //钩子函数mounted当Dom加载完成
  mounted(){

    //DOM加载完成调用initChart方法
    this.initChart();

    //获取数据
    // this.getData();

    //发送数据给服务器,告诉服务器,我现在需要数据
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
      value: ''
    })

    //监听窗体大小改变的事件
    window.addEventListener("resize",this.screenAdapter);

    //加载时主动进行屏幕的适配
    this.screenAdapter();
  },
  //钩子函数destroyed ()当组件被销毁时调用
  destroyed (){

    //取消监听
    window.removeEventListener("resize",this.screenAdapter);

    //在组件销毁的时候,进行回调函数的取消
    this.$socket.unRegisterCallBack('hotData')   
  },
  methods:{

    //初始化echartInstance对象
    initChart () {

      // 初始化
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref,this.theme);

      //initOption
      const initOption = {
        title:{
          text:"▎热销商品占比",
          left:20,
          top:20
        },
        series:[
          {
            type:"pie",
            label:{
              show:false
            },

            //当饼图高亮的时候
            emphasis:{
              label:{
                show:true
              },
              labelLine:{
                show:false
              }
            }
          }
        ],
        legend:{
          top: "15%",
          icon:"circle"
        },
        tooltip:{
          show:true,

          //文本提示
          formatter:(arg)=>{

            //将三级菜单存储起来
            const thirdCategory = arg.data.children
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            });

            let retStr = ""
            thirdCategory.forEach(item => {
              retStr += `
              ${item.name}:${parseInt(item.value / total * 100) + "%"}
              <br>
              `
            });
            return retStr
          }
        }
      }
      

      //图表实例添加配置项option
      this.chartInstance.setOption(initOption);

    },
    //获取服务器的数据
    getData (ret) {

      //axios调用接口获取数据, 解构赋值给ret
      // const {data:ret} = await this.$http.get("hotproduct");

      //将ret赋值给allData
      this.allData = ret;

      console.log(ret)

      //调用方法对图表进行更新
      this.updateChart()
    },
    //更新图标
    updateChart () {
      
      //处理图表需要的数据
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return item.name
      })
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })

      //数据配置的option
      const dataOption = {
        legend:{
          data:legendData
        },
        series:[{
          data:seriesData
        }]
      }

      //图表实例添加配置项option
      this.chartInstance.setOption(dataOption);
    },

    //当浏览器的大小发生变化的时候,会调用的方法,来完成屏幕的适配
    screenAdapter(){

      //当前容器的宽度除以100乘3.6最合适的比例
      this.titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6

      //屏幕分辨适配的option
      const adaperOption = {
        title:{
          textStyle:{
            fontSize:this.titleFontSize
          }
        },
        series:[{
          radius: this.titleFontSize * 4.5,
          center: ["50%","60%"]
        }],
        legend:{
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle:{
            fontSize: this.titleFontSize / 2
          }
        }
      }
      
      //图表实例添加配置项option
      this.chartInstance.setOption(adaperOption);

      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize();
    },

    //向左的箭头
    toLeft(){
      this.currentIndex--
      if (this.currentIndex<0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },

    //向右的箭头
    toRight(){
      this.currentIndex++
      if (this.currentIndex > (this.allData.length - 1)) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  },
  components:{
    
  },
  computed:{
    catName(){
      if (!this.allData) {
        return ""
      }else{
        return this.allData[this.currentIndex].name
      }
    },
    comStyle(){
      return {
        fontSize:this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  }
}
</script>
<style scoped>
.arr-left{
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right{
  position: absolute;
  cursor: pointer;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  color: white;
}
.cat-name{
  position: absolute;
  left: 80%;
  bottom: 30px;
  color: white;
}
</style>