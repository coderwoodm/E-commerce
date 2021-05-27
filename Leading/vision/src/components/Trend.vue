<!-- -->
<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎' + showTitle }}</span>
      <span :style="comStyle" class="iconfont title-icon" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div :style="marginStyle" class="selecct-con" v-show='showChoice'>
        <div class="select-item" v-for="item in selectType" :key="item.key" @click="handleSelect(item.key)">{{item.text}}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils.js'
export default {
  created(){

    //在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('trendData',this.getData)
  },
  //页面加载前的钩子函数
  mounted ()  {

    //掉用初始化方法initChart
    this.initChart()

    //掉用getData获取服务器的数据
    // this.getData() 

    //发送数据给服务器,告诉服务器,我现在需要数据
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })

    // this.$socket.ws.onopen = () => {
    //   this.$socket.send({
    //     action: 'getData',
    //     socketType: 'trendData',
    //     chartName: 'trend',
    //     value: ''
    //   })
    // }

    //对windo窗体进行监听调用this.screenAdapter
    window.addEventListener("resize",this.screenAdapter)

    //第一次进入界面时手动掉用this.screenAdapter
    this.screenAdapter()

  },

  //销毁时掉用的函数
  destroyed () {

    //组件销毁时取消对窗体的监听
    window.removeEventListener("resize",this.screenAdapter)

    //在组件销毁的时候,进行回调函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  data:()=>({

    //chart的实例对象
    chartInstance: null,

    //服务器中获取的的所有数据
    allData: null,

    //是否显示可选项
    showChoice: false,

    //显示的数据类型,默认是map
    choiceType: "map",

    //指明标题的字体大小
    titleFontSize:0
  }),
  methods:{

    //初始化方法
    initChart () {

      //初始化实例对象
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme);

      //初始化的option
      const initOption =  {

        //设置图表在页面上的位置
        grid:{
          left: '3%',
          top:'35%',
          right:'4%',
          bottom:'4%',
          containLabel:true
        },
        legend:{
          right:30,
          top:'15%',

          //图例中的图标
          icon:"circle"
        },
        xAxis:{

          //类目轴
          type:"category",

          //折线图距离y轴是否有编剧
          boundaryGap: false
        },

        //工具提示
        tooltip:{

          //信息框出现的方式
          trigger:'axis'
        },
        yAxis:{
          type:"value"
        }
      }

      //给实例配置初始化的option
      this.chartInstance.setOption(initOption)
    
    },

    //获取服务器的数据
    //ret就是服务端发送给客户端图表的数据
    getData (ret) {

      //调用接口获取数据,将对象结构赋值给ret
      // const {data:ret} = await this.$http.get("trend")

      //将ret赋值给allData
      this.allData = ret
      
      console.log(this.allData)

      //掉用处理数据的方法
      this.updateChart()
    },

    //处理数据的方法
    updateChart () {
      
      //颜色的数组
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,225,0.5)',
        'rgba(22,242,217,0.5)',
        'rgba(254,34,30,0.5)',
        'rgba(250,105,0,0.5)'
      ]

      //颜色的数组
      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,225,0)',
        'rgba(22,242,217,0)',
        'rgba(254,34,30,0)',
        'rgba(250,105,0,0)'
      ]

      //处理数据
      //存储月份 类目轴的数据(xAxis)
      const timeArr = this.allData.common.month

      // y轴的数据,也就是series下的数据
      const valueArr = this.allData[this.choiceType].data

      //五个serie对象五条折线
      const seriesArr = valueArr.map((item,index) =>{
        return{

          //图的类型
          type:"line",

          //图的数据
          data:item.data,

          //堆叠图
          stack: this.choiceType,
          name: item.name,

          //区域面积
          areaStyle:{
            color: new this.$echarts.graphic.LinearGradient(0,0,0,1,[
              {
                offset:0,
                color: colorArr1[index] //百分之0的颜色
              },
              {
                offset: 1,
                color: colorArr2[index]  //百分之百的颜色
              }
            ])
          }
        }
      })

      //图例的数组
      const legendArr = valueArr.map(item => {
         return item.name
      })

      //处理数据的Option
      const dataOption = {

        //图例
        legend:{
          data: legendArr
        },

        //x轴的配置
        xAxis: {
          data:timeArr
        },
        series: seriesArr
      }

      //给实例配置数据处理的option
      this.chartInstance.setOption(dataOption)
    },

    //窗体变化掉用的函数
    screenAdapter () {
      

      //计算合适的比例
      this.titleFontSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      
      //窗体变化的option
      const adaperOption = {

        //给图例设置大小
        legend:{
          itemWidth:this.titleFontSize / 1.5,
          itemHeight:this.titleFontSize / 1.5,
          itemGap:this.titleFontSize / 1.5,
          textStyle:{
            fontSize:this.titleFontSize / 2,
          }
        }
      }

      //给实例配置窗体变化的option
      this.chartInstance.setOption(adaperOption)

      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize()
    },

    //切换图标类型,参数为传回来的表类型
    handleSelect(currentType){

      //赋值给choiceType
      this.choiceType = currentType

      //调用更新方法
      this.updateChart()

      //隐藏菜单
      this.showChoice = false
    }
  },

  //计算属性
  computed: {

    //选择的图表
    selectType () {
      if (!this.allData) {
        return []
      }else{
        return this.allData.type.filter(item =>{
          return item.key !== this.choiceType
        })
      }
    },

    //显示的标题
    showTitle(){
      if (!this.allData) {
        return ""
      }else{
        return this.allData[this.choiceType].title
      }
    },

    //设置标题的样式
    comStyle(){
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },

    //两个标题的margin-left
    marginStyle(){
     return { 
        marginLeft: (this.titleFontSize / 1.5) + "px"
       }
    },
    ...mapState(['theme']),
  },

  watch: {
    theme () {


      console.log("换主题")
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
}
</script>
<style lang='less' scoped>
.title{
  cursor: pointer;
  user-select: none;
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;
  .title-icon{
    margin-left: 10px;
  }
  // .selecct-con{
  //   background: #222733;
  // }
}
</style>