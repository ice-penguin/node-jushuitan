let _ = require('lodash');
let crypto = require("crypto");
let request = require('request');
let util = require('./util');

let partnerid = "";
let partnerkey = "";
let token = "";
let url = "https://open.erp321.com/api/open/query.aspx";//请求地址默认正式

let method = {
    refresh:"refresh.token",
    productUpload:"item.upload",
    quantityUpdate:"inventory.count.confirm.upload",
    orderUpload:"jushuitan.orders.upload",
    orderCancel:"jushuitan.orders.cancel",
    orderQuery:"orders.single.query"
};//接口名

// 普通接口调用:
// 请求方式: post,业务参数以json的格式放入http-body中,系统参数跟随url
// sign的组成方式:
// key,value  为传入的系统参数，按传递顺序)(加密 key 中排除sign，method，partnerid,partnerkey)
// MD5(method +partnerid + (key1+value1+key2+value2+……) +partnerkey)
// 举例:以调用店铺查询接口为例:
// sign的源串:shops.queryywv5jGT8ge6Pvlq3FZSPol345asdtoken181ee8952a88f5a57db52587472c3798ts1540370062ywv5jGT8ge6Pvlq3FZSPol2323
// 请求的链接:https://c.jushuitan.com/api/open/query.aspx?method=shops.query&partnerid=ywv5jGT8ge6Pvlq3FZSPol345asd&token=181ee8952a88f5a57db52587472c3798&ts=1540370062&sign=aebf9d0146764d578d9c86e3b7783204
// 注:请求的业务参数在http-body中
// partnerid 合作方编号，用于接口的加密由我方提供            测试环境:ywv5jGT8ge6Pvlq3FZSPol345asd
// partnerkey 接入密钥，用于接口的加密由我方提供             测试环境:ywv5jGT8ge6Pvlq3FZSPol2323
// token 授权码                                         测试环境:181ee8952a88f5a57db52587472c3798
// ts 当前请求时间，时间戳格式(Unix 纪元到当前时间的秒数)
// method 调用具体接口的参数名，由我方给定
// sign 签名参数，按一定规则加密后的字符串

/**
 * 获取请求的系统参数
 * @param {调用具体接口的参数名，由我方给定} method 
 */
let getQuery = (method)=>{
    var str = method+partnerid;
    const md5 = crypto.createHash('md5');
    
    // method:method,
    // partnerid:partnerid,
    var obj = {
        token:token,
        ts:parseInt(new Date().getTime()/1000)
    }
    //获取待签名字符串
    for(var key in obj){
        str += (key+obj[key])
    }
    str += partnerkey;

    obj = _.merge(obj,{
        partnerid:partnerid,
        method:method,
        sign:md5.update(str).digest('hex')
    });

    var query = [];
    for(var key in obj){
        query.push(key+"="+obj[key]);
    }

    return query.join("&");
}

// console.log(getQuery("xx"));

var promise = new Promise((resolve,reject) => {
	resolve();
})

// 刷新token
let refresh = ()=>{
    var options = {
        url:url+"?"+getQuery(method.refresh),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify({})
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 普通商品上传
 * @param    {[Number]}                 shop_id [店铺编号]
 * @param    {[Array]}                 products [商品数组]
 * products参数
 * @param    {[String]}                 i_id [商品款号，理解为分类也可]
 * @param    {[String]}                 categoryName [商品款号名称]
 * @param    {[String]}                 sku_id [商品编号]
 * @param    {[String]}                 name [商品名称]
 * @param    {[String]}                 pic [商品图片,可不传]
 */
let productUpload = (shop_id,products)=>{
    var body = [];
    _.each(products,(product)=>{
        body.push({
            "shop_id":shop_id,
            "i_id":product.i_id,
            "shop_i_id":product.i_id,
            "name":product.categoryName,
            "enabled":1,
            "skus":[{
                    "sku_id":product.sku_id,
                    "shop_sku_id":product.sku_id,
                    "name":product.name,
                    "pic":product.pic,
                    "pic_big":product.pic,
                    "enabled":1
            }]
        })
    });
    var options = {
        url:url+"?"+getQuery(method.productUpload),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify(body)
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 盘点单上传
 * @param    {[String]}                 warehouse [仓库;主仓=1，销退仓=2， 进货仓=3，次品仓 = 4]
 * @param    {[Array]}                 products [商品数组]
 * products参数
 * @param    {[String]}                 sku_id [商品编号]
 * @param    {[Number]}                 qty [数量，正数盘盈，负数盘亏]
 */
let quantityUpdate = (warehouse,products)=>{
    var body = [];
    var items = [];
    _.each(products,(product)=>{
        items.push({
            "qty": product.qty,
            "sku_id": product.sku_id
        });
    });

    body.push({
        items:items,
        "so_id": new Date().getTime()+""+parseInt(Math.random()*1000),//使用时间戳+随机数组成单号
        "warehouse": warehouse
    });
    
    var options = {
        url:url+"?"+getQuery(method.quantityUpdate),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify(body)
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 订单上传
 * @param    {[Number]}                 shop_id [店铺编号]
 * @param    {[Array]}                 orders [订单数组]
 * orders参数
 * @param    {[String]}                 so_id [线上订单号, 长度 <= 50]
 * @param    {[Number]}                 order_date [订单日期,毫秒值]
 * @param    {[String]}                 shop_buyer_id [买家帐号 长度 <= 50]
 * @param    {[String]}                 receiver_state [收货省份 长度 <= 50；发货前可更新,可不填]
 * @param    {[String]}                 receiver_city [收货市 长度<=50；发货前可更新,可不填]
 * @param    {[String]}                 receiver_district [收货区/街道 长度<=50；发货前可更新,可不填]
 * @param    {[String]}                 receiver_address [收货地址 长度<=200；发货前可更新]
 * @param    {[String]}                 receiver_name [收件人 长度<=50；发货前可更新]
 * @param    {[String]}                 receiver_phone [联系电话 长度<=50；发货前可更新]
 * @param    {[Number]}                 pay_amount [应付金额，保留两位小数，单位元]
 * @param    {[Number]}                 freight [运费]
 * @param    {[Array]}                 items [产品信息]
 * @param    {[Object]}                 pay [支付信息]
 * @param    {[String]}                 buyer_message [买家留言 长度<=400；可更新]
 * items参数
 * {
        "sku_id": "s111001",
		"amount": 223.0,
		"base_price": 223.0,
		"qty": 1,
        "outer_oi_id": "8_438",
        "name": "SKU A1"
	}
 * @param    {[String]}                 sku_id [聚水潭系统sku]
 * @param    {[Number]}                 amount [应付金额，保留两位小数，单位（元）]
 * @param    {[Number]}                 base_price [基本价（拍下价格），保留两位小数，单位（元）]
 * @param    {[Number]}                 qty [数量]
 * @param    {[String]}                 name [商品名称 长度<=100]
 * @param    {[String]}                 outer_oi_id [商家系统订单号]
 * pay参数
 * @param    {[String]}                 outer_pay_id [外部支付单号，最大50]
 * @param    {[String]}                 pay_date [支付日期]
 * @param    {[Number]}                 amount [支付金额]
 * @param    {[String]}                 buyer_account [买家支付账号，最大 200,可不传默认为空]
 * @param    {[String]}                 seller_account [卖家支付账号，最大 50,可不传默认为空]
 */
let orderUpload = (shop_id,orders)=>{
    var body = [];
    _.each(orders,(order) => {
        //使得商户shop_sku_id与聚水潭sku_id相等
        _.each(order.items,(item)=>{
            item.shop_sku_id = item.sku_id;
        })
        var obj = {
            "shop_id": parseInt(shop_id),
            "so_id": order.so_id,
            "order_date": util.getShowDate(order.order_date,"second"),
            "shop_status": "WAIT_SELLER_SEND_GOODS",
            "shop_buyer_id": order.shop_buyer_id,
            "receiver_state": order.receiver_state || "",
            "receiver_city": order.receiver_city || "",
            "receiver_district": order.receiver_district || "",
            "receiver_address": order.receiver_address,
            "receiver_name": order.receiver_name,
            "receiver_phone": order.receiver_phone,
            "pay_amount": order.pay_amount,
            "freight": order.freight,
            "shop_modified": util.getShowDate(order.order_date,"second"),
            "buyer_message":order.buyer_message,
            "items": order.items,
            "pay": {
                "outer_pay_id": order.pay.outer_pay_id,
                "pay_date": util.getShowDate(order.pay.pay_date,"second"),
                "amount": order.pay.amount,
                "payment": order.pay.payment,
                "buyer_account": order.pay.buyer_account||"",
                "seller_account": order.pay.seller_account||""
            },
        }
        body.push(obj);
    })

    console.log(body);
    var options = {
        url:url+"?"+getQuery(method.orderUpload),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify(body)
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
            console.log("request done:", error, body)
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 订单取消
 * @param    {[Number]}                 shop_id [店铺编号]
 * @param    {[Array]}                 ids [聚水潭线上订单号 长度<=50]
 */
let orderCancel = (shop_id,ids)=>{
    var body = [];
    _.each(ids,(id)=>{
        body.push({
            "shop_id": parseInt(shop_id),
	        "so_id": id
        })
    })
    var options = {
        url:url+"?"+getQuery(method.orderCancel),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify(body)
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 订单查询
 * @param    {[String]}                 shop_id [店铺编号,可不传]
 * @param    {[String]}                 id [聚水潭线上订单号 长度<=50]
 */
let orderQuery = (shop_id,id)=>{
    var body = {
        so_ids:id
    };
    if(shop_id){
        body.shop_id = shop_id;
    }
    var options = {
        url:url+"?"+getQuery(method.orderQuery),
		method:"POST",
		headers:{
			"accept": "application/json",
			"content-type":"application/json"
        },
        body:JSON.stringify(body)
    };
    return new Promise(function(resolve,reject){
		request(options,function(error, response, body){
			if(error){
				return reject(error);
			}

			resolve(JSON.parse(body));
		});
	});
}

/**
 * 初始化客户端
 * @param {object} params 初始化参数
 * @param {String} partnerid 合作方编号
 * @param {String} partnerkey 接入密钥
 * @param {String} token 授权码
 * @param {String} url 请求地址，不填默认为正式地址
 */
exports.initClient = (params) => {
    if(!params){
		console.log("can't found params. 缺少初始化参数");
		return ;
    }
    if(!params.partnerid){
		console.log("can't found partnerid. 合作方编号partnerid");
		return ;
    }
    if(!params.partnerkey){
		console.log("can't found partnerkey. 接入密钥partnerkey");
		return ;
    }
    if(!params.token){
		console.log("can't found token. 授权码token");
		return ;
    }
    partnerid = params.partnerid;
    partnerkey = params.partnerkey;
    token = params.token;
    url = params.url || url;

    //返回方法
    return {
        refresh:refresh,//刷新token
        productUpload:productUpload,//商品信息维护
        quantityUpdate:quantityUpdate,//库存变更
        orderUpload:orderUpload,//订单上传
        orderCancel:orderCancel,//订单取消
        orderQuery:orderQuery//订单查询
    };
}