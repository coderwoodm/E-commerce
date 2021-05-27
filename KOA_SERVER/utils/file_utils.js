//读取文件的工具方法

//导入node中读文件内容的模块
const fs = require("fs");

module.exports.getFileJsonData = (filePath) => {

  //根据文件路径读取文件内容
  return new Promise((resolve,reject) => {

    //调用fs中的readFile方法,该方法有三个参数{1:文件的路径,2:编码格式,3:回调函数}
    fs.readFile(filePath,'utf-8',(error,data) => {
      
      if (error) {

        //读取文件失败
        reject(error);

      }else{

        //读取文件成功
        resolve(data);

      }
    });
  })
}