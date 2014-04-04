
//	lib/paneless-splitter-vert.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessSplitterVert';

    angular.module('app').directive ( directiveId, ['$document', panelessSplitterVertDirective] );

    function panelessSplitterVertDirective ( $document ) {

        function link ( scope, element, attrs ) {

	        var startX = 0, startY = 0, wLeftOrg, wLeftMax, wSplitter, wRigthOrg;

			var parent    = null;
			var paneLeft  = null;
			var splitter  = null;
			var paneRight = null;

			element.on ( 'mousedown', function ( evt ) {

				evt.preventDefault();
				evt.stopPropagation();

				if ( (wLeftOrg === undefined) || (wLeftMax === undefined) || (wRigthOrg === undefined) ) {
					parent    = element.parent();
					paneLeft  = parent.children()[0];
					splitter  = parent.children()[1];
					paneRight = parent.children()[2];
				}
				
				wLeftOrg  = parseInt ( paneLeft.style.width );
				wLeftMax  = parent[0].clientWidth - element[0].clientWidth - 2;
				angular.element ( paneLeft ).scope().sizePaneOrg();

				wSplitter = splitter.offsetWidth;

				wRigthOrg = parseInt ( paneRight.style.width );
				angular.element ( paneRight ).scope().sizePaneOrg();

				console.log ( 'wLeftOrg ' + wLeftOrg + '   wLeftMax ' + wLeftMax + '   wRigthOrg ' + wRigthOrg );

				startX = evt.pageX;
				startY = evt.pageY;

				console.log ( 'startX ' + startX );

				$document.on ( 'mousemove', mousemove );
				$document.on ( 'mouseup', mouseup );

			} );	//	element.on ( 'mousedown', ...
 

			function mousemove ( evt ) {

				var dx, wLeft, wRight;

				evt.preventDefault();
				evt.stopPropagation();

				dx = evt.pageX - startX;

				wLeft = wLeftOrg + dx;

				if ( wLeft < 0 ) {
					wLeft = 0;
				} else
				if ( wLeft > wLeftMax ) {
					wLeft = wLeftMax;
				}

				wRight = wRigthOrg - (wLeft - wLeftOrg);

		//		console.log ( 'mousemove() dx ' + dx + '   wLeft ' + wLeft + '   wRight ' + wRight );

				paneLeft.style.width  = wLeft  + 'px';
				angular.element ( paneLeft ).scope().sizePane ( wLeft, element.offsetHeight );

				splitter.style.left   = wLeft  + 'px';

				paneRight.style.left  = wLeft  + wSplitter + 'px';
				paneRight.style.width = wRight + 'px';
				angular.element ( paneRight ).scope().sizePane ( wRight, element.offsetHeight );

			}	//	mousemove()
 

			function mouseup ( evt ) {

				evt.preventDefault();
				evt.stopPropagation();

				parent.scope().sizePaneOrg();			//	For persistence.

				$document.unbind ( 'mousemove', mousemove );
				$document.unbind ( 'mouseup', mouseup );

			}	//	mouseup()

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,			//	Each pane and splitter gets its own scope.
            link:		link
        }

    }	//	panelessSplitterVertDirective

})();

