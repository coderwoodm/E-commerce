
const path = require('path')
const fileUtils = require('../utils/file_utils')
//引入ws
const WebSocket = require('ws')

// 创建WebSocket服务端的对象,绑定的端口号是9998
const wss = new WebSocket.Server({
  port: 9998
})

module.exports.listen = () =>{

   //对客户端的链接事件进行监听
  //client：代表的是客户端的链接s
  wss.on('connection',client => {
    console.log("有客户端链接成功...")

    //对客户端的链接对象进行message事件的监听
    //msg:由客户端发给服务端的数据
    client.on('message',async msg => {
      console.log("客户端发送数据给服务端了:" + msg)

      //将传过来的值解析为payload
      let payload = JSON.parse(msg)

      //取出payload.action赋值给action
      const action = payload.action

      //如果payload.action中值是getData的话就是请求数据的
      if (action === 'getData') {

        //拼接路径
        let filePath = '../data/' + payload.chartName + '.json'

        //用node中path拼接本地路径
        filePath = path.join(__dirname,filePath)

        //掉用fileUtils.getFileJsonData取出本地的json文件
        const ret = await fileUtils.getFileJsonData(filePath)

        //需要服务端获取到数据的基础之上,增加一个data的字段
        payload.data = ret

        //将数据发送给前端
        client.send(JSON.stringify(payload))

      }else{

        //获取所有链接的客户端,client就是每个客户端
        wss.clients.forEach(client => {

          //将传回来的数据原封不动的传回去
          client.send(msg)
        })
      }
    })
  })
}