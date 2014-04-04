
//  lib/paneless-tab.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessTab';

    angular.module('app').directive ( directiveId, [panelessTabDirective] );

    function panelessTabDirective ( ) {

        function link ( scope, element, attrs ) {

			var name = attrs.panelessTabName ? attrs.panelessTabName : '';

			element.append ( '<div>' + name + '</div>' );

			element.on ( 'click', scope.tabClick );

		}	//	link()

        return {
            restrict:	'E',

            link:		link
        }

    }	//	panelessTabDirective

})();

