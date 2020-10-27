

//测试参数
let partnerid = "ywv5jGT8ge6Pvlq3FZSPol345asd";
let partnerkey = "ywv5jGT8ge6Pvlq3FZSPol2323";
let token = "181ee8952a88f5a57db52587472c3798";
let url = "https://c.jushuitan.com/api/open/query.aspx";
let shop_id = 111111;


/**
 * 初始化客户端
 * @param {object} params 初始化参数
 * @param {String} partnerid 合作方编号
 * @param {String} partnerkey 接入密钥
 * @param {String} token 授权码
 * @param {String} url 请求地址，不填默认为正式地址
 */
let client = require("../index").initClient({
	partnerid:partnerid,
	partnerkey:partnerkey,
	token:token,
	url:url
})

// console.log(client);

// token刷新
let refresh = ()=>{
	client.refresh()
	.then(function(body){
		console.log(body);
	})
}

// refresh();

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
let productUpload = ()=>{
	client.productUpload(shop_id,[{
        "i_id":"10090462",
		categoryName:"牛皮 单肩包",
		"sku_id":"A282100300",
		"name":"单肩包",
		"pic":null
    }])
	.then(function(body){
		console.log(body);
	})
}

// productUpload();

/**
 * 盘点单上传
 * @param    {[String]}                 warehouse [仓库;主仓=1，销退仓=2， 进货仓=3，次品仓 = 4]
 * @param    {[Array]}                 products [商品数组]
 * products参数
 * @param    {[String]}                 sku_id [商品编号]
 * @param    {[Number]}                 qty [数量，正数盘盈，负数盘亏]
 */
let quantityUpdate = ()=>{
	client.quantityUpdate(1,[{
		"qty": 50,
		"sku_id": "A282100300"
	}])
	.then(function(body){
		console.log(body);
	})
}

// quantityUpdate();

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
let orderUpload = ()=>{
	var now = new Date().getTime();
	client.orderUpload(shop_id,[{
		"shop_id": shop_id,
		"so_id": "118",
		"order_date": now,
		"shop_status": "WAIT_SELLER_SEND_GOODS",
		"shop_buyer_id": "5613281",
		"receiver_state": "河南省",
		"receiver_city": "郑州",
		"receiver_district": "经济技术开发区",
		"receiver_address": "啦啦啦哈哈哈哈哈哈1哈",
		"receiver_name": "杰森1",
		"receiver_phone": "18626862361",
		"pay_amount": 706.0,
		"freight": 4.0,
		"shop_modified": now,
		"buyer_message":"测试呀",
		"pay": {
			"outer_pay_id": "155775985878733471",
			"pay_date": now,
			"amount": 706.0,
			"payment": "微信",
			"buyer_account": "38",
			"seller_account": "未知"
		},
		"items": [{
			"sku_id": "A282100300",
			"amount": 223.0,
			"base_price": 223.0,
			"qty": 1,
			"outer_oi_id": "8_438",
			"name": "单肩包测试"
		}]
	}])
	.then(function(body){
		console.log(body);
	})
}

// orderUpload();

/**
 * 订单取消
 * @param    {[Number]}                 shop_id [店铺编号]
 * @param    {[Array]}                 ids [聚水潭线上订单号 长度<=50]
 */
let orderCancel = ()=>{
	client.orderCancel(shop_id,["114","115"])
	.then(function(body){
		console.log(body);
	})
}

// orderCancel();

/**
 * 订单查询
 * @param    {[String]}                 shop_id [店铺编号,可不传]
 * @param    {[String]}                 id [聚水潭线上订单号 长度<=50]
 */
let orderQuery = ()=>{
	client.orderQuery(shop_id,["114","115"])
	.then(function(body){
		console.log(body);
	})
}

// orderQuery();