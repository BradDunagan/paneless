
//	lib/paneless-drag-source.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessDragSource';

    angular.module('app').directive ( directiveId, ['$document', panelessDragSourceDirective] );

    function panelessDragSourceDirective ( $document ) {

        function link ( scope, element, attrs ) {


		}	//	link()

        return {
            restrict:	'E',

            link:		link
        }

    }	//	panelessDragSourceDirective

})();

