//服务器的入口文件
//1.创建KOA的实例对象

//(1.1)导入koa
const Koa = require("koa");

//(1.2) new一个实例
const app = new Koa();

// 导入模块koa_response_duration
const respDurationMiddleware =  require("./middleware/koa_response_duration");

//2.绑定中间件
//2.1绑定第一层中间件
app.use(respDurationMiddleware);

//导入响应头中间件模块
const respHeaderMiddleware = require("./middleware/koa_response_header");

//绑定第二层中间件
app.use(respHeaderMiddleware);
 
//导入数据中间件模块
const respDataMiddleware = require("./middleware/koa_response_data");

//绑定第三层中间件
app.use(respDataMiddleware);

//3.绑定端口号8888
app.listen(8888);

const webSocketService = require('./service/web_socket_service')

//开启服务端的监听,监听客户端的链接
//当某一个客户端连接成功之后,就会对这个客户端进行message事件的监听
webSocketService.listen()