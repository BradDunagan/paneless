
//	lib/paneless-frame.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessFrame';

    angular.module('app').directive ( directiveId, ['$document', '$compile', panelessFrameDirective] );

    function panelessFrameDirective ( $document, $compile ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

	        var startX = 0, startY = 0, orgX = 0, orgY = 0;
			var bSizing = false, orgW = 0, orgH = 0;
			var cliAdj = 0, stsAdj;

			var p = { };				//	What is persistent.  See scope.setP() and scope.getP() below.

			var mvr = element.find ( 'paneless-mover' );

			var tbr = element.find ( 'paneless-title-bar' );
			var cli = element.find ( 'paneless-client' );
			var sbr = element.find ( 'paneless-status-bar' );
			var sts = element.find ( 'paneless-status' );
			var szr = element.find ( 'paneless-sizer' );
	//		var spn = null, spnScope = null;			//	Mother Pane.  Null until it is split.

			var pane = element.find ( 'paneless-pane' );

			var dragTargetTree = null;

			//	Can't place the sizer until the element is added to the DOM.  
			//
			//	See the paneless-mother-pane directive,  how when it creates a pane,  it calls 
			//	scope.init() after the pane is added to the DOM.

			scope.init = function ( type ) {

				var t = tbr[0], m = mvr[0], c = cli[0], b = sbr[0], s = sts[0], z = szr[0], w, h, y;

				if ( m ) {			//	This pane got a mover?
					mvr.on ( 'mousedown', moveFrame );
				}

				if ( t && c && b ) {			//	Title bar, Client, and Status bar?

					cliAdj = t.offsetHeight + b.offsetHeight;

					h = element[0].clientHeight - cliAdj;

					console.log ( 'scope.init():  client h ' + h );

					cli.css ( { height: h + 'px' } );
				}

				if ( s && z ) {			//	Status message and Sizer

					stsAdj = z.offsetWidth + 2;

					w = element[0].clientWidth - stsAdj;

					sts.css ( { width: w + 'px' } );
				}

				if ( z ) {			//	This pane got a sizer (inside the status bar)?
					
					szr.on ( 'mousedown', sizeFrame );
				}

				scope.$on ( 'PanelessSplit', panelessSplit );

				scope.$on ( 'PanelessBringToFront', panelessBringToFront )

				scope.$on ( 'PanelessSendToBack', panelessSendToBack )

				pane.scope().init ( type );

			}	//	scope.init()


			scope.getP = function() {

				console.log ( 'paneless-frame scope.getP()' );

				p.x = element[0].style.left;
				p.y = element[0].style.top;
				p.w = element[0].style.width;
				p.h = element[0].style.height;

				p.paneP = pane.scope().getP();

				return p;

			}	//	scope.getP()

			scope.setP = function ( _p ) {

				console.log ( 'paneless-frame scope.setP()' );

				p = _p;

				pane.scope().setP ( p.paneP );

				element[0].style.left = p.x + 'px';			
				element[0].style.left = p.y + 'px';			

				setSize ( p.w, p.h );

			}	//	scope.setP()


			scope.destroySelf = function () {

				scope.$emit ( 'PanelessDestroyFrame', element );

			}	//	scope.destroySelf()


			function walkDragTargetTree ( t, f ) {
				if ( ! t ) {
					return;
				}
				if ( t.s ) {
					f ( t );
					return;
				}
				angular.forEach ( t, function ( v, k ) {
					walkDragTargetTree ( v, f );
				} );
			}	//	walkDragTargetTree()

			scope.showDragTargets = function ( dragElement ) {

				var pane, x, y, t;

				pane = cli.find ( 'paneless-pane' );

				x = cli[0].offsetLeft;
				y = cli[0].offsetTop;

				t = pane.scope().describeDragTargets ( x, y, dragElement );		//	Recurse on all panes.

			//	console.log ( JSON.stringify ( t, function ( k, v ) {
			//		if ( k === 's' )
			//			return '<scope>';
			//		return v;
			//	}, '    ' ) );

				function createTarget ( t ) {
					var html =   '<paneless-drag-target draggable="true" '
							   +                      'paneless-pane-w="' + t.w + '" '
							   +                      'paneless-pane-h="' + t.h + '">'
							   + '</paneless-drag-target>';

					t.dragTarget = $compile ( html ) ( t.s  );

					element.append ( t.dragTarget );

					t.dragTarget.css ( { visibility: 'visible',
										 left:   t.l + 'px',
										 top:    t.t + 'px',
										 width:  t.w + 'px',
										 height: t.h + 'px' } );

					t.dragTarget.scope().init ( dragElement, t.s );

				}	//	createTarget()

				walkDragTargetTree ( t, createTarget );

				dragTargetTree = t;

			}	//	scopw.showDragTargets()


			scope.hideDragTargets = function() {

				function deleteTarget ( t ) {
					if ( t && t.dragTarget ) {
						t.dragTarget.scope().$destroy();
						t.dragTarget.remove();
					}
				}	//	deleteTarget()

				walkDragTargetTree ( dragTargetTree, deleteTarget );

				dragTargetTree = null;

			}	//	scopw.hideDragTargets()


			function panelessSplit ( evt, pane, paneScope ) {

				console.log ( 'paneless-frame: panelessSplit()' );

				evt.stopPropagation();

	//			spn      = pane;			//	The pane that is split.
	//			spnScope = paneScope;		//	And its scope.

			}	//	panelessSplit()


			function panelessBringToFront ( evt ) {

				console.log ( 'paneless-frame: panelessBringToFront()' );

				evt.stopPropagation();

				scope.$emit ( 'PanelessFrameToFront', element )

			}	//	panelessBringToFront()


			function panelessSendToBack ( evt ) {

				console.log ( 'paneless-frame: panelessSendToBack()' );

				evt.stopPropagation();

				scope.$emit ( 'PanelessFrameToBack', element )

			}	//	panelessSendToBack()


			function moveFrame ( evt ) {
				console.log ( 'moveFrame()' );

				evt.preventDefault();
				evt.stopPropagation();
				
				startX = evt.pageX;		orgX = parseInt ( element[0].style.left );
				startY = evt.pageY;		orgY = parseInt ( element[0].style.top );

				$document.on ( 'mousemove', mousemove );
				$document.on ( 'mouseup', mouseup );
			}	//	moveFrame()


			function sizeFrame ( evt ) {
				console.log ( 'sizeFrame()' );

				evt.preventDefault();
				evt.stopPropagation();
				
				startX = evt.pageX;		orgW = parseInt ( element[0].style.width );
				startY = evt.pageY;		orgH = parseInt ( element[0].style.height );

				//	Pane(s)
				pane.scope().sizePaneOrg ( pane[0].offsetWidth, pane[0].offsetHeight );

				bSizing = true;
				
				$document.on ( 'mousemove', mousemove );
				$document.on ( 'mouseup', mouseup );
			}	//	sizeFrame()


			function setSize ( w, h ) {

					element.css ( { width:  w + 'px', height: h + 'px' } );

					//	Client
					cli.css ( { height: (h - cliAdj) + 'px' } );

					//	Pane(s)
					pane.scope().sizePane ( pane[0].offsetWidth, pane[0].offsetHeight );

					//	Status text.
					w = element[0].clientWidth - stsAdj;
					sts.css ( { width: w + 'px' } );

			}	//	setSize()


			function mousemove ( evt ) {
				var  dx, dy, x, y;
				
			//	evt.stopPropagation();

				dx = evt.pageX - startX;
				dy = evt.pageY - startY;

				if ( bSizing ) {
					//	Change width, height of this frame.
					setSize ( orgW + dx, orgH + dy );
				} else {
					//	Move this frame.
					x = orgX + dx;
					y = orgY + dy;
					element.css ( { left: x + 'px', top:  y + 'px' } );
				}
			}	//	mousemove()

 
			function mouseup() {

			//	element.css ( { overflow: 'hidden' } );		//	Chrome needs this to hide the scrollers.
			//	element.css ( { overflow: 'auto' } );		//	
			//	element[0].style.overflow = 'hidden';		//
			//	element[0].style.overflow = 'auto';			//

			//	szr.css ( { visibility: 'visible' } );
				bSizing = false;

				$document.unbind ( 'mousemove', mousemove );
				$document.unbind ( 'mouseup', mouseup );

			}	//	mouseup()

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,			//	Each frame gets its own scope.
            link:		link
        }

    }	//	panelessFrameDirective

})();


