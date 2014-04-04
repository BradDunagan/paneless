
//  lib/paneless-mover.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessMover';

    angular.module('app').directive ( directiveId, ['$document', panelessMoverDirective] );

    function panelessMoverDirective ( $document ) {

        function link ( scope, element, attrs ) {

			var thisScope = scope;

			element.append (	'<svg   stroke-width="1" stroke="gray">'

									//	Horiz arrow shaft.
							 +		'<line x1="0.5" y1="7.5" x2="14.5" y2="7.5"/>'

						//			//	Horiz arrow heads.
						//	 +		'<polygon points=" 0.5,7.5  3.5,4.5  3.5,10.5" fill="gray"/>'
						//	 +		'<polygon points="14.5,7.5 11.5,4.5 11.5,10.5" fill="gray"/>'
									//	Horiz arrow heads (smaller).
							 +		'<polygon points=" 0.5,7.5  2.5,5.5  2.5,9.5" fill="gray"/>'
							 +		'<polygon points="14.5,7.5 12.5,5.5 12.5,9.5" fill="gray"/>'

									//	Vert arrow shaft.
							 +		'<line x1="7.5" y1="0.5" x2="7.5" y2="14.5"/>'

						//			//	Vert arrow heads.
						//	 +		'<polygon points="7.5, 0.5  4.5, 3.5  10.5, 3.5" fill="gray"/>'
						//	 +		'<polygon points="7.5,14.5  4.5,11.5  10.5,11.5" fill="gray"/>'
									//	Vert arrow heads (smaller).
							 +		'<polygon points="7.5, 0.5  5.5, 2.5  9.5, 2.5" fill="gray"/>'
							 +		'<polygon points="7.5,14.5  5.5,12.5  9.5,12.5" fill="gray"/>'
							 +	'</svg>' );
		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessMoverDirective

})();

