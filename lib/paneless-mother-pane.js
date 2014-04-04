
//  lib/paneless-mother-pane.js

//	Small screens? (mobile)
//
//			               ?
//			sizeable pane --->  small screen
//
//	What happens?  Pane fills the screen?  Just the width changes?
//
//	Small panes to begin with.  Their size change?  How do they fit in?
//
//	Small screen:  All panes stacked vertically?
//
//	Overlapping panes to begin with.  Why not overlapping in the small
//	screen?
//
//	Do nothing?
//
//		When going to a small screen, the user manually adjusts panes.
//
//		All is remembered per user, device (screen size).
//
//		Per device, specify: 
//
//			Whether or not to stack when vertical, chain when horizontal.
//
//			Possibly floating and overlapping.
//
//			Max/min width and height, when vertical/stacking and horizontal/chaining.
//
//		When another user pulls a system choose the layout that most closely
//		matchs by W x H screen params.
//
//		Changing (adding and removing panes, not size changes) in one WxH will
//		neccessitate  * manual *  setting in the other WxHs.  But maybe some guesses 
//		can be made.  For example, if stacking then stack.
//
//	Small Screen Frames?
//
//		Frames where the layout for small screens is defined.
//
//		Coexist with other frames in large screens.
//
//		On small screens, systems thar don't have a small screen frame defined are not 
//		listed.
//

(function () { 
    'use strict';
    
    var directiveId = 'panelessMotherPane';

    angular.module('app').directive ( directiveId, ['$document', '$compile', '$interval', panelessMotherPaneDirective] );

    function panelessMotherPaneDirective ( $document, $compile, $interval ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

	        var nNewFrames = 0, startX = 0, startY = 0, orgX = 0, orgY = 0;

			var	dragMe = null, bDragTargetsShowing = false, dragResult = 'no-drag';

			scope.addFrame = function ( x, y, type ) {

				var newHTML, newFrame;

				console.log ( 'addFrame(): x ' + x + '  y ' + y );

				++nNewFrames;

				newHTML =   '<paneless-frame style="left: ' + x + 'px; '
						  +                       'top: '  + y + 'px; '
						  +                       'width:  300px; '
						  +                       'height: 200px;"> '

						  +     '<paneless-title-bar> '
						  +         '<paneless-mover></paneless-mover> '
						  +         '<paneless-title>Title Goes Here</paneless-title> '
						  +     '</paneless-title-bar> '

						  +		'<paneless-client>'
						  +			'<paneless-pane style="width: 100%; height: 100%; overflow: auto;">';

				if ( ! type ) {
					newHTML   +=			'<div>A new pane in the app (' + nNewFrames + ')!</div>'
							  +				'<div style="width: 220px; '
							  +							'height: 120px; '
							  +							'border: 1px solid blue; '
							  +							'margin: 8px; '
							  +							'background-color: darkblue;">'
							  +				'</div>';
				}
		
				newHTML   +=		'</paneless-pane>'
						  +		'</paneless-client>'

						  +		'<paneless-status-bar>'
						  +			'<paneless-status>'
						  +				'status messages here'
						  +			'</paneless-status>'
						  +			'<paneless-sizer></paneless-sizer>'
						  +		'</paneless-status-bar>'

						  + '</paneless-frame>';

				newFrame = $compile ( newHTML ) ( scope );

				element.append ( newFrame );

				newFrame.scope().init ( type );

			}	//	addFrame()


			scope.addTabs = function ( x, y ) {

				var newHTML, newFrame;

				console.log ( 'addTabs(): x ' + x + '  y ' + y );

				//	For now, in a frame, to get this tabs stuff going.
				//
				//	A group of labels that look like tabs.  For now, along the bottom.
				//	
				//	The main stuff, of course, is what is shown/showing when the tab is
				//	clicked/selected.  Each tab has a pane associated with it.  In that pane 
				//	is the app-specified stuff: maybe, for example, a status view.  So we
				//	have -
				//
				//		The paneless-tabs which contains everything tabic.
				//
				//		paneless-tab-pane for each tab.

				newHTML =   '<paneless-frame style="left: ' + x + 'px; '
						  +                       'top: '  + y + 'px; '
						  +                       'width:  300px; '
						  +                       'height: 200px;"> '

						  +     '<paneless-title-bar> '
						  +         '<paneless-mover></paneless-mover> '
						  +         '<paneless-title>Title Goes Here</paneless-title> '
						  +     '</paneless-title-bar> '

						  +		'<paneless-client>'
						  +			'<paneless-pane style="width: 100%; height: 100%; overflow: auto;">';

				newHTML   +=			'<paneless-tabs>'
						  +				'</paneless-tabs>';
		
				newHTML   +=		'</paneless-pane>'
						  +		'</paneless-client>'

						  +		'<paneless-status-bar>'
						  +			'<paneless-status>'
						  +				'status messages here'
						  +			'</paneless-status>'
						  +			'<paneless-sizer></paneless-sizer>'
						  +		'</paneless-status-bar>'

						  + '</paneless-frame>';

				newFrame = $compile ( newHTML ) ( scope );

				element.append ( newFrame );

				newFrame.scope().init ( 'tabs' );

			}	//	addTabs()


			scope.addPane = function ( x, y ) {

				var newHTML, newPane;

				console.log ( 'addPane(): x ' + x + '  y ' + y );

				newHTML =   '<paneless-pane style="left: ' + x + 'px; '
						  +                      'top: ' + y + 'px; '
						  +                      'width:  200px; '
						  +                      'height: 200px;" '
						  +                      'data-paneless-floating> '
						  +     '<paneless-title-bar> '
						  +         '<paneless-mover></paneless-mover> '
						  +         '<paneless-title>Title Goes Here</paneless-title> '
						  +     '</paneless-title-bar> '
						  +     'A new pane in the app!'
					//	  +     '<div style="border: 1px solid black; padding: 8px;"> '
						  +         '<div style="width:180px; height:150px; border: 1px solid black"></div>'
					//	  +     '</div> '
						  +     '<paneless-sizer></paneless-sizer> '
						  + '</paneless-pane>';

				newPane = $compile ( newHTML ) ( scope );

				element.append ( newPane );

				newPane.scope().init();

			}	//	scope.addPane()

			scope.$on ( 'PanelessFloatPane', function ( evt, eFloat, eParent ) {

				var children, eF, x, y, w, newHTML, newPane;

				//	See http://code.angularjs.org/1.2.14/docs/api/ng/type/$rootScope.Scope#$on

				evt.stopPropagation();

				//	eFloat		The element of the pane to be floated.
				//
				//	eParent		The parent element of eFloat.

				children = eParent.children();

				w = eParent[0].clientWidth;
				
				if ( children[0] === eFloat[0] ) {

					console.log ( 'scope.$on ( PanelessFloatPane, ... ):  Top pane is specified to be floated.' );

					//	Create a new floating pane by cloning eFloat.
					//
					eF = eFloat[0].cloneNode();			

					eF.innerHTML =   eFloat[0].innerHTML
								   + '<paneless-sizer></paneless-sizer>';

					x = parseInt ( eParent[0].style.left );
					y = parseInt ( eParent[0].style.top  );

					eF.style.position = 'absolute';
					eF.style.left     = x + 'px';
					eF.style.top      = y + 'px';
					eF.style.width    = w + 'px';
					eF.style.border   = '1px solid lightgray';

					eF.attributes.removeNamedItem ( 'data-paneless-docked' );
					eF.attributes.setNamedItem ( document.createAttribute ( 'data-paneless-floating' ) );

					newHTML = eF.outerHTML;

					newPane = $compile ( newHTML ) ( scope );

					element.append ( newPane );

					newPane.scope().init();

					//	Likewise, clone the pane on the other side of the splitter.  It will
					//	float also.
					//	
					eF = children[2].cloneNode();

					eF.innerHTML =   children[2].innerHTML
								   + '<paneless-sizer></paneless-sizer>';

					x = parseInt ( eParent[0].style.left ) + children[2].offsetLeft;
					y = parseInt ( eParent[0].style.top  ) + children[2].offsetTop;

					eF.style.position = 'absolute';
					eF.style.left     = x + 'px';
					eF.style.top      = y + 'px';
					eF.style.width    = w + 'px';
					eF.style.border   = '1px solid lightgray';

					eF.attributes.removeNamedItem ( 'data-paneless-docked' );
					eF.attributes.setNamedItem ( document.createAttribute ( 'data-paneless-floating' ) );

					newHTML = eF.outerHTML;

					newPane = $compile ( newHTML ) ( scope );

					element.append ( newPane );

					newPane.scope().init();
				}
				else {
					console.log ( 'scope.$on ( PanelessFloatPane, ... ):  What to do?' );
				}

				//	Destroy floated pane's parent element (and the original, docked panes, and 
				//	splitter) and scope (and its child scopes).
				//
				eParent.remove();

				evt.targetScope.$destroy();

			} );	//	scope.$on ( 'PanelessFloatPane', ... )


			scope.$on ( 'PanelessDestroyFrame', function ( evt, eFrame ) {

				//	See http://code.angularjs.org/1.2.14/docs/api/ng/type/$rootScope.Scope#$on

				evt.stopPropagation();

				//	Destroy fame element and scope (and its child scopes).
				//
				eFrame.remove();

				evt.targetScope.$destroy();

			} );	//	scope.$on ( 'PanelessDestroyFrame', ... )


			scope.$on ( 'PanelessContextMenu', function ( evt, menu ) {
				element.append ( menu );
			} );


			element.on ( 'contextmenu', function ( evt ) {
                
				var ms, menu;

				evt.preventDefault();
				evt.stopPropagation();

				scope.menuX = evt.pageX - element[0].offsetLeft;
				scope.menuY = evt.pageY - element[0].offsetTop;
				scope.menuCtx = 'mother';

				ms = [ evt.pageX, evt.pageY ];
				
				menu = $compile ( '<paneless-menu></paneless-nenu>' ) ( scope );

				menu[0].style.left     = "" + ms[0] + "px";
				menu[0].style.top      = "" + ms[1] + "px";
				menu[0].style.overflow = "visible";

				element.append ( menu );
			
			} );	//	element.on ( 'contextmenu', ...


			function cycleFrame ( frameElement, cb ) {
				var e2, p, newFrame;

				//	Remember it.
				e2 = frameElement[0].cloneNode();		e2.innerHTML = frameElement[0].innerHTML;
				p  = frameElement.scope().getP();

				//	Destroy it.
				frameElement.scope().$destroy();
				frameElement.remove();

				//	Rebuild it.
				newFrame = $compile ( e2.outerHTML ) ( scope );
				cb ( newFrame );
				newFrame.scope().init();
				newFrame.scope().setP ( p );

			}	//	cycleFrame()

			scope.$on ( 'PanelessFrameToFront', function ( evt, frameElement ) {

				cycleFrame ( frameElement, function ( newFrame ) {
					element.append ( newFrame );
				} );

			} );	//	scope.$on ( 'PanelessFrameToFront', ...


			scope.$on ( 'PanelessFrameToBack', function ( evt, frameElement ) {

				cycleFrame ( frameElement, function ( newFrame ) {
					element.prepend ( newFrame );
				} );

			} );	//	scope.$on ( 'PanelessFrameToBack', ...


			scope.$on ( 'PanelessDrag', function ( evt, dragElement ) {

				//	Dragging a pane from one frame to another.
				//
				//	The source is any pane.  A mousedown on a source indicator spcecifies
				//	the associated pane as the source pane.
				//
				//	Then the indicators become targets.
				//
				//	Clicking anywhere other than a source indicator, or a mouseup anywhere
				//	other than a target indicator cancels the operation.

				//	Or ...
				//
				//		See http://www.html5rocks.com/en/tutorials/dnd/basics/

				var orgX = 0, orgY = 0, e = dragElement[0], newHTML, startX, startY;

				evt.stopPropagation();

				showDrag ( dragElement );

				//	Find the center of the element to be dragged in this mother element's
				//	coordinates.
				while ( e !== element[0] ) {
					orgX += e.offsetLeft;
					orgY += e.offsetTop;
					e = e.offsetParent;
				}

				e = dragElement[0];		//	Again, because we used it up in the while() just above.

				orgX += e.offsetWidth  / 2;
				orgY += e.offsetHeight / 2;

				//	Append a drag indicator, centered on x y, to the contents of this mother 
				//	element.
			//	newHTML = '<paneless-drag-source                 ></paneless-drag-source>';
				newHTML = '<paneless-drag-source draggable="true"></paneless-drag-source>';

				dragMe = $compile ( newHTML ) ( scope );

				element.append ( dragMe );

				orgX -= dragMe[0].offsetWidth  / 2;
				orgY -= dragMe[0].offsetHeight / 2;

				dragMe.css ( { visibility: 'visible',
							   left: orgX + 'px',
							   top:  orgY + 'px' })

				
				dragMe.on ( 'mousedown', function ( evt ) {
				//	evt.preventDefault();		//	To keep from ending before we start.
					evt.stopPropagation();		//
				} );

				dragMe.on ( 'dragstart', function ( evt ) {
					var html;
					console.log ( 'PanelessDrag - dragstart' );
					html = e.innerHTML;
					evt.dataTransfer.effectAllowed = 'move';
					evt.dataTransfer.dropEffect    = 'move';
					html = e.innerHTML;
				//	evt.dataTransfer.setData ( 'text/html', html );		text/html does not work in IE.
				//	http://stackoverflow.com/questions/16720967/datatransfer-setdata-does-not-work-in-ie9
					evt.dataTransfer.setData ( 'text',      html );
					dragResult = 'pending';
				} );	//	scope.$on ( 'PanelessDrag', ... ) - dragstart

				dragMe.on ( 'dragend', function ( evt ) {
				//	var d = evt.dataTransfer.getData ( 'text' );
				//	console.log ( 'PanelessDrag - dragend   ' + evt.dataTransfer.dropEffect );
				//	console.log ( 'PanelessDrag - dragend   d ' + d );
					var dr = dragResult;
					console.log ( 'PanelessDrag - dragend   ' + dragResult );
					endDrag();

					if ( dr === 'dropped' ) {
						dragElement.scope().destroySelf();
					}
				} );	//	scope.$on ( 'PanelessDrag', ... ) - dragend


				$document.on ( 'mousedown', endDrag );

			} );	//	scope.$on ( 'PanelessDrag', ... )


			scope.$on ( 'PanelessDragDrop', function ( evt, result ) {
				dragResult = result;
			} );	//	scope.$on ( 'PanelessDragDrop', ...

			function endDrag ( evt ) {
				console.log ( 'endDrag()' );
				hideDrag();

				dragResult = 'no-drag';

				$document.unbind ( 'mousedown', endDrag );
			}	//	endDrag()


			function showDrag ( dragElement ) {

				var children, i;			//	Always only panelesse-frames.

				children = element.children();

				for ( i = 0; i < children.length; i++ ) {
					if ( dragMe && (children[i] === dragMe[0]) )
						continue;
					angular.element ( children[i] ).scope().showDragTargets ( dragElement );
				}

				bDragTargetsShowing = true;

			}	//	showDrag()


			function hideDrag() {
				var children, i;			//	Always only panelesse-frames.

				if ( ! bDragTargetsShowing ) {
					return;
				}

				if ( dragMe ) {
					dragMe.remove();
					dragMe = null;
				}

				children = element.children();

				for ( i = 0; i < children.length; i++ ) {
					if ( dragMe && (children[i] === dragMe[0]) )
						continue;
					angular.element ( children[i] ).scope().hideDragTargets();
				}

				bDragTargetsShowing = false;

			}	//	hideDrag()

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,			//	Each pane and splitter gets its own scope.
            link:		link
        }

    }	//	panelessMotherPaneDirective

})();

