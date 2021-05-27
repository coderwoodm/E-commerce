//处理业务逻辑的中间件，读取某个json文件的数据

//导入node中的path包
const path = require("path");

module.exports = async (ctx,next) => {
 
  //获取本地请求的url
  const url = ctx.request.url;

  //js中replace方法替换字符串/api为空字符串
  let filePath = url.replace("/api","");
  
  //重新拼接相对路径
  filePath = '../data' + filePath + '.json';
  
  //调用node中的path.join来拼接绝对路径+相对路径__dirname:绝对路径
  filePath = path.join(__dirname,filePath);

  //导入工具类模块file_utils
  const fileUtils = require("../utils/file_utils");

  //成功
  try{

    // 调用方法重新给filePath赋值
    let ret = await fileUtils.getFileJsonData(filePath);

    //设置响应体
    ctx.response.body = ret;
    
  //失败
  }catch{
    
    //读取失败后的设置
    const errorMsg = {
      message:'读取文件内容失败,文件资源不存在...',
      status:404
    }

    //将errorMsg转换为JSON格式,并设置为响应体
    ctx.response.body = JSON.stringify(errorMsg);
  }

  //控制台打印路径
  // console.log(filePath);

  await next();

}