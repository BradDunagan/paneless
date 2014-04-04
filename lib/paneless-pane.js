
//  lib/paneless-pane.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessPane';

    angular.module('app').directive ( directiveId, ['$document', '$compile', panelessPaneDirective] );

    function panelessPaneDirective ( $document, $compile ) {

        function link ( scope, element, attrs ) {

			/*
			var bSplitHorz = false, topPane = null, topSzR = 0.0, topPaneSplit = false,
									midPane = null, midH = 0,
									botPane = null, botSzR = 0.0, botPaneSplit = false;

			var bSplitVert = false, lftPane = null, lftSzR = 0.0, lftPaneSplit = false,
													midW = 0,
									rgtPane = null, rgtSzR = 0.0, rgtPaneSplit = false;

			var orgW = 0, orgH = 0;

			var dragTarget = null;			//	Element shown as a target for another element to
											//	be dragged on to.
			*/
			var topPane = null,
				midPane = null, midH = 0,
				botPane = null;

			var lftPane = null,
								midW = 0,
				rgtPane = null;

			var dragTarget = null;			//	Element shown as a target for another element to
											//	be dragged on to.

			var cmEdit = null;				//	If the pane contains a CodeMirror editor.

			var sizeChangeNotifyees = [];


			//	What is persisted.
			var p = { bSplitHorz: false, topPaneSplit: false, botPaneSplit: false,
					  bSplitVert: false, lftPaneSplit: false, rgtPaneSplit: false,
					  topSzR: 0.0, botSzR: 0.0,
					  lftSzR: 0.0, rgtSzR: 0.0,
					  orgW: 0, orgH: 0 };


			scope.init = function ( contents ) {

				var bCM  = false, cmText = 'loading...';		//	Codemirroor and default contents.
				var tabs = null;

				console.log ( 'paneless-pane scope.init()' );

				if ( angular.isString ( contents ) ) {
					if ( contents === 'CmdRec')  {
						bCM = true;
					} else 
					if ( contents === 'tabs' ) {
						tabs = element.find ( 'paneless-tabs' );
						tabs.scope().init();
					} else {
						element.append ( contents );
					}
				} else
				if ( angular.isObject ( contents ) && contents.type ) {
					if ( contents.type === 'CodeMirror' ) {
						bCM = true;
						cmText = contents.text;
					}
				}

				if ( bCM ) {
					cmEdit = CodeMirror ( element[0], {
										  lineNumbers: true,
									//	  gutters:     ['CodeMirror-linenumbers', 'gutterESBtn'],
									//	  extraKeys:   { F10: f10,
									//					 F5:  f5,
									//					 F6:  f6,
									//					 F7:  f7 },
											value:       cmText
					} );
				}
			}	//	scope.init()


			scope.onSizeChange = function ( f ) {

				sizeChangeNotifyees.push ( f );

			}	//	scope.onSizeChange()


			scope.getContents = function () {

				if ( cmEdit ) { 
					return { type: 'CodeMirror',
							 text: cmEdit.getValue() };
				}

				return element[0].innerHTML;;

			}	//	scope.getContents()


			function removeContents() {
				var o, e;

				o = scope.getContents();

				if ( cmEdit ) { 
					//	Remove it from the DOM.
					e = cmEdit.getWrapperElement();
					angular.element ( e ).remove();
					cmEdit = null;
				}

				return o;

			}	//	removeContents()


			scope.getP = function() {

				console.log ( 'paneless-pane scope.getP()' );

				if ( p.bSplitHorz ) {
					p.topPaneP = angular.element ( topPane ).scope().getP();
					p.botPaneP = angular.element ( botPane ).scope().getP();
				}

				if ( p.bSplitVert ) {
					p.lftPaneP = angular.element ( lftPane ).scope().getP();
					p.rgtPaneP = angular.element ( rgtPane ).scope().getP();
				}

				return p;

			}	//	scope.getP()

			scope.setP = function ( _p ) {

				console.log ( 'paneless-pane scope.setP()' );

				p = _p;

				if ( p.bSplitHorz ) {
					setSplitHorzP();
					angular.element ( topPane ).scope().setP ( p.topPaneP );
					angular.element ( botPane ).scope().setP ( p.botPaneP );
				}

				if ( p.bSplitVert ) {
					setSplitVertP();
					angular.element ( lftPane ).scope().setP ( p.lftPaneP );
					angular.element ( rgtPane ).scope().setP ( p.rgtPaneP );
				}

			}	//	scope.setP()


			scope.floatPane = function ( eP ) {

				//	Extract the contents of this pane, create another with it.  Offset a little 
				//	by x, y from its original position.  It will appear top most (put it at the end
				//	of the mother pane's contents).
				//
				//	The rest of what is in the parent pane -
				//
				//		If just one more sibling pane then -
				//			Remove the splitter, transfer the sibling pane's contents to the parent 
				//			pane, destroy the sibling pane.
				//		else -
				//			Remove a splitter (figure out which one) and adjust the position (and 
				//			height) of all other siblings.

				if ( ! eP ) {
					scope.$parent.floatPane ( element );
					return;
				}

				//	eP is the pane to be floated.  Its element node will be cloned and a new
				//	paneless-pane directive will be created.
				//
				//	This directive's element is that of the current parent pane.  It contains
				//	the specified pane to be floated, the splitter and the pane on the other side
				//	of the splitter.  That other pane will also be cloned, a new directive will
				//	be created and it will end up floating as well.
				//
				//	The original parent pane and all its children will be destroyed.

				scope.$emit ( 'PanelessFloatPane', eP, element );

			}	//	scope.floatPane()

			
			scope.destroySelf = function() {

				//	If this is the only pane in the frame then -
				//
				//		Destroy the frame element and the its scope.  The child elements and scopes will
				//		be destroyed automatically.

				var ep = element.parent();

				console.log ( 'paneless-pane  destroySelf()' );

				if ( ep.children().length === 1 ) {		//	Currently, just one pane in this frame?
					scope.$parent.destroySelf();
					return;
				} 

				//	Else -
				//
				//		When done, the parent pane will contain the contents of what is on the opposite 
				//		side of the splitter from this pane.
				//
				//		This pane, the splitter and the pane of the other side of the splitter, along
				//		with their scopes are destroyed.
				
				scope.$parent.destroyPane ( element );

			};	//	scope.destroySelf()


			scope.destroyPane = function ( paneE ) {

				var etop, ebot, elft, ergt, ep;

				var html = null, newContent = null;

				scope.$on ( 'PanelessSplit', null );
				scope.$on ( 'PanelessUnSplit', null );

				scope.$emit ( 'PanelessUnSplit' );		//	Notify the parent pane.  We don't need
														//	size changes any longer.

				if ( p.bSplitHorz ) {

					etop = angular.element ( topPane );					topPane = null;
						   angular.element ( midPane ).remove();		midPane = null;		midH = 0;
					ebot = angular.element ( botPane );					botPane = null;

					if ( paneE[0] === etop[0] ) {
						html = ebot[0].innerHTML;
							 ebot.scope().sizePaneOrg();
						ep = ebot.scope().getP();
					} else
					if ( paneE[0] === ebot[0] ) {
						html = etop[0].innerHTML;
							 etop.scope().sizePaneOrg();
						ep = etop.scope().getP();
					}

					etop.scope().$destroy();
					ebot.scope().$destroy();

					etop.remove();
					ebot.remove();

					p.bSplitHorz = false;
				}

				if ( p.bSplitVert ) {
				
					elft = angular.element ( lftPane );					lftPane = null;
						   angular.element ( midPane ).remove();		midPane = null;		midH = 0;
					ergt = angular.element ( rgtPane );					rgtPane = null;

					if ( paneE[0] === elft[0] ) {
						html = ergt[0].innerHTML;
							 ergt.scope().sizePaneOrg();
						ep = ergt.scope().getP();
					} else
					if ( paneE[0] === ergt[0] ) {
						html = elft[0].innerHTML;
							 elft.scope().sizePaneOrg();
						ep = elft.scope().getP();
					}

					elft.scope().$destroy();
					ergt.scope().$destroy();

					elft.remove();
					ergt.remove();

					p.bSplitVert = false;
				}

				element[0].style.overflow = 'auto';		//	Enable scorllbars again.

				newContent = $compile ( html );

				newContent = newContent ( scope );

				element.append ( newContent );

				scope.setP ( ep );
				scope.sizePane ( element[0].offsetWidth, element[0].offsetHeight );

			};	//	scope.destroyPane()


			scope.splitHorz = function() {

				var ep = element.parent();

				//	If this pane is the only pane in the frame then we are not splitting
				//	this frame but rather -
				//
				//		Remove the current, single pane (but keep its contents).
				//
				//		Add a new pane that will fill the client.  This will be the "container".
				//
				//		Add a new pane to the container.  This new pane will have the contents
				//		of that that is being split.  When we are done this new pane will look
				//		just like the original pane but possibly shorter in height.
				//
				//		Add a splitter to the container.  Width == 100% of width of container.
				//
				//		Add another new pane to the container.  This will be empty.
				//		
				//		The upshot is -
				//
				//			The container will fill the client.
				//
				//			The two new panes and the splitter added to the container will 
				//			always fill the container.
				//
				//			When the frame is resized the client and now the container and
				//			its contents (the two new panes and the splitter) must be resized 
				//			manually as well.
				//
				//			The client will not show scroll bars again.  Nor will the container.
				//			Instead the panes inside the containing panes will show scroll bars
				//			independently when they overflow with app-specified contents.

				if ( ep.children().length === 1 ) {

					//	This pane is the original/first pane of the frame.  This pane is currently 
					//	contained by the frame client.
					//
				//	commonSplitHorz ( ep[0].clientHeight, null, '<div>Another Pane!</div>', 'top' );
					commonSplitHorz ( ep[0].clientHeight, null, 'top' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {

					//	This pane is not the only pane in the frame.  Therefore this pane must be
					//	contained by another pane (see above).  Then -
					//
					//		Get the contents of this pane.
					//
					//		Empty this pane.
					//
					//		This pane is now deemed a "container".  Set its overflow property to 
					//		'hidden' since it will no longer need to show scroll bars.
					//
					//		Add new pane with the contents of the original, a splitter, and another
					//		new pane (empty) as described above.
					//
					//		The upshot is -
					//
					//			As above, overflow is taken care of by the new panes as the container
					//			is resized or the contents of the new panes change.
					//
					//			When the frame is resized the containers must be resized recursively.

					//	This pane is inside a containing pane.
					//
				//	commonSplitHorz ( element[0].clientHeight, null, '<div>Yet another Pane!</div>', 'top' );
					commonSplitHorz ( element[0].clientHeight, null, 'top' );

					scope.$emit ( 'PanelessSplit', 		//	Notify the parent pane.
								  scope.$id );			//	It only needs a scope Id.
				}

				//	Now the top or bottom panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );		
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

			}	//	scope.splitHoriz()


//			function commonSplitHorz ( h, topHTML, bottomHTML, keep ) {
			function commonSplitHorz ( h, 
									   sourceElement,	//	From where to get the contents of the new pane.
														//	If null then make something up.
									   keep ) {			//	Which pane is maintained from the original.

				var e2, sourceContents, h2, newHTML, newContent, topContents, botContents;	//	contents;

//				contents = removeContents();

				e2 = element[0].cloneNode();			//	The element is going to be replaced.  But we
														//	want to maintain the current one because it 
														//	will be contained by the replacement.

				//	Node cloning does not include the contents of the node.
//				e2.innerHTML = topHTML ? topHTML : element[0].innerHTML;
				if ( keep === 'top' ) {
					topContents = removeContents();
					if ( sourceElement ) {
						botContents = sourceElement.scope().getContents();
					} else {
						botContents = '<div>Yet another pane!</div>';
					}
				} else {
					botContents = removeContents();
					if ( sourceElement ) {
						topContents = sourceElement.scope().getContents();
					} else {
						topContents = '<div>Yet another pane!</div>';
					}
				}

				h2 = (h - 4) / 2;						//	Height of the new panes above and below the 
														//	splitter.  4 is the splitter height not 
														//	including its top, bottom borders.  The height
														//	of the pane below the splitter is adjusted for
														//	splitter's borders.
				e2.style.position = 'relative';
				e2.style.top      = '0px';				//	At top left of the container.
				e2.style.left     = '0px';
				e2.style.border   = 'none';				//	Use the container's and splitter's borders.
				e2.style.height   = h2 + 'px';	
				e2.style.width    = '100%';

			//	e2.attributes.removeNamedItem ( 'data-paneless-floating' );
			//	e2.attributes.setNamedItem ( document.createAttribute ( 'data-paneless-docked' ) );

				element.empty();

				newHTML =    e2.outerHTML
							+ '<paneless-splitter-horz></paneless-splitter-horz>' 
							+ '<paneless-pane style="position: relative; '
							+                      'width: 100%; '
							+                      'height: ' + (h2 - 2) + 'px; '
							+                      'border: none;">'
//							+     bottomHTML
							+ '</paneless-pane>';

				newContent = $compile ( newHTML ) ( scope );

				element.append ( newContent );

				element[0].style.overflow = 'visible';	//	No scroll bars in this, what is now the 
														//	container.
				setSplitHorzP();

//				if ( keep === 'top' ) {
//					angular.element ( topPane ).scope().init ( contents )
//				}  else {
//					angular.element ( botPane ).scope().init ( contents )
//				}
				angular.element ( topPane ).scope().init ( topContents )
				angular.element ( botPane ).scope().init ( botContents )

			}	//	commonSplitHorz()

			function setSplitHorzP() {
				var c;
				p.bSplitHorz = true;

				c = element.children();		//	This element is a parent of ...
				topPane = c[0];
				midPane = c[1];			midH = midPane.offsetHeight;	//	Actually, the splitter.
				botPane = c[2];

			}	//	setSplitHorzP()

//			function commonSplitVert ( w, leftHTML, rightHTML, keep ) {
			function commonSplitVert ( w, 
									   sourceElement,	//	From where to get the contents of the new pane.
														//	If null then make something up.
									   keep ) {			//	Which pane is maintained from the original.

//				var e2, w2, newHTML, newContent, contents;
				var e2, w2, newHTML, newContent, lftContents, rgtContents;

//				contents = removeContents();

				e2 = element[0].cloneNode();

//				e2.innerHTML = leftHTML ? leftHTML : element[0].innerHTML;
				if ( keep === 'left' ) {
					lftContents = removeContents();
					if ( sourceElement ) {
						rgtContents = sourceElement.scope().getContents();
					} else {
						rgtContents = '<div>Yet another pane!</div>';
					}
				} else {
					rgtContents = removeContents();
					if ( sourceElement ) {
						lftContents = sourceElement.scope().getContents();
					} else {
						lftContents = '<div>Yet another pane!</div>';
					}
				}

				w2 = (w - 4) / 2;

				e2.style.position = 'absolute';
				e2.style.top      = '0px';				//	At top left of the container.
				e2.style.left     = '0px';
				e2.style.border   = 'none';				//	Use the container's and splitter's borders.
				e2.style.height   = '100%';	
				e2.style.width    = w2 + 'px';

				element.empty();

				newHTML =     e2.outerHTML
							+ '<paneless-splitter-vert style="left: ' + w2 + 'px;"> '
							+ '</paneless-splitter-vert>' 
							+ '<paneless-pane style="position: absolute; '
							+						 'left: ' + (w2 + 6) + 'px; '
							+						 'top: 0px; '
							+                      'width: ' + (w2 - 2) + 'px; '
							+                      'height: 100%; '
							+                      'border: none;">'
//							+     rightHTML 
							+ '</paneless-pane>';

				newContent = $compile ( newHTML ) ( scope );

				element.append ( newContent );

				element[0].style.overflow = 'visible';	//	No scroll bars are necessary.

				setSplitVertP();

//				if ( keep === 'left' ) {
//					angular.element ( lftPane ).scope().init ( contents )
//				}  else {
//					angular.element ( rgtPane ).scope().init ( contents )
//				}
				angular.element ( lftPane ).scope().init ( lftContents )
				angular.element ( rgtPane ).scope().init ( rgtContents )

			}	//	commonSplitVert()


			function setSplitVertP() {
				var c;
				p.bSplitVert = true;

				c = element.children();		//	This element is a parent of ...
				lftPane = c[0];
				midPane = c[1];			midW = midPane.offsetWidth;	//	Actually, the splitter.
				rgtPane = c[2];

			}	//	setSplitVertP()


			scope.splitVert = function() {

				var ep = element.parent();

				if ( ep.children().length === 1 ) {

					//	Something like horizonal split.
					//
					//	Splitting vertically so positioning horizontally.
					//
					//	Since positioning horizontally the panes and splitter must have position set to
					//	absolute.
					//
					//	This pane is original/first pane of the frame.  This pane is currently 
					//	contained by the frame client.
					//
		//			commonSplitVert ( ep[0].clientWidth, null, '<div>Another Pane!</div>', 'left' );
					commonSplitVert ( ep[0].clientWidth, null, 'left' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {
					//	This pane is inside a containing pane.
					//
		//			commonSplitVert ( element[0].clientWidth, null, '<div>Another Pane!</div>', 'left' );
					commonSplitVert ( element[0].clientWidth, null, 'left' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the parent pane.
								  scope.$id );				//	It only needs a scope Id.
				}

				//	Now the left or right panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );		
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

			}	//	scope.splitVert()


		//	scope.dropLeft = function ( dropHTML ) {
			scope.dropLeft = function ( sourceElement ) {

		//		var ep = element.parent(), orgHTML = element[0].innerHTML;
				var ep = element.parent();

				if ( ep.children().length === 1 ) {		//	Currently, just one pane in this frame?

		//			commonSplitVert ( ep[0].clientWidth, dropHTML, orgHTML, 'right' );
					commonSplitVert ( ep[0].clientWidth, sourceElement, 'right' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {

		//			commonSplitVert ( element[0].clientWidth, dropHTML, orgHTML, 'right' );
					commonSplitVert ( element[0].clientWidth, sourceElement, 'right' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the parent pane.
								  scope.$id );				//	It only needs a scope Id.
				}

				//	Now the left or right panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );		
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

				scope.$emit ( 'PanelessDragDrop', 'dropped' );	//	Notify the mother pane.

			}	//	scope.dropLeft()


	//		scope.dropTop = function ( dropHTML ) {
			scope.dropTop = function ( sourceElement ) {

	//			var ep = element.parent(), orgHTML = element[0].innerHTML;
				var ep = element.parent();

				if ( ep.children().length === 1 ) {

	//				commonSplitHorz ( ep[0].clientHeight, dropHTML, orgHTML, 'bottom' );
					commonSplitHorz ( ep[0].clientHeight, 
									  sourceElement,	//	From where to get the contents of the new pane.
														//	If null then make something up.
									  'bottom' );		//	Which pane is maintained from the original.

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {

	//				commonSplitHorz ( element[0].clientHeight, dropHTML, orgHTML, 'bottom' );
					commonSplitHorz ( element[0].clientHeight, sourceElement, 'bottom' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the parent pane.
								  scope.$id );				//	It only needs a scope Id.
				}

				//	Now the top or bottom panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );		
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

				scope.$emit ( 'PanelessDragDrop', 'dropped' );	//	Notify the mother pane.

			}	//	scope.dropTop()


		//	scope.dropRight = function ( dropHTML ) {
			scope.dropRight = function ( sourceElement ) {

		//		var ep = element.parent(), orgHTML = element[0].innerHTML;
				var ep = element.parent();

				if ( ep.children().length === 1 ) {		//	Currently, just one pane in this frame?

		//			commonSplitVert ( ep[0].clientWidth, orgHTML, dropHTML, 'left' );
					commonSplitVert ( ep[0].clientWidth, sourceElement, 'left' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {

		//			commonSplitVert ( element[0].clientWidth, orgHTML, dropHTML, 'left' );
					commonSplitVert ( element[0].clientWidth, sourceElement, 'left' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the parent pane.
								  scope.$id );				//	It only needs a scope Id.
				}

				//	Now the left or right panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );		
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

				scope.$emit ( 'PanelessDragDrop', 'dropped' );	//	Notify the mother pane.

			}	//	scope.dropRight()


		//	scope.dropBottom = function ( dropHTML ) {
			scope.dropBottom = function ( sourceElement ) {

		//		var ep = element.parent(), orgHTML = element[0].innerHTML;
				var ep = element.parent();

				if ( ep.children().length === 1 ) {

		//			commonSplitHorz ( ep[0].clientHeight, orgHTML, dropHTML, 'top' );
					commonSplitHorz ( ep[0].clientHeight, sourceElement, 'top' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the frame.  
								  element, scope );			//	Top pane in the frame.
				} else {

		//			commonSplitHorz ( element[0].clientHeight, orgHTML, dropHTML, 'top' );
					commonSplitHorz ( element[0].clientHeight, sourceElement, 'top' );

					scope.$emit ( 'PanelessSplit', 			//	Notify the parent pane.
								  scope.$id );				//	It only needs a scope Id.
				}

				//	Now the top or bottom panes we just created might be split in the future.  If so then
				//	they will need to notify this pane so this pane can propagate a resize to them.
				//
				scope.$on ( 'PanelessSplit', panelessSplit );
				scope.$on ( 'PanelessUnSplit', panelessUnSplit );

				scope.$emit ( 'PanelessDragDrop', 'dropped' );	//	Notify the mother pane.

			}	//	scope.dropBottom()


			function panelessSplit ( evt, scopeId ) {

				evt.stopPropagation();

				console.log ( 'paneless-pane: panelessSplit()  bSplitHorz ' + p.bSplitHorz + '    bSplitVert ' + p.bSplitVert );
				console.log ( 'paneless-pane: panelessSplit()  top ' + p.topPaneSplit + '   bot ' + p.botPaneSplit + '   lft ' + p.lftPaneSplit + '   rgt ' + p.rgtPaneSplit );

				if ( p.bSplitHorz ) {
					if ( scopeId === angular.element ( topPane ).scope().$id )  {
						p.topPaneSplit = true;
						console.log ( 'paneless-pane: panelessSplit()  top ' + p.topPaneSplit );
					}
					if ( scopeId === angular.element ( botPane ).scope().$id )  {
						p.botPaneSplit = true;
						console.log ( 'paneless-pane: panelessSplit()  bot ' + p.botPaneSplit );
					}
				}
				if ( p.bSplitVert ) {
					if ( scopeId === angular.element ( lftPane ).scope().$id )  {
						p.lftPaneSplit = true;
						console.log ( 'paneless-pane: panelessSplit()  lft ' + p.lftPaneSplit );
					}
					if ( scopeId === angular.element ( rgtPane ).scope().$id )  {
						p.rgtPaneSplit = true;
						console.log ( 'paneless-pane: panelessSplit()  rgt ' + p.rgtPaneSplit );
					}
				}
			}	//	panelessSplit()


			function panelessUnSplit ( evt ) {

				evt.stopPropagation();

				console.log ( 'paneless-pane: panelessUnSplit()  bSplitHorz ' + p.bSplitHorz + '    bSplitVert ' + p.bSplitVert );
				console.log ( 'paneless-pane: panelessUnSplit()  top ' + p.topPaneSplit + '   bot ' + p.botPaneSplit + '   lft ' + p.lftPaneSplit + '   rgt ' + p.rgtPaneSplit );

				if ( p.bSplitHorz ) {
					p.topPaneSplit = false;
					console.log ( 'paneless-pane: panelessUnSplit()  top ' + p.topPaneSplit );
					p.botPaneSplit = false;
					console.log ( 'paneless-pane: panelessUnSplit()  bot ' + p.botPaneSplit );
				}
				if ( p.bSplitVert ) {
					p.lftPaneSplit = false;
					console.log ( 'paneless-pane: panelessUnSplit()  lft ' + p.lftPaneSplit );
					p.rgtPaneSplit = false;
					console.log ( 'paneless-pane: panelessUnSplit()  rgt ' + p.rgtPaneSplit );
				}
			}	//	panelessUnSplit()


			element.on ( "contextmenu", function ( evt ) {
                
				var ms, menu;

				evt.preventDefault();
				evt.stopPropagation();

				scope.menuX = evt.pageX - element[0].offsetLeft;
				scope.menuY = evt.pageY - element[0].offsetTop;
				scope.menuCtx = '';
				scope.menuElement = element;

				if ( attrs.panelessDocked !== undefined ) {
					scope.menuCtx = "docked";
				}

				ms = [ evt.pageX, evt.pageY ];
				
				menu = $compile ( '<paneless-menu></paneless-nenu>' ) ( scope );

				menu[0].style.left     = "" + ms[0] + "px";
				menu[0].style.top      = "" + ms[1] + "px";
				menu[0].style.overflow = "visible";

				//	Have the mother pane append the menu to the end of its child elements
				//	so the menu will be on top of all.
				scope.$emit ( 'PanelessContextMenu', menu );
			
			} );	//	element.on ( "contextmenu", ... 


			scope.sizePaneOrg = function() {

				p.orgW = element[0].clientWidth;
				p.orgH = element[0].clientHeight;

				console.log ( 'sizePaneOrg():  orgW ' + p.orgW + '  orgH ' + p.orgH );

				if ( p.bSplitHorz ) {
					p.topSzR = parseFloat ( topPane.style.height ) / (p.orgH - midH);
					p.botSzR = parseFloat ( botPane.style.height ) / (p.orgH - midH);
				}
				if ( p.bSplitVert ) {
					p.lftSzR = parseFloat ( lftPane.style.width ) / (p.orgW - midW);
					p.rgtSzR = parseFloat ( rgtPane.style.width ) / (p.orgW - midW);
				}

				if ( p.topPaneSplit ) {
					angular.element ( topPane ).scope().sizePaneOrg();
				}
				if ( p.botPaneSplit ) {
					angular.element ( botPane ).scope().sizePaneOrg();
				}
				if ( p.lftPaneSplit ) {
					angular.element ( lftPane ).scope().sizePaneOrg();
				}
				if ( p.rgtPaneSplit ) {
					angular.element ( rgtPane ).scope().sizePaneOrg();
				}

			};	//	scope.sizePaneOrg()


			scope.sizePane = function ( w, h ) {
				var dx, dy;

				scope.sizeChanged ( w, h );

				dx = w - p.orgW;
				dy = h - p.orgH;

				if ( p.bSplitHorz ) {
					//	Grow/shrink the contained panes proportionately to the size of this
					//	pane when the sizing started.  The larger the relative size the 
					//	more its size will change.
					//
					//	Note that changing the size of the pane above the splitter will 
					//	automatically move the splitter.

			//		console.log ( 'sizePane():  horz  w ' + w + '  h ' + h );

					h = Math.round ( ((p.orgH - midH) + dy) * p.topSzR );
					topPane.style.height = h + 'px';
					if ( p.topPaneSplit ) {
						angular.element ( topPane ).scope().sizePane ( w, h );
					} else {
						angular.element ( topPane ).scope().sizeChanged();
					}
					h = Math.round ( ((p.orgH - midH) + dy) * p.botSzR );
					botPane.style.height = h + 'px';
					if ( p.botPaneSplit ) {
						angular.element ( botPane ).scope().sizePane ( w, h );
					} else {
						angular.element ( botPane ).scope().sizeChanged();
					}
				}

				if ( p.bSplitVert ) {
			//		console.log ( 'sizePane():  vert  w ' + w + '  h ' + h );

					w = Math.round ( ((p.orgW - midW) + dx) * p.lftSzR );
					lftPane.style.width = w + 'px';
					if ( p.lftPaneSplit ) {
						angular.element ( lftPane ).scope().sizePane ( w, h );
					} else {
						angular.element ( lftPane ).scope().sizeChanged();
					}

					midPane.style.left  = w + 'px';

					rgtPane.style.left  = (w + midW) + 'px';

					w = Math.round ( ((p.orgW - midW) + dx) * p.rgtSzR );
					rgtPane.style.width = w + 'px';
					if ( p.rgtPaneSplit ) {
						angular.element ( rgtPane ).scope().sizePane ( w, h );
					} else {
						angular.element ( rgtPane ).scope().sizeChanged();
					}
				}

			}	//	scope.sizePane()


			scope.sizeChanged = function ( w, h ) {
				var i;

				if ( cmEdit ) {
					cmEdit.refresh();
				}

				for ( i = 0; i < sizeChangeNotifyees.length; i += 1 ) {
					sizeChangeNotifyees[i] ( w, h );
				}	//	for ( i ...				

			}	//	scope.sizeChanged()


			scope.describeDragTargets = function ( offsX, offsY, dragElement ) {

				var x, y, w, h, newHTML, t = null;

				if ( p.bSplitHorz ) {
					t = { top: null, bot: null };
					x = offsX + topPane.offsetLeft;
					y = offsY + topPane.offsetTop;
					t.top = angular.element ( topPane ).scope().describeDragTargets ( x, y, dragElement );
			//		if ( botPane[0] === dragElement[0] ) {
			//			t.top.drageeIsBelow = true;
			//		}
					x = offsX + botPane.offsetLeft;
					y = offsY + botPane.offsetTop;
					t.bot = angular.element ( botPane ).scope().describeDragTargets ( x, y, dragElement );
			//		if ( topPane[0] === dragElement[0] ) {
			//			t.bot.drageeIsAbove = true;
			//		}
				} else
				if ( p.bSplitVert ) {
					t = { lft: null, rgt: null };
					x = offsX + lftPane.offsetLeft;
					y = offsY + lftPane.offsetTop;
					t.lft = angular.element ( lftPane ).scope().describeDragTargets ( x, y, dragElement );
					x = offsX + rgtPane.offsetLeft;
					y = offsY + rgtPane.offsetTop;
					t.rgt = angular.element ( rgtPane ).scope().describeDragTargets ( x, y, dragElement );
				} else {

					if ( element === dragElement ) {
						return null;
					}

					w = element[0].offsetWidth  - 16;
					h = element[0].offsetHeight - 16;

					t = { l: offsX + 8, t: offsY + 8, w: w, h: h, s: scope };
				}

				return t;

			}	//	scope.describeDragTargets()


			scope.overDragTarget = function() {
				console.log ( 'paneless-pane overDragTarget()' );
			}	//	scope.overDragTarget()

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,			//	Each pane and splitter gets its own scope.
            link:		link
        }

    }	//	panelessPaneDirective

})();

