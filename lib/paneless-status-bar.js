
//  lib/paneless-status-bar.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessStatusBar';

    angular.module('app').directive ( directiveId, ['$document', panelessStatusBarDirective] );

    function panelessStatusBarDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessStatusBarDirective

})();

