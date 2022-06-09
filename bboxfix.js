/** bounding box fix   把trim过的bbox改回最小包围盒，也就是外面补充透明区域 */

const fs = require("fs");
var images = require("images");
const args = process.argv.slice(2);
if ( args.length<1)
{
  console.error("参数filePrefixString必填");
  process.exit();
}


class BoundingBoxFix
{
  _filePrefixString;

  _destW;
  _destH;

  constructor(filePrefixString)
  {
    this._filePrefixString = filePrefixString;
  }

  run()
  {

    // images("input.jpg")                     //Load image from file
    //   //加载图像文件
    //   .size(400)                          //Geometric scaling the image to 400 pixels width
    //   //等比缩放图像到400像素宽
    //   .draw(images("logo.png"), 10, 10)   //Drawn logo at coordinates (10,10)
    //   //在(10,10)处绘制Logo
    //   .save("output.jpg", {               //Save the image to a file, with the quality of 50
    //     quality : 50                    //保存图片到文件,图片质量为50
    //   });

    // 打开所有图像，查看大小，确定公共宽高
    this._destW = 0;
    this._destH = 0;
    this.batchImgFiles(this._filePrefixString, (fileName,fileNameBackup) => {
      var img = images(fileName);
      var w = img.width();
      var h = img.height();
      if (w > this._destW) this._destW = w;
      if (h > this._destH) this._destH = h;
    })
    console.log("BoundingBoxFix/run 确定大小", this._destW, this._destH);

    //将所有图片 画布放大到公共宽高
    this.batchImgFiles(this._filePrefixString, (fileName,fileNameBackup) => {
      fs.renameSync(fileName,fileNameBackup);
      var oldImg =images(fileNameBackup);
      var offsetX = (this._destW-oldImg.width())/2;
      var offsetY = (this._destH -oldImg.height())/2;
      images(this._destW,this._destH)
        .draw(oldImg,offsetX,offsetY)
        .save(fileName);
    })
    console.log("BoundingBoxFix/run 保存完毕");

  }

  batchImgFiles(filePrefixString, cb)
  {
    for (let i = 0; i < 15; i++)
    {
      var fileName = filePrefixString + this.padString(i, 4) + ".png";
      var fileNameBackup = filePrefixString +"backup"+ this.padString(i, 4) + ".png";
      if (fs.existsSync(fileName))
      {
        console.log("BoundingBoxFix/batchImgFiles", fileName);

        cb(fileName,fileNameBackup);

      } else if (i > 0)
      {
        console.log("BoundingBoxFix/batchImgFiles cannot find ", fileName);
        break;
      }
    }
  }

  // pad string
  padString(num, n)
  {
    let str = num.toString();
    var len = str.length;
    while (len < n)
    {
      str = "0" + str;
      len++;
    }
    return str;
  }


}

new BoundingBoxFix(args[0]).run();
