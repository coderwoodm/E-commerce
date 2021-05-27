
<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div> 
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  created(){

    //在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('stockData',this.getData)
  },
  data:()=>({

    //图形的对象
    chartInstance: null,

    //服务器返回的数据
    allData: null,

    //当前显示数据的页数
    currentIndex: 0,

    //定时器的标识
    timerID: null
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
      socketType: 'stockData',
      chartName: 'stock',
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
    this.$socket.unRegisterCallBack('stockData')

    //取消定时器
    clearInterval(this.timerID)
  },
  methods:{

    //初始化echartInstance对象
    initChart () {

      // 初始化
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme);
    
      //initOption
      const initOption = {
        title:{
          text: "▎库存和销量分析",
          left: 20,
          top: 20
        },
      }

      //图表实例添加配置项option
      this.chartInstance.setOption(initOption);

      //鼠标进行监听
      this.chartInstance.on('mouseover',() => {
        clearInterval(this.timerID)
      })

      //鼠标移出重新启动定时器
      this.chartInstance.on('mouseout',() => {
        this.startInterval()
      })
    },
    //获取服务器的数据
    getData (ret) {

      //axios调用接口获取数据, 解构赋值给ret
      // const {data:ret} = await this.$http.get("stock");

      //将ret赋值给allData
      this.allData = ret;
      console.log(this.allData)
      //调用方法对图表进行更新
      this.updateChart()

      //掉用定时器
      this.startInterval()
    },
    //更新图标
    updateChart () {
      
      //饼图圆心点的坐标
      const centerArr = [
        ["18%","40%"],
        ["50%","40%"],
        ["82%","40%"],
        ["34%","75%"],
        ["66%","75%"],
        
      ]

      //颜色数组
      const colorArr = [
        ['#4FF778','#0BA82C'],
        ['#E5DD45','#E8B11C'],
        ['#E8821C','#E55445'],
        ['#5052EE','#AB6EE5'],
        ['#23E5E5','#2E72BF'],
      ]

      //起始值和结束值
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5

      //将十个数据分割成两份
      const showData = this.allData.slice(start,end)

      const seriesArr = showData.map((item,index) => {
        return {
          
          //类型
          type:"pie",

          //中心坐标
          center: centerArr[index],

          //关闭鼠标移入饼图时的动画效果
          hoverAnimation: false,
          
          //隐藏指示线
          labelLine:{
            show: false
          },

          // label:{
          //   position: "center",
          //   color:colorArr[index][0],
          // },
          data:[

            //销售的配置
            {
              value: item.sales,
              name: item.name + '\n\n' + item.sales,
              label:{
                position: "center",
                color:colorArr[index][0],
              },
              itemStyle:{
                color: new this.$echarts.graphic.LinearGradient(0,1,0,0,[
                  {
                    offset:0,
                    color: colorArr[index][0]
                  },
                  {
                    offset:1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            //库存的配置
            {
              value: item.stock,
              itemStyle:{
                color:"#333843"
              },
            }
          ]
        }
      })

      //数据配置的option
      const dataOption = {
        series:seriesArr
      }
      
      //图表实例添加配置项option
      this.chartInstance.setOption(dataOption);
    },

    //当浏览器的大小发生变化的时候,会调用的方法,来完成屏幕的适配
    screenAdapter(){

      //当前容器的宽度除以100乘3.6最合适的比例
      const titleFontSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6

      //内圆的半径
      const innerRadius = titleFontSize * 2.8

      //外圆的半径
      const outterRadius = innerRadius * 1.125

      //屏幕分辨适配的option
      const adaperOption = {
        title:{
          textStyle:{
            fontSize: titleFontSize
          }
        },
        series:[
          {
            type:'pie',
            radius:[outterRadius,innerRadius],
            label:{
              fontSize:titleFontSize / 2,
            }
          },
          {
            type:'pie',
            radius:[outterRadius,innerRadius],
            label:{
              fontSize:titleFontSize / 2
            }
          },
          {
            type:'pie',
            radius:[outterRadius,innerRadius],
            label:{
              fontSize:titleFontSize / 2
            }
          },
          {
            type:'pie',
            radius:[outterRadius,innerRadius],
            label:{
              fontSize:titleFontSize / 2
            }
          },
          {
            type:'pie',
            radius:[outterRadius,innerRadius],
            label:{
              fontSize:titleFontSize / 2
            }
          },
        ]
      }

      this.chartInstance.resize()
      
      //图表实例添加配置项option
      this.chartInstance.setOption(adaperOption);

      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize();
    },

    //计时器
    startInterval(){
      if (this.timerID) {
        clearInterval(this.timerID)
      }
      this.timerID = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
      },5000)
    }
  },
  components:{
    
  },
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
}
</script>
<style scoped>
</style>