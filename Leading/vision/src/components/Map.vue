<!-- -->
<template>
  <div class="com-container" @dblclick="revertMap"> 
    <div class="com-chart" ref="map_ref">
      
    </div> 
  </div>
</template>
<script>
import axios from 'axios'
import { getProvinceMapInfo } from "../utils/map_utils"
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
    this.$socket.registerCallBack('mapData',this.getData)
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
      socketType: 'mapData',
      chartName: 'map',
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
    this.$socket.unRegisterCallBack('mapData')   
  },
  data:()=>({

    //图形的对象
    chartInstance: null,
    
    //服务器返回的数据
    allData: null,

    //所获取的地图矢量数据的缓存
    mapData: {}
  }),
  methods:{

    // 初始化方法
    async initChart(){

      //初始化charts实例对象
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)


      //获取中国地图的数据
      // http://localhost:8999/static/map/china.json
      //由于我们现在获取的地图矢量数据并不是位于KOA2的后天,所以咱们不能使用this.$http,因为this.$http经过配置的
      const ret =  await axios.get('http://localhost:8999/static/map/china.json')

      //掉用echarts中的registerMap方法
      this.$echarts.registerMap('china',ret.data)

      //初始option的配置
      const initOption = {

        //标题配置
        title:{
          text:'▎商家分布',
          left: 20,
          top: 20,
        },

        //地图的配置
        geo:{
          type:'map',
          map:'china',
          top: '5%',
          bottom: "5%",
          itemStyle: {
            areaColor: '#2E72BF',
            borderColor: '#333'
          },
        },

        //图例的配置
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }

      //将data的option设置给echarts实例
      this.chartInstance.setOption(initOption)

      //地图的事件监听
      this.chartInstance.on('click', async arg =>{
        
         //arg.name得到所点击的省份,但是arg.name点出的是中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        
        //先查询mapData中是否存在省的矢量数据,存在的话就不用掉Ajax获取数据
        if (!this.mapData[provinceInfo.key]) {
        
          //获取这个地图省份的地图矢量数据
          const ret = await axios.get("http://localhost:8999" + provinceInfo.path)
          
          //将省份数据存到mapData中
          this.mapData[provinceInfo.key] = ret.data

          //注册省份地图
          this.$echarts.registerMap(provinceInfo.key,ret.data)

        }

        //切换省份的地图option配置
        const changeOption = {
          geo:{
            map: provinceInfo.key,
          }
        }

        //将changeOption注册到实例中
        this.chartInstance.setOption(changeOption)
      })
    },

    //数据的Option  
    updateChart(){

      //处理数据图标需要的数据
      const seriesArr = this.allData.map(item => {
    
       //reutrn的这个对象就嗲表的是一个类别下的所有散点数据
       return{
          type: 'effectScatter',
          name: item.name,
          data: item.children,

          //如果想在地图中显示散点的数据,所以我们需要给散点的图表增加一个配置,coordinateSystem: geo
          coordinateSystem: 'geo',

          //涟漪效果
          rippleEffect: {
            
            //涟漪波纹
            scale: 5,

            //空心的涟漪动画效果
            brushType: "stroke"
          }
        }
      })


      //图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })

      //数据的option
      const dataOption = {
        legend: {
          data:legendArr
        },
        series: seriesArr
      }

      //将dataOption设置给echarts实例
      this.chartInstance.setOption(dataOption)
    },

    //掉用接口获取数据
    async getData(ret){

      //掉用接口获取数据解构赋值给ret
      // let {data:ret} = await this.$http.get('map')

      //将ret赋值给this.allData
      this.allData = ret

      // console.log(this.allData)

      this.updateChart()
    },

    //屏幕适配方法
    screenAdapter(){

      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6

      //屏幕适配的Option
      const adapterOption = {
        title: {
          textStyle:{
            fontSize: titleFontSize
          },
        },
        legend:{
            itemWidth: titleFontSize / 1.5,
            itemHeight:titleFontSize / 1.5,

            //间隔
            itemGap: titleFontSize / 2,

            //图例文字样式
            textStyle: {
              fontSize: titleFontSize / 2
            }
        }
      }

      //将adapterOption设置给echarts实例
      this.chartInstance.setOption(adapterOption)


      //手动调用图表对象的resize才能产生效果
      this.chartInstance.resize();
    },

    //回到中国地图
    revertMap(){
      
      //回到中国地图的option
      const revertOption = {
        geo:{
          map: 'china'
        }
      }


      //将revertOption注册到实例中
      this.chartInstance.setOption(revertOption)
    }
  },
  components:{

  }
}
</script>
<style scoped>

</style>