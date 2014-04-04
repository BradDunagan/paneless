
//	lib/paneless-drag-target.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessDragTarget';

    angular.module('app').directive ( directiveId, ['$document', panelessDragTargetDirective] );

    function panelessDragTargetDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var w,  h;				//	width, height of the pane.
			var w2, h2;				//	w, h divided by 2.
		//	var	xul, yul, xll, yll;
			var wr, hr;				//	w, h of surronding rect of each target.
			var r;					//	radius of the targets.
			var xl, yl, wl, hl, rl;	//	left   target
			var xt, yt, wt, ht, rt;	//	top    target
			var xr, yr, wr, hr, rr;	//	right  target
			var xb, yb, wb, hb, rb;	//	bottom target

			var colorBullseye = 'rgba(160,160,160,1.0)';		//	Center of the target.
			var colorRing1    = 'rgba(180,180,180,1.0)';		//	First ring out from center of target.
			var colorRing2    = 'rgba(200,200,200,1.0)';		//	Next ring out.
			var colorRing3    = 'rgba(220,220,220,1.0)';		//
			var colorRing4    = 'rgba(240,240,240,1.0)';		//	Outer most ring.

			var sourceElement = null, targetPaneScope = null;

			w  = attrs.panelessPaneW;
			h  = attrs.panelessPaneH;
			w2 = w / 2;
			h2 = h / 2;

		//	xul = w2 - w2;		yul = h2 - h2;
		//	xll = w2 - w2;		yll = h2 + h2;

			
			wr = hr = Math.round ( (w2 < h2 ? (2 * w2) / 3 : (2 * h2) / 3) );

		//	r  = (3 * wr) / 7;		//	r = 4 + (Math.round ( r / 4 ) * 4);
			r  =      wr  / 3;		//	r = 4 + (Math.round ( r / 4 ) * 4);

			//	Left box and circle radius.
			xl = (w2 - wr) / 2;
			yl = (h  - hr) / 2;
			wl = wr;
			hl = hr;
			rl = r

			//	Top box and circle radius.
			xt = (w  - wr) / 2;
			yt = (h2 - hr) / 2;
			wt = wr;
			ht = hr;
			rt = r;

			//	Right box and circle radius.
			xr = w2 + ((w2 - wr) / 2);
			yr = (h - hr) / 2;
			wr = wr;
			hr = hr;
			rr = r;

			//	Bottom box and circle radius.
			xb = (w - wr) / 2;
			yb = h2 + ((h2 - hr) / 2);
			wb = wr;
			hb = hr;
			rb = r;


			scope.init = function ( srcElement, tgtPaneScope ) {

				sourceElement = srcElement;

				targetPaneScope = tgtPaneScope;

			}	//	scope.setDragSource()


			function dragEnter ( evt ) {
				var s = this.attributes.getNamedItem ( 'sector' );
				console.log ( 'dragEnter:  s ' + s + '  s.value ' + s.value + '   dropEffect ' + evt.dataTransfer.dropEffect  );
				if ( (!! s) && (!! s.value) ) {
					if ( s.value === 'left' ) {
						console.log ( 'left' );
						this.style.stroke='limegreen';	//	'darkgray';
					} else
					if ( s.value === 'top' ) {
						console.log ( 'top' );
						this.style.stroke='limegreen';	//	'darkgray';
					} else
					if ( s.value === 'right' ) {
						console.log ( 'right' );
						this.style.stroke='limegreen';	//	'darkgray';
					} else
					if ( s.value === 'bottom' ) {
						console.log ( 'bottom' );
						this.style.stroke='limegreen';	//	'darkgray';
					}
				}				
			}	//	dragEnter()

			function dragOver ( evt ) {
				if ( evt.preventDefault ) {
					evt.preventDefault();
				}
				return false;
			}	//	over()

			function dragDrop ( evt ) {
				var s, d;
				if ( evt.preventDefault ) {
					evt.preventDefault();
				}
				if ( evt.stopPropagation ) {
					evt.stopPropagation();
				}
				console.log ( 'Drop it, Baby!' );

			//	http://stackoverflow.com/questions/16720967/datatransfer-setdata-does-not-work-in-ie9
				d = evt.dataTransfer.getData ( 'text' );

				s = this.attributes.getNamedItem ( 'sector' );

				evt.dataTransfer.dropEffect = 'none';
				if ( (!! s) && (!! s.value) ) {
					if ( s.value === 'left' ) {
						console.log ( 'left' );
			//			targetPaneScope.dropLeft ( d );
						targetPaneScope.dropLeft ( sourceElement );
					} else
					if ( s.value === 'top' ) {
						console.log ( 'top' );
			//			targetPaneScope.dropTop ( d );
						targetPaneScope.dropTop ( sourceElement );
					} else
					if ( s.value === 'right' ) {
						console.log ( 'right' );
			//			targetPaneScope.dropRight ( d );
						targetPaneScope.dropRight ( sourceElement );
					} else
					if ( s.value === 'bottom' ) {
						console.log ( 'bottom' );
			//			targetPaneScope.dropBottom ( d );
						targetPaneScope.dropBottom ( sourceElement );
					}
				}			
				return false;
			}	//	dragDrop()

			function dragLeave ( evt ) {
				console.log ( 'chicken'  + '   dropEffect ' + evt.dataTransfer.dropEffect );
				this.style.stroke=colorRing4;	//	'lightgray';		//	rgba(200,255,200,0.4)';	
			}	//	dragLeave()


			element.append (	
				'<svg>'	
			 +		'<radialGradient id="g1">'
			 +			'<stop offset="0.4" stop-color="white"/>'
			 +			'<stop offset="1.0" stop-color="white" stop-opacity="0.0"/>'
			 +		'</radialGradient>'
			 +		'<radialGradient id="g2">'
			 +			'<stop offset="0.0" stop-color="' + colorBullseye + '"/>'
			 +			'<stop offset="0.2" stop-color="' + colorBullseye + '"/>'
			 +			'<stop offset="0.2" stop-color="' + colorRing1 + '"/>'
			 +			'<stop offset="0.4" stop-color="' + colorRing1 + '"/>'
			 +			'<stop offset="0.4" stop-color="' + colorRing2 + '"/>'
			 +			'<stop offset="0.6" stop-color="' + colorRing2 + '"/>'
			 +			'<stop offset="0.6" stop-color="' + colorRing3 + '"/>'
			 +			'<stop offset="0.8" stop-color="' + colorRing3 + '"/>'
			 +			'<stop offset="0.8" stop-color="' + colorRing4 + '"/>'
			 +			'<stop offset="1.0" stop-color="' + colorRing4 + '"/>'
			 +		'</radialGradient>'


			 +		'<rect x="' + xl + '" y="' + yl + '" width="' + wl + '" height="' + hl + '" '
			 +			'fill="url(#g1)"/>'
			 +		'<circle stroke-width="2" stroke="' + colorRing4 + '"  cx="' + (xl + (wl / 2)) +'" '
			 +		                                                      'cy="' + (yl + (hl / 2)) +'" '
			 +		                                                      ' r="' + rl + '" '
			 +		'fill="url(#g2)" sector="left"/>'


			 +		'<rect x="' + xt + '" y="' + yt + '" width="' + wt + '" height="' + ht + '" '
			 +			'fill="url(#g1)"/>'
			 +		'<circle stroke-width="2" stroke="' + colorRing4 + '"  cx="' + (xt + (wt / 2)) +'" '
			 +		                                                      'cy="' + (yt + (ht / 2)) +'" '
			 +		                                                      ' r="' + rt + '" '
			 +		'fill="url(#g2)" sector="top"/>'


			 +		'<rect x="' + xr + '" y="' + yr + '" width="' + wr + '" height="' + hr + '" '
			 +			'fill="url(#g1)"/>'
			 +		'<circle stroke-width="2" stroke="' + colorRing4 + '"  cx="' + (xr + (wr / 2)) +'" '
			 +		                                                      'cy="' + (yr + (hr / 2)) +'" '
			 +		                                                      ' r="' + rr + '" '
			 +		'fill="url(#g2)" sector="right"/>'


			 +		'<rect x="' + xb + '" y="' + yb + '" width="' + wb + '" height="' + hb + '" '
			 +			'fill="url(#g1)"/>'
			 +		'<circle stroke-width="2" stroke="' + colorRing4 + '"  cx="' + (xb + (wb / 2)) +'" '
			 +		                                                      'cy="' + (yb + (hb / 2)) +'" '
			 +		                                                      ' r="' + rb + '" '
			 +		'fill="url(#g2)" sector="bottom"/>'

			 +	'</svg>' );

			(function() {
				var svg = element.find ( 'svg' );
				var c   = svg.children(), e;
			//	angular.element ( c[2] ).on ( 'mouseover', over );
			//	angular.element ( c[0] ).on ( 'mouseover', over );
			//	angular.element ( c[0] ).on ( 'mousemove', over );

				e = angular.element ( c[3] );
				e.on ( 'dragenter', dragEnter );
				e.on ( 'dragover',  dragOver  );
				e.on ( 'drop',      dragDrop  );
				e.on ( 'dragleave', dragLeave );

				e = angular.element ( c[5] );
				e.on ( 'dragenter', dragEnter );
				e.on ( 'dragover',  dragOver  );
				e.on ( 'drop',      dragDrop  );
				e.on ( 'dragleave', dragLeave );

				e = angular.element ( c[7] );
				e.on ( 'dragenter', dragEnter );
				e.on ( 'dragover',  dragOver  );
				e.on ( 'drop',      dragDrop  );
				e.on ( 'dragleave', dragLeave );

				e = angular.element ( c[9] );
				e.on ( 'dragenter', dragEnter );
				e.on ( 'dragover',  dragOver  );
				e.on ( 'drop',      dragDrop  );
				e.on ( 'dragleave', dragLeave );
			})();

		//	element.on ( 'mousemove', function() {
		//		console.log ( 'paneless-drag-target element mousemove' );
		//	} );

		//	element.on ( 'dragover', function() {
		//		console.log ( 'paneless-drag-target element dragOver' );
		//	} );

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,
            link:		link
        }

    }	//	panelessDragTargetDirective

})();

