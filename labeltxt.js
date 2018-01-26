var Labeltxt = (function () {
	var _self;

	function Labeltxt(opt) {
		this.default = {
			'el': document.body,
			'show-toolbar': true,
			'mode': 'segmentation' // 模式有‘segmentation’和‘label’两种
		}
		this.config = Object.assign({}, this.default, opt)
		this.color = '#f23'
		this.textStack = [];
		this.letters = []; // 存放被选中的文字内容
		_self = this;

		init(this.config.el)
	}

	Labeltxt.prototype = {
		addText: function (htmlStr) {
			// 清空已有的标记内容
			clean()
			var text = document.getElementById('lt-text');
			text.innerHTML = htmlStr;
			this.textStack.push(htmlStr);
		},
		output: function () {
			var span = document.getElementsByClassName('text-selected');
			var obj = {};
			if (span) {
				for(var i = 0; i < span.length; i++) {
					obj[span[i].textContent] = span[i].dataset.label
				}
			}
			return obj
		}
	}

	function init(el) {
		render(el)
	}

	function render(el) {
		var ltbox = document.createElement('div');
		ltbox.id = 'lt-box';
		el.appendChild(ltbox);
		renderUi(ltbox)
		// renderToolsbox(ltbox)
		// renderTextbox(ltbox)
		// if (_self.config.mode === 'label') renderLabelsbox(ltbox)
	}
	function renderUi(parent) {
		var uiHtml = `
			<div class="lt-wrap">
				<div class="lt-content">
					<div id="lt-tools">
						<div class="lt-tool lt-tool-colors" style="background-color:${_self.color}">
							<ul class="item-colors">
								<li class="item-color" data-color="#f23" style="background-color: #f23;"></li>
								<li class="item-color" data-color="#0f2" style="background-color: #0f2;"></li>
								<li class="item-color" data-color="#3d1" style="background-color: #3d1;"></li>
								<li class="item-color" data-color="#50f" style="background-color: #50f;"></li>
							</ul>
						</div>
						<div class="lt-tool lt-tool-repeal">撤销</div>
					</div>
					<div id="lt-text"></div>
				</div>
			</div>
			<div id="lt-labels"></div>
			<div id="lt-mask">
				<div class="lt-mask-content">
					<select id="lt-select">
						<option value="你说">你说</value>
						<option value="什么">什么</value>
					</select>
					<input type="text" id="lt-input" />
					<button id="lt-select-submit" type"button">确认</button>
				</div>
			</div>
		`;
		parent.innerHTML = uiHtml;
		selectText()
		changeColor()
		repeal()
	}
	// function renderToolsbox(parent) {
	// 	var toolsbox = document.createElement('div');
	// 	toolsbox.id = 'lt-tools';
	// 	var toolsHtml = `
	// 		<div class="lt-tool lt-tool-colors" style="background-color:${_self.color}">
	// 			<ul class="item-colors">
	// 				<li class="item-color" data-color="#f23" style="background-color: #f23;"></li>
	// 				<li class="item-color" data-color="#0f2" style="background-color: #0f2;"></li>
	// 				<li class="item-color" data-color="#3d1" style="background-color: #3d1;"></li>
	// 				<li class="item-color" data-color="#50f" style="background-color: #50f;"></li>
	// 			</ul>
	// 		</div>
	// 		<div class="lt-tool lt-tool-repeal">撤销</div>
	// 	`
	// 	toolsbox.innerHTML = toolsHtml
	// 	parent.appendChild(toolsbox)

	// 	changeColor()
	// 	repeal()
	// }
	// function renderTextbox(parent) {
	// 	var textbox = document.createElement('div');
	// 	textbox.id = 'lt-text';
	// 	parent.appendChild(textbox)
	// 	selectText()
	// }
	// function renderLabelsbox(parent) {
	// 	var labelsbox = document.createElement('div');
	// 	labelsbox.id = 'lt-labels';
	// 	parent.appendChild(labelsbox)
	// }

	function changeColor() {
		var colors = document.getElementsByClassName('item-color');
		var tc = document.getElementsByClassName('lt-tool-colors')[0];
		for(let i = 0; i < colors.length; i++) {
			colors[i].onclick = function () {
				_self.color = this.dataset.color;
				tc.style.backgroundColor = _self.color;
			}
		}
	}
	function selectText(txtarea) {
		var selObj = window.getSelection();
		var range = document.createRange();
		var text = document.getElementById('lt-text');
		text.onmouseup = function (e) {
			if (e.target.classList.contains('text-selected')) {
				return;
			}
			if (selObj.anchorNode === selObj.focusNode && selObj.anchorOffset < selObj.focusOffset) {
				var span = createSpan(_self.textStack.length);
				range.setStart(selObj.anchorNode, selObj.anchorOffset)
				range.setEnd(selObj.anchorNode, selObj.focusOffset)
				_self.letters.push(selObj.toString())

				range.surroundContents(span);
				var text = document.getElementById('lt-text');
				_self.textStack.push(text.innerHTML);
				// 添加标签
				if (_self.config.mode === 'label') {
					// var ts = document.getElementsByClassName('text-selected')
					// addLabel(ts.length)
					showMask()
				}
			}
		}
	}
	function repeal() {
		var repeal = document.getElementsByClassName('lt-tool-repeal')[0];
		repeal.onclick = function () {
			if (_self.textStack.length === 1) return;

			_self.letters.pop()
			_self.textStack.pop()
			var text = document.getElementById('lt-text');
			text.innerHTML = _self.textStack[_self.textStack.length - 1];

			if (_self.config.mode === 'label') {
				var labelsbox = document.getElementById('lt-labels');
				labelsbox.removeChild(labelsbox.lastChild)
			}
		}
	}
	function clean() {
		_self.textStack = [];
		_self.letters = [];
		if (_self.config.mode === 'label') {
			var labelsbox = document.getElementById('lt-labels');
			labelsbox.innerHTML = ''			
		}
	}

	function createSpan(index) {
		var span = document.createElement("span");
		span.className = 'text-selected'
		span.setAttribute('title', index)
		span.style.backgroundColor = _self.color;
		return span;
	}

	function showMask() {
		var mask = document.getElementById('lt-mask');
		document.getElementById('lt-mask').style.display = 'block';
		selectLabel()
	}

	function selectLabel() {
		document.getElementById('lt-select-submit').onclick = function () {
			var input = document.getElementById('lt-input'),
				select = document.getElementById('lt-select');
			var value = input.value !== '' ? input.value : select.value;
			var ts = document.getElementsByClassName('text-selected')
			addLabel(value, ts.length)
			input.value = ''
			document.getElementById('lt-mask').style.display = 'none'
		}
	}

	function addLabel(value, index) {
		var label = document.createElement('div');
		label.className = 'lt-label';
		label.innerHTML = `<span class="label-index">${index}. </span> ${value}`;

		// _self.labelStack.push(label)
		var labelsbox = document.getElementById('lt-labels');
		labelsbox.appendChild(label)

		// var input = document.getElementsByClassName('label-input')[index - 1];
		// input.onchange = function () {
			var span = document.getElementsByClassName('text-selected')[index - 1];
			span.setAttribute('data-label', value)
		// }
	}

	return Labeltxt;
})()
