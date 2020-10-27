var _ = require('lodash');
var crypto = require("crypto");

//系统加密规则
//params为一个对象
exports.sign = function(params){
  function sortKey(info){
    var str = "";
    var keyArr = [];
    for (var key in info) {
      if(info[key]==""||!info[key]){
        continue;
      }
      keyArr.push(key);
    }
    keyArr.sort();
    for (var i = 0; i < keyArr.length; i++) {
      if(i>0){
        str += "&";
      }
      var value = typeof(info[keyArr[i]]) == "object" ? JSON.stringify(info[keyArr[i]]):info[keyArr[i]];
      str += (keyArr[i]+"="+value)
    }
    // console.log("params:"+str);
    return  encodeURIComponent(str);
  };

  var str = sortKey(params);
  var md5sum = crypto.createHash("md5");
  md5sum.update(str,'utf-8');
  str = md5sum.digest("hex");
  return str;
}

//支付宝扫码支付链接生成
exports.aliUrl = function(params,key){
  try {
     // //读取秘钥
     // var privatePem = private_key;
     // var key = privatePem.toString();
     var prestr = sortKey(params);
     var url = 'https://openapi.alipay.com/gateway.do?' + prestr + '&sign=';
     var sign = crypto.createSign('RSA-SHA256');
     sign.update(prestr);
     sign = sign.sign(key, 'base64');
     // console.log("key:"+key);
     // console.log("sign:"+sign);
     url = url + encodeURIComponent(sign);
     return url;
  }catch(err) {
     console.log('err', err)
  }
}

//根据星期num获取周几
exports.getWeekName = function(weekNum){
    var week;
    switch(weekNum){
      case 0:
        week = "周一";
        break;
      case 1:
        week = "周二";
        break;
      case 2:
        week = "周三";
        break;
      case 3:
        week = "周四";
        break;
      case 4:
        week = "周五";
        break;
      case 5:
        week = "周六";
        break;
      case 6:
        week = "周日";
        break;
    }
    return week;
  }

//格式化分钟，保证返回2位数
exports.formatMin = function(mins){
    return mins<10?("0"+mins):mins.toString();
}

//检查是否为日期类型
exports.isDate=function (date){
    if(date&&date.constructor===Date){
      return true;
    }else{
      return false;
    }
};

//获取本机ip
exports.getIp=function (){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
}

//获得编号,按时间生成
exports.getExportTimeNo = function(){
    var now = new Date();
    var month = now.getMonth()+1,
        date = now.getDate(),
        hours = now.getHours(),
        mins = now.getMinutes(),
        second = now.getSeconds();
    return ""+(hours>9?hours:("0"+hours))+(mins>9?mins:("0"+mins))+(second>9?second:("0"+second));
}

//翻译常用状态为中文
exports.toChinese = function(value){
    var chinese;
    switch(value){
        case 'alipay':
            chinese='支付宝';
            break;
        case 'wx':
            chinese='微信';
            break;
        case 'cash':
            chinese='现金';
            break;
        case 'card':
            chinese='转账';
            break;
        case 'check':
            chinese='支票';
            break;
        case 'pos':
            chinese='POS机';
            break;
        case 'member':
            chinese='余额';
            break;
        case 'member_vir':
            chinese='虚拟卡';
            break;
        case 'member_spe':
            chinese='专用账户';
            break;
        case 'other':
            chinese='其他';
            break;
        default:
            chinese='暂无';
            break;
    };
    return chinese;
}

//保留两位小数
exports.dealNumber=function(num,str){
  var num2=num.toFixed(3);
  if(str){
    return num2.substring(0,num2.lastIndexOf('.')+3);
  }else{
    return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+3));
  }
};

//格式化开始时间，传入毫秒值
exports.formatSatrtDate = function(startDate){
  startDate = new Date(parseInt(startDate/1000)*1000);
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  return startDate;
}

//格式化结束时间，传入毫秒值
exports.formatEndDate = function(endDate){
  endDate = new Date(parseInt(endDate/1000)*1000);
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);
  return endDate;
}

//返回请求需返回的数据格式,传入2个日期,startDate开始日期，endDate结束日期
// {
//   key:"week",//"year","month","week"
//   data:[{
//     name:"一月",//数据节点名
//     startDate:Date,//开始时间
//     endDate:Date,//结束时间
//     count:12//值
//   }]
// }
exports.getDataFormat = function(startDate,endDate){
  var startYear = startDate.getFullYear(),
      startMonth = startDate.getMonth(),
      startDay = startDate.getDate(),
      endYear = endDate.getFullYear(),
      endMonth = endDate.getMonth(),
      endDay = endDate.getDate();
  var result = {}
  var year = endYear-startYear,
      month = endMonth-startMonth,
      day = endDay-startDay;

  if(year>0){
    if(year>1){
      result.key = "year";
    }else if(month>=0){
      result.key = "year";
    }else{
      result.key = "month";
    }
  }else if(month>1){
    if(month>2){
      result.key = "month";
    }else if(day>=0){
      result.key = "month";
    }else{
      result.key = "week"
    }
  }else{
    result.key = "week";
  }

  switch(result.key){
    case "year":
      result.data = getYearDom(startDate,endDate);
      break;
    case "month":
      result.data = getMonthDom(startDate,endDate);
      break;
    case "week":
      result.data = getWeekDom(startDate,endDate);
      break;
  }

  return result;

}

//根据开始时间，结束时间生成年份节点
var getYearDom = function(startDate,endDate){
  console.log(startDate,endDate);
  var data = [];
  var startYear = startDate.getFullYear(),
      endYear = endDate.getFullYear();
  var year = endYear-startYear;
  for (var i = 0; i < year+1; i++) {
    var yearNum = startYear+i;
    var startDate = new Date();
    startDate.setFullYear(yearNum,0,1);
    startDate = exports.formatSatrtDate(startDate);
    var endDate = new Date();
    endDate.setFullYear(yearNum+1,0,1);
    endDate = exports.formatSatrtDate(endDate);
    var obj = {
      name:yearNum+"年",//数据节点名
      startDate:startDate,//开始时间
      endDate:endDate,//结束时间
      count:0//值
    }
    data.push(obj);
  }
  
  return data;
}

//根据开始时间，结束时间生成月份节点,1年内
var getMonthDom = function(startDate,endDate){
  console.log(startDate,endDate);
  var data = [];
  var startYear = startDate.getFullYear(),
      endYear = endDate.getFullYear(),
      startMonth = startDate.getMonth(),
      endMonth = endDate.getMonth();
  var year = endYear-startYear;
  var month = endMonth-startMonth+12*year;
  var countYear = startYear;
  var countMonth = startMonth;

  for (var i = 0; i < month+1; i++) {
    if(countMonth>11){
      countMonth -= 12;
      countYear++;
    }

    var startDate = new Date();
    startDate.setFullYear(countYear,countMonth,1);
    startDate = exports.formatSatrtDate(startDate);
    var endDate = new Date();
    endDate.setFullYear(countYear,countMonth+1,1);
    endDate = exports.formatSatrtDate(endDate);

    var obj = {
      name:countYear+"-"+(countMonth+1),//数据节点名
      startDate:startDate,//开始时间
      endDate:endDate,//结束时间
      count:0//值
    }
    data.push(obj);
    countMonth ++;
  }
  return data;
}

//根据开始时间，结束时间生成周节点（每个周日）
var getWeekDom = function(startDate,endDate){
  console.log(startDate,endDate);
  var data = [];
  var startTime = startDate.getTime(),
      endTime = endDate.getTime();
  //生成第一个节点时间
  var beginDay = new Date(startTime);
  beginDay.setDate(startDate.getDate()-(startDate.getDay()==0?6:(startDate.getDay()-1)));
  var weeks = Math.ceil((endTime - beginDay.getTime())/604800000);//节点总共的周数
  beginTime = beginDay.getTime();
  for (var i = 0; i < weeks; i++) {
    var startDate = new Date(beginTime+i*604800000);
    startDate = exports.formatSatrtDate(startDate);
    var endDate = new Date(beginTime+(i+1)*604800000);
    endDate = exports.formatSatrtDate(endDate);
    var showDate = new Date(beginTime+(7*i+6)*86400000);

    var obj = {
      name:showDate.getFullYear()+"-"+(showDate.getMonth()+1)+"-"+showDate.getDate(),//数据节点名
      startDate:startDate,//开始时间
      endDate:endDate,//结束时间
      count:0//值
    }
    data.push(obj);
  }
  return data;
}

//测试节点区分
var testDom = function(){
  // console.log("week");
  // console.log(getWeekDom(new Date(1498898076000),new Date(1500021276000)));
  // console.log("month");
  // console.log(getMonthDom(new Date(1493714076000),new Date(1500021276000)));
  // console.log("year");
  // console.log(getYearDom(new Date(1462178076000),new Date(1500021276000)));
  console.log(exports.getDataFormat(new Date(1462178076000),new Date(1500021276000)));
};

function sortKey(info){
  var str = "";
  var keyArr = [];
  for (var key in info) {
    if(info[key]==""||!info[key]){
      continue;
    }
    keyArr.push(key);
  }
  keyArr.sort();
  for (var i = 0; i < keyArr.length; i++) {
    if(i>0){
      str += "&";
    }
    str += (keyArr[i]+"="+info[keyArr[i]])
  }
  return str;
};

//将数组转换成对象数组
//bson数组用
exports.toObjectArr=function (arr){
	var len = arr.length;
	for(var i = 0;i<len;i++){
		arr[i] = arr[i].toObject();
	}
	return arr;
};

//获取不重复的数组
exports.getNoRepeatArr = function (arr){
	var newArr = [];
	_.each(arr,function (sign){
		if(newArr.indexOf(sign) == -1){
			newArr.push(sign);
		}
	});
	return newArr;
};

//字符串为空或null
exports.strIsEmpty = function (str){
	if(!str || str == ""){
		return true;
	}
	return false;
};

//判断id长度是否符合规范
exports.idIsPass = function(id){
	return id.length == 24;
};

//判断号码是否符合规范
exports.isVailedPhone = function(phone){
	var isVailed = /^((\(\d{2,3}\))|(\d{3}\-))?((1[3,8,5]{1}\d{9})|(\d{7,8}))$/;
	return isVailed.test(phone);
};

function sha1(str){
  var md5sum = crypto.createHash("sha1");
  md5sum.update(str);
  str = md5sum.digest("hex");
  return str;
}

//验证是否来自微信的请求
exports.validateToken = function(query){
  var signature = query.signature;
  var timestamp = query['timestamp'];
  var nonce = query.nonce;
  var oriArray = new Array();
  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = "hulatiyu";//微信开发者中心页面里填的token
  oriArray.sort();
  var original = oriArray.join('');
  console.log("Original str : " + original);
  console.log("Signature : " + signature );
  var scyptoString = sha1(original);
  if(signature == scyptoString){
    return true;
  }else {
    return false;
  }
}

//获取uuid
exports.uuid = function(){
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var time = new Date().getTime();
  var num = 16;//保证是2位数，16为 对3位数进行63整除，除数大于等于16
  //将毫秒值除于num，整数和余数组成新的str
  var str = parseInt(time/num) + '' +(time%num<10?('0'+time%num):time%num);//整数+余数
  var len = str.length;
  var arr = [];
  var id = [];
  //将str按个数(3位)分配到数组中
  for (var i = 0; i < parseInt(len/3); i++) {
    arr[i] = parseInt(str.substring(3*i,3*i+3));
  }
  if(len%3){
    arr.push(parseInt(str.substring(3*arr.length)));
  }
  //对3位数进行63整除，除数大于等于16
  for (var i = 0; i < arr.length; i++) {
    //整数对应的值
    id.push(chars[parseInt(arr[i]/num)]);
    //余数对应的值
    id.push(chars[parseInt(arr[i]%num)]);
  }

  return id.join("");
};

//根据id从level中找出相应的数据
exports.findLevel = function (level,_id){
  var c;
  for (var i = level.length - 1; i >= 0; i--) {
    if(level[i]._id == _id){
      c =  level[i];
      break;
    }
  }
  return c;
};

//手机正则，验证手机格式是否正确
exports.isTel = function(tel){
    return /^1[3456789]\d{9}$/.test(tel);
}

//随即数字字符串
exports.randomNumber = function(length) {
　　var len = length || 4;
　　var $chars = '0123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
};

//随机字符串
exports.randomStr = function(length){
  var len = length || 4;
  var $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var maxPos = $chars.length;
  var pwd = '';
  for (var i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

//验证是否是有效身份证号码
exports.isIdCard = function(idCard){
    var reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    return reg.test(idCard);
}

//根据身份证获取性别
exports.getSex = function (idCard){
    var sex='';
    if(idCard.length==15){
        sex=idCard.slice(14,15)%2==0?'女':'男';
    }else{
        sex=idCard.slice(16,17)%2==0?'女':'男';
    }
    return sex;
};

exports.dealDate=function (date,value){
    var date=new Date(date);
    var year=date.getFullYear();
    var month=(date.getMonth()+1)>9?(date.getMonth()+1):'0'+(date.getMonth()+1);
    var day=date.getDate()>9?date.getDate():'0'+date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();

    switch (value) {
        case 'hour':
            return ""+year + month + day + hour;
            break;
        case 'min':
            return ""+year + month + day + hour + minute;
            break;
        case 'second':
            return ""+year + month + day + hour + minute + second;
            break;
        case 'month':
            return ""+year + month;
            break;
        case 'chinaese':
            return year + '年' + month + '月' + day + '日';
            break;
        default:
            return ""+year + month + day;
            break;
    };
};

exports.formatDate = exports.dealDate;

//根据传入日期返回展示日期
exports.getShowTime = function(date,value){
    var date=new Date(date);
    var hour=date.getHours()>9?date.getHours():'0'+date.getHours();
    var minute=date.getMinutes()>9?date.getMinutes():'0'+date.getMinutes();
    var second=date.getSeconds()>9?date.getSeconds():'0'+date.getSeconds();

    switch(value){
        case 'min':
            return hour+':'+minute;
            break;
        default:
            return hour+':'+minute+':'+second;
            break;
    };
}

//根据传入日期返回展示日期
exports.getShowDate=function(date, value) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    var day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();

    switch (value) {
        case 'hour':
            return year + '-' + month + '-' + day + ' ' + hour;
            break;
        case 'min':
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
            break;
        case 'second':
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
            break;
        default:
            return year + '-' + month + '-' + day;
            break;
    };
}

exports.test_ctr = function(value,type) {
    var flag;
    var reg_tel = /^1[3456789]\d{9}$/;
    var reg_idcard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
    var reg_Nonnegative = /^\d+(\.{0,1}\d+){0,1}$/;
    var reg_Positive = /^[0-9]+$/;
    var reg_PositiveNumber = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
    var reg_PositiveFloat = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    var reg_NonnegativeFloat = /^(([0-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
    switch(type){
        case 'exists':
            flag = typeof(value)=='undefined'?false:true;
            break;
        case 'tel':
            flag = reg_tel.test(value);
            break;
        case 'idCard':
            flag = reg_idcard.test(value);
            break;
        case 'nonnegative':
            flag = reg_Nonnegative.test(value);//非负数验证
            break;
        case 'positive':
            flag = reg_Positive.test(value);//正整数验证
            break;
        case 'positiveNumber':
            flag = reg_PositiveNumber.test(value);//正数验证
            break;
        case 'positiveFloat':
            flag = reg_PositiveFloat.test(value);//正两位小数验证
            break;
        case 'nonnegativeFloat':
            flag = reg_NonnegativeFloat.test(value);//非负两位小数验证
            break;
    };
    return flag;
}

//sha1加密
exports.sha1 = sha1;