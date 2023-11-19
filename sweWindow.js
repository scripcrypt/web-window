window.onload = (e) => {

	document.querySelectorAll(".sweWindow").forEach((sww)=>{
		sww.winwow = new sweWinwow(sww);
	});

}




class sweWinwow {

	wdNode;	// Window Node
	frNode;	// Frame Node
	hdNode;	// Header Node
	mnNode;	// Minimize Zone Node
	animationSpeed = 100;	// msec
	minimizeSize = 200;	// px


	/*--------------------------------------------------
		コンストラクタ
	--------------------------------------------------*/
	constructor (wdNode) {

		this.wdNode = wdNode;

		// ミニマイズゾーンの設定
		this.setMinimizeZone();

		// フレームで囲む
		this.attachFrame();

		// ヘッダーを付加する
		this.addHeader();

		// イベントをアタッチする
		this.attachEvents();

		// リサイズパーツの追加
		this.addResizeParts();

	}



	/*--------------------------------------------------
		ミニマイズゾーンの設定
	--------------------------------------------------*/
	setMinimizeZone = () => {

		if (this.wdNode.parentNode.querySelector(":scope > .sweWindowMinimizeZone")) {
			this.mnNode = this.wdNode.parentNode.querySelector(":scope > .sweWindowMinimizeZone");
		}
		else {
			this.mnNode = document.createElement("div");
			this.mnNode.classList.add("sweWindowMinimizeZone");
			this.wdNode.parentNode.append(this.mnNode);
		}

	};



	/*--------------------------------------------------
		フレームで囲む
	--------------------------------------------------*/
	attachFrame = () => {

		this.frNode = document.createElement("div");
		this.frNode.classList.add("sweWindowFrame");

		// 大きさを揃える
		this.frNode.style.width = this.wdNode.offsetWidth + "px";
		this.frNode.style.height = this.wdNode.offsetHeight + "px";
		this.wdNode.style.height = (this.wdNode.offsetHeight - 24) + "px";
		this.wdNode.style.width = "100%";

		// 位置を揃える
		const wdRect = this.wdNode.getBoundingClientRect();
		this.frNode.style.top = wdRect.top + "px";
		this.frNode.style.left = wdRect.left + "px";
		this.wdNode.style.top = "0px";
		this.wdNode.style.left = "0px";
		this.wdNode.style.position = "relative";

		this.wdNode.parentNode.insertBefore(this.frNode,this.wdNode);
		this.frNode.append(this.wdNode);

		// 状態設定
		this.frNode.status = "normal";

	};


	/*--------------------------------------------------
		ヘッダーを付加する
	--------------------------------------------------*/
	addHeader = () => {

		// ヘッダーの生成
		this.hdNode = document.createElement("div");
		this.hdNode.classList.add("sweWindowHeader");

		// ヘッダータイトルの設定
		this.addTitleHeader();

		// コントロールボタンの追加
		this.attachControlButtons();

		// ヘッダーレンダリング
		this.frNode.prepend(this.hdNode);

		// ヘッダー分ウィンドウを下げる
		this.wdNode.style.top = this.hdNode.offsetHeight+"px";

	};



		/*--------------------------------------------------
			ヘッダータイトルの設定
		--------------------------------------------------*/
		addTitleHeader = () => {
	
			const headerTitle = document.createElement("div");
			headerTitle.classList.add("sweWindowHeaderTitle");
			headerTitle.textContent = this.wdNode.getAttribute("title") ?? "no-title";

			this.hdNode.append(headerTitle);

		}



		/*--------------------------------------------------
			コントロールボタンの追加
		--------------------------------------------------*/
		attachControlButtons = () => {
	
			const headerButtons = document.createElement("div");
			headerButtons.classList.add("sweWindowHeaderButtons");

			// Minimize
			const minimizeButton = document.createElement("button");
			minimizeButton.classList.add("minimize");
			minimizeButton.addEventListener("mousedown",(e)=>{
//				e.stopPropagation();
				this.resizeWindow("minimize");
			});

			// Maximize
			const maximizeButton = document.createElement("button");
			maximizeButton.classList.add("maximize");
			maximizeButton.addEventListener("mousedown",(e)=>{
//				e.stopPropagation();
				this.resizeWindow("maximize");
			});

			// Close
			const closeButton = document.createElement("button");
			closeButton.classList.add("close");
			closeButton.addEventListener("mousedown",(e)=>{
				e.stopPropagation();
				this.closeWindow();
			});

			headerButtons.append(minimizeButton);
			headerButtons.append(maximizeButton);
			headerButtons.append(closeButton);

			this.hdNode.append(headerButtons);

		};


		/*--------------------------------------------------
			Resize Window
		--------------------------------------------------*/
		resizeWindow = async (resizeTo) => {

			const resizeFrom = this.frNode.status;
			resizeTo = resizeFrom === resizeTo ? "normal" : resizeTo;

			this.resizeInfo = {};

			// 何個目のミニマイズか？
			this.resizeInfo.chiAmt = this.mnNode.children.length;

			// ミニマイズゾーンの位置
			this.resizeInfo.mnRect = this.mnNode.getBoundingClientRect();

			// ウィンドウの位置
			this.resizeInfo.frRect = this.frNode.getBoundingClientRect();

			// ウィンドウのサイズ
			this.resizeInfo.curSize = {
				height: this.frNode.offsetHeight,
				width: this.frNode.offsetWidth
			};

			// 親要素の大きさ
			this.resizeInfo.parSize = {
				height: this.mnNode.parentNode.offsetHeight,
				width: this.mnNode.parentNode.offsetWidth,
			};

			// ヘッダーの高さ
			this.resizeInfo.hdHeight = this.hdNode.offsetHeight;

			// オリジナルサイズとポジションの取得
			this.resizeInfo.org = {};
			[
				this.resizeInfo.org.top,
				this.resizeInfo.org.left,
				this.resizeInfo.org.height,
				this.resizeInfo.org.width
			] = this.getOriginalSizePosition();

			// オリジナルサイズとポジションの保存
			if (resizeFrom==="normal") {
				this.setOriginalSizePosition();
			}

			const resizeName = resizeFrom+"2"+resizeTo;
			const [point,size] = this[resizeName]();


			// ウィンドウリサイズアニメーション
			await this.windowResizeAnimation(point,size,resizeFrom=="minimize" ? true : false);

			// アニメーション終了後
			this.afterAnim();

			this.frNode.status = resizeTo;

		};




		/*-------------------------------------------------
			Normal to Minimize
		-------------------------------------------------*/
		normal2minimize = () => {

			// アニメーションの値設定
			const point = {
				start: {
					top:  this.resizeInfo.frRect.top,
					left: this.resizeInfo.frRect.left
				},
				unit: {
					top:  (this.resizeInfo.mnRect.top - this.resizeInfo.frRect.top) / 10,
					left: ((this.resizeInfo.mnRect.left + this.resizeInfo.chiAmt * this.minimizeSize) - this.resizeInfo.frRect.left) / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.curSize.height,
					width:  this.resizeInfo.curSize.width
				},
				unit: {
					height: (this.resizeInfo.hdHeight - this.resizeInfo.curSize.height) / 10, 
					width:  (this.minimizeSize - this.resizeInfo.curSize.width) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.mnNode.append(this.frNode);
				this.frNode.setAttribute("style","position:relative; top:0px; left:0px; height:" + this.resizeInfo.hdHeight + "px; width:" + this.minimizeSize + "px");
			};

			return [point,size];

		};


			// オリジナルサイズとポジションの保存
			setOriginalSizePosition = () => {
				this.frNode.setAttribute("sweOSP",this.resizeInfo.frRect.top+","+this.resizeInfo.frRect.left+","+this.resizeInfo.curSize.height+","+this.resizeInfo.curSize.width);
			}


			// オリジナルサイズとポジションの取得
			getOriginalSizePosition = () => {
				const originalSP = this.frNode.getAttribute("sweOSP");
				if (originalSP) {
					const nms = originalSP.split(",");
					return nms.map((nm)=>{ return Number(nm); });
				}

				return [];
			}


		/*--------------------------------------------------
			Minimize to Normal
		--------------------------------------------------*/
		minimize2normal = () => {

			// アニメーションの値設定
			const point = {
				start: {
					top:  this.resizeInfo.frRect.top,
					left: this.resizeInfo.frRect.left
				},
				unit: {
					top:  (this.resizeInfo.org.top - this.resizeInfo.frRect.top) / 10,
					left: (this.resizeInfo.org.left - this.resizeInfo.frRect.left) / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.hdHeight,
					width:  this.minimizeSize
				},
				unit: {
					height: (this.resizeInfo.org.height - this.resizeInfo.hdHeight) / 10, 
					width:  (this.resizeInfo.org.width - this.minimizeSize) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.frNode.style.position = "absolute";
			};

			return [point,size];

		};


		/*--------------------------------------------------
			Maximize to Minimize
		--------------------------------------------------*/
		maximize2minimize = () => {

			// アニメーションの値設定
			const point = {
				start: {
					top:  0,
					left: 0
				},
				unit: {
					top:  this.resizeInfo.mnRect.top / 10,
					left: (this.resizeInfo.mnRect.left + this.resizeInfo.chiAmt * this.minimizeSize) / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.curSize.height,
					width:  this.resizeInfo.curSize.width
				},
				unit: {
					height: (this.resizeInfo.hdHeight - this.resizeInfo.curSize.height) / 10, 
					width:  (this.minimizeSize - this.resizeInfo.curSize.width) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.mnNode.append(this.frNode);
				this.frNode.style.position = "relative";
				this.frNode.style.top = "0px";
				this.frNode.style.left = "0px";
				this.frNode.style.height = this.resizeInfo.hdHeight + "px";
				this.frNode.style.width = this.minimizeSize + "px";
			};

			return [point,size];

		};


		/*--------------------------------------------------
			Normal to Maximize
		--------------------------------------------------*/
		normal2maximize = () => {

			// アニメーションの値設定
			const point = {
				start: {
					top:  this.resizeInfo.frRect.top,
					left: this.resizeInfo.frRect.left
				},
				unit: {
					top: this.resizeInfo.frRect.top * -1 / 10,
					left: this.resizeInfo.frRect.left * -1 / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.curSize.height,
					width:  this.resizeInfo.curSize.width
				},
				unit: {
					height: (this.resizeInfo.parSize.height - this.resizeInfo.curSize.height) / 10, 
					width:  (this.resizeInfo.parSize.width - this.resizeInfo.curSize.width) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.frNode.style.position = "absolute";
			};

			return [point,size];
		};


		/*--------------------------------------------------
			Miximize to Normal
		--------------------------------------------------*/
		maximize2normal = () => {

			// アニメーションの値設定
			const point = {
				start: {
					top:  0,
					left: 0
				},
				unit: {
					top:  (this.resizeInfo.org.top - this.resizeInfo.frRect.top) / 10,
					left: (this.resizeInfo.org.left - this.resizeInfo.frRect.left) / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.curSize.height,
					width:  this.resizeInfo.curSize.width
				},
				unit: {
					height: (this.resizeInfo.org.height - this.resizeInfo.curSize.height) / 10, 
					width:  (this.resizeInfo.org.width - this.resizeInfo.curSize.width) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.frNode.style.position = "absolute";
			};

			return [point,size];

		};


		/*--------------------------------------------------
			Minimize to Maximize
		--------------------------------------------------*/
		minimize2maximize = () => {

			// ウィンドウの位置
			const frRect = this.frNode.getBoundingClientRect();

			// アニメーションの値設定
			const point = {
				start: {
					top:  this.resizeInfo.frRect.top,
					left: this.resizeInfo.frRect.left
				},
				unit: {
					top: this.resizeInfo.frRect.top * -1 / 10,
					left: this.resizeInfo.frRect.left * -1 / 10
				}
			};
			const size = {
				start: {
					height: this.resizeInfo.hdHeight,
					width:  this.minimizeSize
				},
				unit: {
					height: ((this.resizeInfo.parSize.height - this.resizeInfo.hdHeight)- this.resizeInfo.hdHeight) / 10, 
					width:  (this.resizeInfo.parSize.width - this.minimizeSize) / 10
				}
			};

			// アニメーション終了後
			this.afterAnim = () => {
				this.frNode.style.position = "absolute";
			};

			return [point,size];

		};




		/*--------------------------------------------------
			ウィンドウリサイズアニメーション
		--------------------------------------------------*/
		windowResizeAnimation = async (point,size,outMin=false) => {

			return new Promise((resolve) => {

				// アニメーション
				let cnt = 1;
				let timer = setInterval(()=>{
					this.frNode.style.top = point.start.top + (point.unit.top * cnt) + "px";
					this.frNode.style.left = point.start.left + (point.unit.left * cnt) + "px";
					this.frNode.style.height = size.start.height + (size.unit.height * cnt) + "px";
					this.frNode.style.width = size.start.width + (size.unit.width* cnt) + "px";
					if (outMin) { 
						this.mnNode.parentNode.insertBefore(this.frNode,this.mnNode);
						outMin = false;
					}
					cnt++;
					if (cnt==11) {
						clearInterval(timer);
						resolve();
					}
				}, this.animationSpeed / 10);

			});

		};



	/*--------------------------------------------------
		ウィンドウを閉じる
	--------------------------------------------------*/
	closeWindow = () => {

		this.frNode.remove();

	};



	/*--------------------------------------------------
		イベントをアタッチする
	--------------------------------------------------*/
	attachEvents = () => {

		// Windowの移動
		this.frNode.addEventListener("mousedown",()=>{
			this.move2front();
		});

		// Windowの移動
		this.hdNode.addEventListener("mousedown",(e)=>{

			// 初期マウス位置
			let mousePos = {top:e.clientY,left:e.clientX};

			// ドラッグ中のビジュアル用クラス
			this.frNode.classList.add("dragging");

			// Windowの位置
			const frRect = this.frNode.getBoundingClientRect();

			const mousemove = (e) => {
				const top = e.clientY - mousePos.top + frRect.top;
				const left = e.clientX - mousePos.left + frRect.left;
				this.frNode.style.top = top + "px";
				this.frNode.style.left = left + "px";
			};

			document.addEventListener("mousemove",mousemove);

			document.addEventListener("mouseup",(e)=>{
				document.removeEventListener("mousemove",mousemove);
				// ドラッグ中のビジュアル用クラス
				this.frNode.classList.remove("dragging");
			});

		});

	};


		/*--------------------------------------------------
			ウィンドウを前面に出す　
		--------------------------------------------------*/
		move2front　= () => {
			this.frNode.parentNode.querySelectorAll(".sweWindowFrame").forEach((swf)=>{
				swf.style.zIndex = 0;
			});
			this.frNode.style.zIndex = 2;
		};


	/*--------------------------------------------------
		リサイズパーツの追加
	--------------------------------------------------*/
	addResizeParts = () => {

		let attachReizer = (p) => {

			const resizer = document.createElement("div");
			resizer.classList.add("sweWindow_resize_" + p);
			this.frNode.append(resizer);


			resizer.addEventListener("mousedown",(e)=>{

				let pos = e.target.getAttribute("class").replace(/^.*sweWindow_resize_| .*$/gms,"");

				// 初期マウス位置
				let mousePos = {top:e.clientY,left:e.clientX};

				// 初期ウィンドウサイズ
				let wdSize = {width:this.frNode.offsetWidth,height:this.frNode.offsetHeight};

				// Windowの位置
				const wdPos = this.frNode.getBoundingClientRect();


				const mousemove = (e) => {

					const mXdiff = e.clientX - mousePos.left;
					const mYdiff = e.clientY - mousePos.top;

					// TOP
					if (pos.match(/top/i)) {
						this.frNode.style.height = wdSize.height - mYdiff + "px";
						this.frNode.style.top = wdPos.top + mYdiff + "px";
					}
					// RIGHT
					if (pos.match(/right/i)) {
						this.frNode.style.width = wdSize.width + mXdiff + "px";
					}
					// BOTTOM
					if (pos.match(/bottom/i)) {
						this.frNode.style.height = wdSize.height + mYdiff + "px";
					}
					// LEFT
					if (pos.match(/left/i)) {
						this.frNode.style.width = wdSize.width - mXdiff + "px";
						this.frNode.style.left = wdPos.left + mXdiff + "px";
					}


				};
	
				document.addEventListener("mousemove",mousemove);
	
				document.addEventListener("mouseup",(e)=>{
					document.removeEventListener("mousemove",mousemove);
				});

			});

		};

		let pp;
		for (const p of ["top","right","bottom","left"]) {
			pp = pp ?? "left";
			attachReizer(pp+(p.charAt(0).toUpperCase() + p.slice(1)));
			attachReizer(p);
			pp = p;
		}

	};






}