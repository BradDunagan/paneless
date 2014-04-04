
//  lib/paneless-client.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessClient';

    angular.module('app').directive ( directiveId, ['$document', '$compile', panelessClientDirective] );

    function panelessClientDirective ( $document, $compile ) {

        function link ( scope, element, attrs ) {

			element.on ( "contextmenu", function ( evt ) {
                
				var ms, menu;

				evt.preventDefault();
				evt.stopPropagation();

				scope.menuX = evt.pageX - element[0].offsetLeft;
				scope.menuY = evt.pageY - element[0].offsetTop;
				scope.menuCtx = 'client';

				ms = [ evt.pageX, evt.pageY ];
				
				menu = $compile ( '<paneless-menu></paneless-nenu>' ) ( scope );

				menu[0].style.left     = "" + ms[0] + "px";
				menu[0].style.top      = "" + ms[1] + "px";
				menu[0].style.overflow = "visible";

			//	element.append ( menu );
				scope.$emit ( 'PanelessContextMenu', menu );
			});

		}	//	link()

        return {
            restrict:	'E',

            link:		link
        }

    }	//	panelessClientDirective

})();

