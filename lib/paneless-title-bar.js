
//  lib/paneless-title-bar.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessTitleBar';

    angular.module('app').directive ( directiveId, ['$document', panelessTitleBarDirective] );

    function panelessTitleBarDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessTitleBarDirective

})();

