const {createCanvas, loadImage} = require("canvas");
const fs = require("fs");


class CanvasGen
{


  _textString = "";
  _frameSizeW = 0;
  _frameSizeH = 0;
  _frameCount = 0;
  _borderWidth = 0;
  _filePrefixString = "";
  _isFadeIn = false;
  _isFadeOut = false;
  _isScaleIn = false;
  _isScaleOut = false;
  _themeColor = "#000000";

  constructor(textString,themeColor, frameSizeW, frameSizeH, borderWidth, frameCount, filePrefixString, isFadeIn, isFadeOut, isScaleIn, isScaleOut)
  {
    this._themeColor=themeColor;
    this._textString = textString;
    this._frameSizeW = frameSizeW;
    this._frameSizeH = frameSizeH;
    this._frameCount = frameCount;
    this._borderWidth = borderWidth;
    this._filePrefixString = filePrefixString;
    this._isFadeIn = isFadeIn;
    this._isFadeOut = isFadeOut;
    this._isScaleIn = isScaleIn;
    this._isScaleOut = isScaleOut;
  }


  canvas = null;
  ctx = null;

  //从1～frameCount
  curIndex = 0;

  run()
  {

    this.curIndex = 0;
    this.scheduleNext();


  }
  scheduleNext(){
    if ( ++this.curIndex > this._frameCount) return;

    let png = this.paintFrame(this.curIndex / this._frameCount);
    if ( this._frameCount === 1 )
    {
      //不需要动画 ；单帧
      this.saveFrame(png, this._filePrefixString + ".png");
    }else{
      this.saveFrame(png, this._filePrefixString + CanvasGen.padString(this.curIndex, 4) + ".png");
    }

  }


  paintFrame(animPercent)
  {

    this.canvas = createCanvas(this._frameSizeW, this._frameSizeH);
    this.ctx = this.canvas.getContext('2d');

    // this.ctx.clearRect(0, 0, this._frameSizeW, this._frameSizeH);

    console.log("CanvasGen/paintFrame",animPercent);

    //计算color
    let color = this._themeColor;
    let strokeColor = "#ffffff";
    if ( this._isFadeIn && this._isFadeOut)
    {
      if ( animPercent<0.5)
        color = CanvasGen.getColor(animPercent *2, this._themeColor);
      else
        color = CanvasGen.getColor((1-animPercent) *2, this._themeColor);
    }else {
      if ( this._isFadeIn)
      {
          color = CanvasGen.getColor(animPercent , this._themeColor);
      }
      if ( this._isFadeOut)
      {
          color = CanvasGen.getColor((1-animPercent), this._themeColor);
      }
    }
    console.log("CanvasGen/paintFrame",color    );
    //计算scale
    let scale = 1;
if ( this._isScaleIn && this._isScaleOut)
{
  if ( animPercent<0.5)
    scale = (animPercent*2);
  else
    scale = (1-animPercent)*2;
}else {
  if ( this._isScaleIn)
  {
      scale = animPercent;
  }
  else if ( this._isScaleOut)
  {
      scale = (1-animPercent);
  }
}

//
    let maxFontSize = Math.floor(Math.min(this._frameSizeW,this._frameSizeH) / this._textString.length);
let fontSize = Math.floor(maxFontSize * scale);
    // Write textString
    this.ctx.font = fontSize + 'px Impact';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = CanvasGen.getStrokeColor(color);
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    let halfW = this._frameSizeW*0.5;
    let halfH = this._frameSizeH*0.5;
    this.ctx.fillText(this._textString, halfW, halfH);
    this.ctx.strokeText(this._textString, halfW, halfH);

    // Draw border
    this.ctx.lineWidth = this._borderWidth;
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(halfW-halfW*scale, halfH-halfH*scale, this._frameSizeW*scale, this._frameSizeH*scale);


// Draw line under text
//     var text = this.ctx.measureText('Awesome!')
//     this.ctx.strokeStyle = 'rgba(0,0,0,0.5)'
//     this.ctx.beginPath()
//     this.ctx.lineTo(50, 102)
//     this.ctx.lineTo(50 + text.width, 102)
//     this.ctx.stroke()

    let pngConfig = {}
    return this.canvas.createPNGStream(pngConfig);


  }

  saveFrame(pngReadableStream, fileName)
  {

// 把pngReadableStream写入文件
    let fs = require('fs');
    let file = fs.createWriteStream(fileName);
    pngReadableStream.pipe(file);// end <boolean> End the writer when the reader ends. Default: true.
    file.on('finish',  ()=> {
      this.scheduleNext();
    });

  }

  // pad string
  static padString(num, n)
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

  static getColor(animPercent, _themeColor)
  {
    let alphaNumber = Math.max(15,Math.round(animPercent * 255) );
    return _themeColor + this.padString(alphaNumber.toString(16) ,2);
  }
  static getStrokeColor ( fillColor )
  {
    return "#ffffff" + fillColor.substr(6,2);
  }
}


// let gen=new CanvasGen("毒","#ffff00",100,100,1,5,"buff_du_",false,true,false,true);
// let gen=new CanvasGen("炸弹","#bbbbbb",100,100,1,1,"battleitem01",false,false,false,false);
// let gen=new CanvasGen("火道","#bbbbbb",100,100,1,1,"battleitem02",false,false,false,false);
// let gen=new CanvasGen("火枪","#bbbbbb",100,100,1,1,"battleitem03",false,false,false,false);
// let gen=new CanvasGen("冰道","#bbbbbb",100,100,1,1,"battleitem04",false,false,false,false);
// let gen=new CanvasGen("冰棺","#bbbbbb",100,100,1,1,"battleitem05",false,false,false,false);
// let gen=new CanvasGen("龙枪","#bbbbbb",100,100,1,1,"battleitem06",false,false,false,false);
// let gen=new CanvasGen("爆炸","#ff0000",100,100,1,8,"explosion",false,true,false,false);
// let gen=new CanvasGen("燃烧","#ff0000",80,80,1,4,"burning",false,true,false,false);
// let gen=new CanvasGen("喷火","#ff0000",400,80,1,4,"fireline",false,true,false,false);
// let gen=new CanvasGen("冰道","#0033FF",80,80,1,4,"iceroad",false,true,false,false);
// let gen=new CanvasGen("清直线","#000000",400,40,1,14,"killline",false,true,false,true);
// let gen=new CanvasGen("攻击加强","#ffff00",100,100,1,5,"spiritbuff",false,true,false,false);
// let gen=new CanvasGen("精神加持","#ffff00",500,500,1,5,"castspiritbuff",false,true,true,false);
gen.run();