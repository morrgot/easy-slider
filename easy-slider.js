var log = console.log.bind(console);
var Slider = (function(){

	String.prototype.ucFirst = function() {
		var str = this;
		if(str.length) {
			str = str.charAt(0).toUpperCase() + str.slice(1);
		}
		return str;
	};
		
	Slider.prototype.setOptions = function(opts){
		if(typeof opts === 'object'){
			var options = this.getOptions();
			for (var name in opts){
				options[name] = opts[name];
			}
		}
		
		return this;
	};
	
	return Slider;
	
	function Slider(container, opts){	
		var _slider = this,
			handle_element = container.querySelector('.slider-handle'),
			value_element = container.querySelector('.slider-value'),
			range_element = container.querySelector('.slider-range'),
			
			pixelTotal = range_element.clientWidth,
		
			valueMax = 100,
			valueMin = 0,
			valueTotal = (valueMax - valueMin),
			currentValue = 0,
			
			options = {
				value: valueMin,
				max: valueMax,
				min: valueMin,
				onSlide: null,
				onSlideStart: null,
				onSlideStop: null
			};
			
		this.getOptions = function(){
			return options;
		};
		
		this.setValue = function(val){
			val = _prepareValue(val);				
			slide({value: val, percent: _value2percent(val)});
			
			return this;
		};
		
		this.getValue = function(){
			return currentValue;
		};
		
		this.getPercent = function(){
			return _value2percent(currentValue);
		};
		
		(function(){				
			_slider.setOptions(opts);
			_slider.setValue(options.value);
		
			addEvent('mousedown', handle_element, mouseDown);
			addEvent('mousedown', range_element, function(event){
				mouseDown.call(_slider, event);
				mouseMove.call(_slider, event);
			});
		})();
		
		///////////////////////////////////	
		
		function mouseDown (event) {
			// chrome bug 
			event.preventDefault();

			addEvent('mousemove', document, mouseMove);
			addEvent('mouseup', document, mouseUp);
			
			_trigger('slideStart', [currentValue, _value2percent(currentValue)]);
			
			log('down');
		}
		
		function mouseUp (event) {
			event.preventDefault();
						
			removeEvent('mousemove', document, mouseMove);
			removeEvent('mouseup', document, mouseUp);
							
			_trigger('slideStop', [currentValue, _value2percent(currentValue)]);
			
			log('up');
		}
		
		function mouseMove (event) {	
			var x = event.pageX,
				norm = _normalizeX(x);
				
			if(norm.value != currentValue){							
				slide(norm);
			}
		}
		
		function slide(norm){
			currentValue = norm.value;
			
			_moveSlider(norm.percent);
			_trigger('slide', [norm.value, norm.percent]);
		}
		
		function _moveSlider(percent){			
			handle_element.style.left = percent + '%';
			value_element.style.width = percent + '%';
		}
		
		function _normalizeX( x ) {
			var pixelMouse,
				percentMouse,
				valueMouse;
			
			pixelMouse = x - range_element.getBoundingClientRect().left;
			
			percentMouse = ( pixelMouse / pixelTotal );
			if ( percentMouse > 1 ) {
				percentMouse = 1;
			}else if ( percentMouse < 0 ) {
				percentMouse = 0;
			}

			valueMouse = valueMin + percentMouse * valueTotal;
			percentMouse *= 100;

			return {value: toFixed(valueMouse), percent: toFixed(percentMouse)};
		}
		
		function _prepareValue(val){
		
			var percent = ( val / valueTotal );
			if (percent !== percent){ // NaN
				val = valueMin;
			}else if ( percent > 1 ) {
				val = valueMax;
			}else if ( percent < 0 ) {
				val = valueMin;
			} 
			
			return val;
		}
		
		function _value2percent(val){
			return toFixed(((val - valueMin)/valueTotal)*100);
		}
		
		function _trigger(eventName, args){
			var fn = options['on' + eventName.toString().ucFirst()];
			if(typeof fn === 'function'){
				fn.apply(_slider, args);
			}
		}
	}
	
	function addEvent(type, element, handler){
		if ( document.addEventListener ) {
			element.addEventListener( type, handler );
		} else {
			element.attachEvent( type, handler );
		}
	}
	
	function removeEvent(type, element, handler){
		if (element.removeEventListener) {                   // For all major browsers, except IE 8 and earlier
			element.removeEventListener(type, handler);
		} else if (element.detachEvent) {                    // For IE 8 and earlier versions
			element.detachEvent(type, handler);
		}
	}
	
	function toFixed(n){
		return parseFloat( n.toFixed( 3 ) );
	}
})();