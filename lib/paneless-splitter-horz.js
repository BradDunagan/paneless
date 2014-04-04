
//	lib/paneless-splitter-horz.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessSplitterHorz';

    angular.module('app').directive ( directiveId, ['$document', panelessSplitterHorzDirective] );

    function panelessSplitterHorzDirective ( $document ) {

        function link ( scope, element, attrs ) {

	        var startX = 0, startY = 0, hAboveOrg, hAboveMax, hBelowOrg;

			var parent    = null;
			var paneAbove = null;
			var paneBelow = null;

			element.on ( 'mousedown', function ( evt ) {

				evt.preventDefault();
				evt.stopPropagation();

				if ( (hAboveOrg === undefined) || (hAboveMax === undefined) || (hBelowOrg === undefined) ) {
					parent    = element.parent();
					paneAbove = parent.children()[0];
					paneBelow = parent.children()[2];
				}

				hAboveOrg = parseInt ( paneAbove.style.height );
				hAboveMax = parent[0].clientHeight - element[0].clientHeight - 2;
				angular.element ( paneAbove ).scope().sizePaneOrg();

				hBelowOrg = parseInt ( paneBelow.style.height );
				angular.element ( paneBelow ).scope().sizePaneOrg();

				console.log ( 'hAboveOrg ' + hAboveOrg + '   hAboveMax ' + hAboveMax + '   hBelowOrg ' + hBelowOrg );

				startX = evt.pageX;	// - x;
				startY = evt.pageY;	// - y;

				console.log ( 'startY ' + startY );

				$document.on ( 'mousemove', mousemove );
				$document.on ( 'mouseup', mouseup );

			} );	//	element.on ( 'mousedown', ...

 
			function mousemove ( evt ) {

				var dy, hAbove, hBelow;

				evt.preventDefault();
				evt.stopPropagation();

				dy = evt.pageY - startY;

				hAbove = hAboveOrg + dy;

				if ( hAbove < 0 ) {
					hAbove = 0;
				} else
				if ( hAbove > hAboveMax ) {
					hAbove = hAboveMax;
				}

				hBelow = hBelowOrg - (hAbove - hAboveOrg);

		//		console.log ( 'mousemove() dy ' + dy + '   hAbove ' + hAbove + '   hBelow ' + hBelow );

				paneAbove.style.height = hAbove + 'px';
				angular.element ( paneAbove ).scope().sizePane ( element.offsetWidth, hAbove );

				paneBelow.style.height = hBelow + 'px';
				angular.element ( paneBelow ).scope().sizePane ( element.offsetWidth, hBelow );

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

    }	//	panelessSplitterHorzDirective

})();

