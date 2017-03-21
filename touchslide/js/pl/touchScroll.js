/*
移动端touch滑动组件
var domScroll = new TouchScroll({
					$con:$('#id')[0]/document.getElementById('id'), //最外层元素，相当于可视区域大小,最外层内部是较长的scroll,scroll内部是多个轮播页
					direction:'vertical',	//水平滚动或者垂直滚动,水平滚动scroll内部的列表元素需要加样式横向排列,默认为横向
					autoScroll:true,		//是否自动滚动，默认为否
					autoTime:5000,			//自动滚动的时间间隔
					scrollSpeed:250,		//图片滚动动画的时间，默认为500
					callBack:function(){console.log('move')},	//图片滚动的回调函数
					move:40,		//每次手指滑动检测的距离，越小越容易滑动，也越容易误操作	
				});
domScroll.init();
*/

var TouchScroll = function (opt) {
	this.index = 0;
	this.scrollLength = 0;
	this.num = 0;
	//scroll元素
	this.$conScroll = null;
	//是否是横向滑动
	this.isHorizontal = null;
	//scroll内部的轮播内容
	this.$conList = null;
	//自动轮播定时器
	this.setTime = null;
	this.config = {
		$con : opt.$con || null, 
		scrollSpeed : opt.scrollSpeed || 500,
		direction : opt.direction || 'horizontal',
		callBack : opt.callBack || null,
		move : opt.move || 30,
		//自动滚动
		autoScroll : opt.autoScroll || false,
		autoTime : opt.autoTime || 2000,
		
	};
}

TouchScroll.prototype = {
	init : function () {
		var that = this;
		
		if(that.config.direction !== 'horizontal' && that.config.direction !== 'vertical'){
			console.log('direction input error,please input "horizontal" or "vertical"');
			return;
		}else{
			that.isHorizontal = that.config.direction === 'horizontal' ? true : false;
		}
		//取第一个子元素作为scroll
		that.$conScroll = that.getChildren(that.config.$con)[0];
		that.$conList = that.getChildren(that.$conScroll);
		this.scrollLength = that.isHorizontal ? that.getListLength(that.$conList[0],'width') : that.getListLength(that.$conList[0],'height');
		that.num = that.$conList.length;
		//滚动列表前后添加dom
		that.addChildBefore(that.$conScroll,that.$conList[that.num - 1]);
		that.addChildAfter(that.$conScroll,that.$conList[0]);
		//修改距离顶端的距离
		that.scrollCssSet();
		//添加监听事件
		that.listenerFunc();
		//自动滑动方法
		if(that.config.autoScroll){
			that.autoFunc();
		}
		//that.config.autoScroll ? that.autoFunc() : true;
	},
	//获取所有的子元素，返回子元素数组，注意处理返回的元素数组
	getChildren : function ($parentDom) {
		var childrenDom = [],
			childCon = $parentDom.childNodes;
		for(var list in childCon){
			if(childCon[list].nodeType === 1 ){
				childrenDom.push(childCon[list]); 
			}else{
				continue;
			}
		}
		return childrenDom;
	},
	//获取长宽，不支持window和document，以及display:none
	getListLength : function ($dom,direction) {
		var val = null,
			offsetW = $dom.offsetWidth,
			offsetH = $dom.offsetHeight;
		if(window.getComputedStyle($dom).getPropertyValue('display') === 'none'){
			console.log('errro:not support display:none dom');
			return;
		}
		if(direction === 'width'){
			val = offsetW <= 0 ? offsetW : window.getComputedStyle($dom).getPropertyValue('width');
		}else if (direction === 'height'){
			val = offsetH <= 0 ? offsetH : window.getComputedStyle($dom).getPropertyValue('height');
		}else {
			console.log('getListLength Arg input invaild');
		}
		return val;
	},
	//在父元素内部最后插入元素
	addChildAfter : function (parentDom,childDom) {
		var insertDom = childDom.cloneNode(true);
		parentDom.appendChild(insertDom);
	},
	//在父元素内部最开始插入元素
	addChildBefore : function (parentDom,childDom) {
		var that = this,
			insertDom = childDom.cloneNode(true),
			firstDom = that.getChildren(parentDom)[0];
		parentDom.insertBefore(insertDom,firstDom);
	},
	//滚动元素的样式修改
	scrollCssSet : function () {
		var that = this;
		that.isHorizontal ? that.$conScroll.style.left = '-' + that.scrollLength : that.$conScroll.style.top = '-' + that.scrollLength;
		that.$conScroll.style.webkitTransition = '-webkit-transform '+ that.config.scrollSpeed/1000 + 's' +' linear';
		that.$conScroll.style.webkitTransform = 'translate(0,0)';
	},
	//动画无缝连接方法
	prevPageConnect : function () {

	},
	//右滑下滑方法
	turnRightDown : function (length) {
		var that = this,
			slideLength = length * (that.index - 1);
		that.$conScroll.style.transitionDuration = that.config.scrollSpeed/1000 + 's';
		if(that.index === 0){
			if(that.isHorizontal){
			//scroll向右移动 
				that.$conScroll.style.webkitTransform = 'translate('+ Math.abs(slideLength)  +'px,0)';
				setTimeout(function(){
					that.$conScroll.style.transitionDuration = '0s';
					that.$conScroll.style.webkitTransform = 'translate(-'+ length*(that.num - 1) +'px,0)';
					
					
				},that.config.scrollSpeed)
				that.index = that.num - 1;
			//向下翻页时
			}else{  
				that.$conScroll.style.webkitTransform = 'translate(0,'+ Math.abs(slideLength)   +'px)';
				setTimeout(function(){
					that.$conScroll.style.transitionDuration = '0s';
					that.$conScroll.style.webkitTransform = 'translate(0,-'+ (length*(that.num - 1)) +'px)';
					
				},that.config.scrollSpeed)
				that.index = that.num - 1;
			}
		}else{
			that.isHorizontal ? that.$conScroll.style.webkitTransform = 'translate(-'+ slideLength  +'px,0)' : that.$conScroll.style.webkitTransform = 'translate(0,-'+ slideLength  +'px)';
			that.index --;
		}
		//回调函数调用
		if(that.config.callBack !== null){
			that.config.callBack(that.index);
		}
	},
	//左滑上滑方法
	turnLeftUp : function (length) {
		var that = this,
			slideLength = length * (that.index + 1);
		that.$conScroll.style.transitionDuration = that.config.scrollSpeed/1000 + 's';
		if(that.index >= that.num - 1){
			if(that.isHorizontal){ 
				that.$conScroll.style.webkitTransform = 'translate(-'+ Math.abs(slideLength)  +'px,0)';
				setTimeout(function(){
					that.$conScroll.style.transitionDuration = '0s';
					that.$conScroll.style.webkitTransform = 'translate(0,0)';
				},that.config.scrollSpeed)
				that.index = 0;
			}else{  
				that.$conScroll.style.webkitTransform = 'translate(0,-'+ Math.abs(slideLength)   +'px)';
				setTimeout(function(){
					that.$conScroll.style.transitionDuration = '0s';
					that.$conScroll.style.webkitTransform = 'translate(0,0)';
					
				},that.config.scrollSpeed)
				that.index = 0;
			}
		}else{
			that.isHorizontal ? that.$conScroll.style.webkitTransform = 'translate(-'+ slideLength  +'px,0)' : that.$conScroll.style.webkitTransform = 'translate(0,-'+ slideLength +'px)';
			that.index ++;
		}	
		//回调函数调用
		if(that.config.callBack !== null){
			that.config.callBack(that.index);
		}
		
	},
	//滑动事件触发后调用次方法
	turn : function (start,end) {
		//$con.css
		var that = this;
		that.$conScroll.style.transitionDuration = that.config.scrollSpeed/1000 + 's';
		var that = this,
			index = this.index,
			NumReg = /[0-9]+/g,
			length = parseInt(this.scrollLength.match(NumReg)[0]),
			slideLength = null;
		if(start - end > that.config.move){
			//左上滑动

			that.turnLeftUp(length);
		}
		if(start - end < -(that.config.move)){
			//右下滑动

			that.turnRightDown(length);				
		}
		//用户手动滑动时，取消定时器事件
		clearInterval(that.setTime);
		//取消后定时器后，延时滚动消耗的时间，重新添加定时器
		setTimeout(that.setTime = setInterval(function (){
			that.turnLeftUp(length);
		},that.config.autoTime),that.config.scrollSpeed)

	},
	//事件监听
	listenerFunc : function () {
		var that = this,
			startX,
			startY,
			endX,
			endY;
		that.$conScroll.addEventListener('touchmove',function (e) {
			e.preventDefault();
		},false)
		that.$conScroll.addEventListener('touchstart',function (e) {
			var Touch = e.changedTouches[0];
			that.isHorizontal ? startX = Touch.screenX : startY = Touch.screenY;
		},false)
		that.$conScroll.addEventListener('touchend',function (e) {
			var Touch = e.changedTouches[0];
			that.isHorizontal ? that.turn(startX,Touch.screenX) : that.turn(startY,Touch.screenY);
		},false)
	},
	//定时自动滑动
	autoFunc : function () {
		var that = this,
			NumReg = /[0-9]+/g,
			length = parseInt(that.scrollLength.match(NumReg)[0]);
			that.setTime = setInterval(function (){
				that.turnLeftUp(length);
			},that.config.autoTime);
	},
}


