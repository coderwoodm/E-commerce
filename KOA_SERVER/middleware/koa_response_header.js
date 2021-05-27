//设置响应头
module.exports = async (ctx,next) => {
  
  //响应头
  const contentType = "application/json;charset = UTF-8";

  //设置响应头
  ctx.set("Content-Type",contentType);

  //解决跨域设置响应头
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST, DELETE');
  
  await next();
}   