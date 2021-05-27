<!-- -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div> 
  </div>
</template>

<script>

import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['theme'])
  },
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
    this.$socket.registerCallBack('rankData',this.getData)
  },

  //页面加载前
  mounted(){
    
    //初始化图标的方法
    this.initChart()

    //获取数据的方法
    // this.getData()

    //发送数据给服务器,告诉服务器,我现在需要数据
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })

    //监听窗口发生变化
    window.addEventListener('resize',this.screenAdapter)

    //页面渲染前手动调用一下窗体适配的方法
    this.screenAdapter()
  },

  //页面销毁前
  destroyed(){

    //取消对窗口大小变化的监听
    window.removeEventListener('resize',this.screenAdapter)

     //在组件销毁的时候,进行回调函数的取消
    this.$socket.unRegisterCallBack('rankData')   

    //关闭定时器
    clearInterval(this.timerId)
  },
  data:()=>({

    //图形的对象
    chartInstance: null,
    
    //服务器返回的数据
    allData: null,

    //区域缩放的起点值
    startValue: 0,

    //区域缩放的终点值
    endValue: 9,

    //定时器的标识
    timerId: null
  }),
  methods:{

    // 初始化方法
    async initChart(){

      //初始化charts实例对象
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
     
      //初始option的配置
      const initOption = {
        title:{
          text:"▎地区销售排行",
          top: 20,
          left: 20
        },
        grid:{
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel:true
        },
        tooltip:{
          show:true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type:'value'
        },
        series: [
          {
            type:'bar'
          }
        ]
      }
      
      //将data的option设置给echarts实例
      this.chartInstance.setOption(initOption)
      
      //监听鼠标是否移入到图表中
      this.chartInstance.on('mouseover',() => {

        //关闭定时器
        clearInterval(this.timerId)
      })

      //监听鼠标是否移出图表
      this.chartInstance.on('mouseout',() => {

        //开启定时器
        this.startInterval()
      })

    },

    //数据的Option  
    updateChart(){
      
      //颜色数组
      const colorArr = [
        ["#0BA82C","#4FF778"],
        ["#2E72BF","#23E5E5"],
        ["#5052EE","#AB6EE5"]
      ]
      //所有省份所形成的数组
      const provinceArr = this.allData.map(item => {
        return item.name
      })

      //所有省份对应的销售金额
      const valueArr = this.allData.map(item => {
        return item.value
      })

      //数据的option
      const dataOption = {
        xAxis:{
          data: provinceArr
        },
        //区域缩放
        dataZoom:{
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series:
        [
          {
            data: valueArr,

            //每个柱状图的颜色
            itemStyle:{

              color:(arg) => {

                //声明一个变量
                let targetColorArr = null

                //大于300的颜色
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]

                //大于200的颜色
                }else if (arg.value > 200) {
                  targetColorArr = colorArr[1]

                //其他颜色
                }else{
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0,0,0,1,[
                  {
                    offset:0,
                    color: targetColorArr[0]
                  },
                  {
                    offset:1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
     
      //将dataOption设置给echarts实例
      this.chartInstance.setOption(dataOption)
    },

    //掉用接口获取数据
    getData (ret) {

      //掉用接口获取数据解构赋值给ret
      // let {data:ret} = await this.$http.get('rank')

      //将ret赋值给this.allData
      this.allData = ret

      //对allData中元素进行排序,从大到小
      this.allData.sort((a,b)=>{
        return b.value - a.value
      })
       
      this.updateChart()

      //启动定时器
      this.startInterval()
    },

    //屏幕适配方法
    screenAdapter(){

      const titleFontSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6

      //屏幕适配的Option
      const adapterOption = {
        title:{
          textStyle:{
            fontSize: titleFontSize
          }
        },
        series:[
          {
            barWidth: titleFontSize,
            itemStyle:{
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      
      //将adapterOption设置给echarts实例
      this.chartInstance.setOption(adapterOption)

      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize();

    },
    //定时器
    startInterval(){
      
      //判断定时器是否存在
      if (this.timerId) {

        //存在的话先关闭定时器
        clearInterval(this.timerId)
      }

      this.timerId = setInterval(() => {

        //起始值加一
        this.startValue++

        //结束值加一
        this.endValue++

        //判断是否超出了界限
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000);
    }
  },
  components:{

  }
}
</script>
<style scoped>

</style>