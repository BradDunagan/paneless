
//  lib/paneless-title.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessTitle';

    angular.module('app').directive ( directiveId, ['$document', panelessTitleDirective] );

    function panelessTitleDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessTitleDirective

})();

