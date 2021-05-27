//总耗时
module.exports = async (ctx,next) => {

  //记录开始时间
  const start = Date.now();

  //让内层中间件得到执行
  await next();

  //记录结束时间
  const end = Date.now();

  //计算时间
  const duration = end - start;

  //ctx.set()设置响应头 X-Response-Time
  ctx.set("X-Response-Time",duration + "ms");

}