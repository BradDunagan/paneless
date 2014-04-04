
//  lib/paneless-sizer.js

(function () { 
    'use strict';
    
    var directiveId = 'panelessSizer';

    angular.module('app').directive ( directiveId, ['$document', panelessSizerDirective] );

    function panelessSizerDirective ( $document ) {

        function link ( scope, element, attrs ) {

			element.append (	'<svg   stroke-width="1" stroke="gray">'	//	shape-rendering="crispEdges">'
						//	 +		'<clipPath id="CP">'
						//	 +			'<rect x="0" y="0" width="14" height="14"/>'
						//	 +		'</clipPath>'
						//	 +		'<line x1="1" y1="1" x2="13" y2="13" stroke-width="1" stroke="black" clip-path="url(#CP)"/>'

									//	Arrow shaft.
							 +		'<line x1="1.5" y1="1.5" x2="13.5" y2="13.5"/>'

									//	Arrow heads.
						//	 +		'<line x1="2" y1="2" x2="6" y2="2"/>'
						//	 +		'<line x1="2" y1="2" x2="2" y2="6"/>'
						//	 +		'<line x1="13" y1="13" x2="9" y2="13"/>'
						//	 +		'<line x1="13" y1="13" x2="13" y2="9"/>'
							 +		'<polygon points=" 1.5, 1.5  4.5, 1.5  1.5, 4.5" fill="gray"/>'
							 +		'<polygon points="13.5,13.5 10.5,13.5 13.5,10.5" fill="gray"/>'
							 +	'</svg>' );
		}	//	link()

        return {
            restrict:	'E',
            link:		link
        }

    }	//	panelessSizerDirective

})();

