<!--商家销量统计的横向柱状图-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div> 
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  created(){

    //在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack('sellerData',this.getData)
  },
  data:()=>({

    //图形的对象
    chartInstance: null,

    //服务器返回的数据
    allData: null,

    //当前显示的页数
    currentPage: 1,

    //一共有多少页
    totalPage: 0,

    //定时器的标识
    timerId: null
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
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })


    //监听窗体大小改变的事件
    window.addEventListener("resize",this.screenAdapter);

    //加载时主动进行屏幕的适配
    this.screenAdapter();
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
  //钩子函数destroyed ()当组件被销毁时调用
  destroyed (){

    //关闭定时器
    clearInterval(this.timerId);

    //取消监听
    window.removeEventListener("resize",this.screenAdapter);
    
    //在组件销毁的时候,进行回调函数的取消
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods:{

    //初始化echartInstance对象
    initChart () {

      // 初始化
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme);

      //initOption
      const initOption = {

        //图表的标题配置
        title:{

          // 标题文字
          text: "▎商家销售统计",

          //标题位置
          left:20,
          top:20
        },

        //图表的坐标轴的距离
        grid: {
          top:'20%',
          left:'3%',
          right: '6%',
          bottom: '3%',

          //图表坐标轴的距离包含文字
          containLabel: true
        },

        //x轴是数值轴所以typ值为value
        xAxis: {
          type:"value"
        },

        //y轴是数值轴所以typ值为category 
        yAxis :{
          type:"category",
          // data: sellerNames,
        },

        //工具提示
        tooltip: {

          //什么时候触发背景颜色 axis：鼠标移入到坐标轴
          trigger: 'axis',

          //当鼠标移到坐标轴所展示的类型
          axisPointer: {

            //类型是line树状
            type: 'line',

            //层级
            z:0,

            //背景的样式设置
            lineStyle:{

              //背景的颜色
              color:'#2D3443'
            }
          }
        },
        series:[{
          type: "bar",
          // data:sellerValues,

          //设置文字
          label:{

            //show是否显示
            show:true,

            //文字的位置->右边
            position: "right",

            //文字的样式
            textStyle:{

              //颜色为白色
              color: 'white'
            }
          },

          //柱的样式
          itemStyle:{

            //柱的颜色渐变
            //指明颜色渐变的方向
            //指明不同百分比值下颜色的值
            color: new this.$echarts.graphic.LinearGradient(0,1,1,0,[
              {
                offset:0,
                color:'#5052EE'
              },
              {
                offset: 1,
                color: '#AB6EE5'
              }
            ])
          }
        }]
      }

      //图表实例添加配置项option
      this.chartInstance.setOption(initOption);

      // 对图表对象进行鼠标事件的监听,通过on绑定事件
      // 鼠标移入图表时,关闭定时器
      this.chartInstance.on("mouseover",() => {

        //关闭定时器
        clearInterval(this.timerId);
      })

      //鼠标移出时,重新启动定时器
      this.chartInstance.on("mouseout",() => {

        //调用方法重新启动定时器
        this.startInterval();
      })
    },
    //获取服务器的数据
    getData (ret) {

      //axios调用接口获取数据, 解构赋值给ret
      // const {data:ret} = await this.$http.get("seller");

      //将ret赋值给allData
      this.allData = ret;
      
      //调用数组的方法sort对数组进行排序
      this.allData.sort((a,b) => {
        return a.value - b.value
      })


      //每五个元素显示一页
      //三元表达式,如果allData能整除5的话,totalpage的值就为this.allData.length / 5,否则totalpage的值就为this.allData.length / 5 + 1
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      
      //调用方法对图表进行更新
      this.updateChart()

      //启动定时器
      this.startInterval();
    },
    //更新图标
    updateChart () {

      //start当前页数-1乘5
      const start = (this.currentPage - 1) * 5;

      //end当前页数乘5
      const end = this.currentPage * 5;

      //showData为显示在界面上的数据,值是从allData中截取的
      //start是截取起始索引,end为结束索引
      const showData = this.allData.slice(start,end)


      //sellerNames是页面上y轴的数据
      const sellerNames = showData.map((item)=>{
        return item.name
      });

      //sellerNames是页面上x轴的数据
      const sellerValues = showData.map((item)=>{
        return item.value
      });

      //数据配置的option
      const dataOption = {

        //y轴是数值轴所以typ值为category 
        yAxis :{
          data: sellerNames,
        },
        series:[{

          //x轴的数据
          data: sellerValues,

        }]
      }

      //图表实例添加配置项option
      this.chartInstance.setOption(dataOption);
    },

    //定时器的方法
    startInterval () {

      //启动定时器时先判断定时器是否存在,如果存在先关闭定时器
      if (this.timerId) {

        //关闭定时器
        clearInterval(this.timerId);
      }
      
      //定时器赋值给timerId
      this.timerId = setInterval(() => {

        //页数+1
        this.currentPage++;

        //判断当前页是否超出总页数
        if (this.currentPage > this.totalPage) {

          //超出了将页数设为1,从头展示
          this.currentPage = 1
        }

        //更新图表
        this.updateChart();
      },3000)
    },

    //当浏览器的大小发生变化的时候,会调用的方法,来完成屏幕的适配
    screenAdapter(){

      //当前容器的宽度除以100乘3.6最合适的比例
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6

      //屏幕分辨适配的option
      const adaperOption = {
         //图表的标题配置
        title: {

          //文字样式
          textStyle:{
            fontSize: titleFontSize,
          },
        },

        //工具提示
        tooltip: {

          //当鼠标移到坐标轴所展示的类型
          axisPointer: {

            //背景的样式设置
            lineStyle:{

              //背景的宽度
              width: titleFontSize,
            }
          }
        },
        series:[{

          //柱的宽度
          barWidth: titleFontSize,

          //柱的样式
          itemStyle:{

            //柱状图四个角的圆角
            barBorderRadius: [0,titleFontSize / 2,titleFontSize / 2,0],
          }
        }]
      }
      
      //图表实例添加配置项option
      this.chartInstance.setOption(adaperOption);

      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize();
    }
  },
  components:{
    
  }
}
</script>
<style scoped>

</style>