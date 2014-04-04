
//  lib/paneless-status.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessStatus';

    angular.module('app').directive ( directiveId, ['$document', panelessStatusDirective] );

    function panelessStatusDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessStatusDirective

})();

