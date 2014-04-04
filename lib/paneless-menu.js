
//	lib/paneless-menu.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessMenu';

    angular.module('app').directive ( directiveId, ['$document', panelessMenuDirective] );

    function panelessMenuDirective ( $document ) {

        function link ( scope, element, attrs ) {

		//	var parent = element.parent();
		
		//	element.append (   '<ul> '
		//					 + '    <li><span>Split Horizontally</span></li> '
		//					 + '    <li><span>Split Vertically</span></li> '
		//					 + '</ul> ' );

		//	var menuItemSplitHorz = element.append (   '<div>Split Horizontally</div> ' );
		//	var menuItemSplitVert = element.append (   '<div>Split Vertically</div> ' );

			if ( scope.menuCtx && (scope.menuCtx === 'mother') ) {
			//	element.append (   '<div>Add Pane</div> ' );
				element.append (   '<div>New Command Record Editor</div> ' );
				element.append (   '<div class="paneless-menu-divider"></div>' );
				element.append (   '<div>New Frame with Tabs</div> ' );
				element.append (   '<div>New Frame</div> ' );
			} else 
		//	if ( scope.menuCtx && (scope.menuCtx === 'client') ) {
		//
		//		element.append (   '<div>Drag</div> ' );
		//		element.append (   '<div>Drag Copy</div> ' );
		//	} else 
			{
				
				if ( scope.menuCtx && (scope.menuCtx === 'docked') ) {
					element.append (   '<div>Float</div> ' );
					element.append (   '&nbsp---------------------' );
				}

				element.append (   '<div>Drag</div> ' 
								 + '<div>Drag Copy</div> ' );
				element.append (   '<div class="paneless-menu-divider"></div>' );
				element.append (   '<div>Split Horizontally</div> '
								 + '<div>Split Vertically</div> ' );
				element.append (   '<div class="paneless-menu-divider"></div>' );
				element.append (   '<div>Bring to Front</div> '
								 + '<div>Send to Back</div> ' );
			}

			element.children().on ( 'click', itemClick );

			function endMenu() {
				if ( scope.menuX ) delete ( scope.menuX );
				if ( scope.menuY ) delete ( scope.menuY );
				if ( scope.menuCtx ) delete ( scope.menuCtx );
				element.remove();
				$document.unbind ( 'mousedown', mousedown );
			}	//	endMenu()

			function itemClick ( evt ) {
				var x = scope.menuX, y = scope.menuY;

				evt.preventDefault();
				evt.stopPropagation();

				console.log ( 'menuItemSplitHorz: Yea baby. ' + this.textContent );

				endMenu();

				if ( this.textContent === 'New Command Record Editor' ) {
					scope.addFrame ( x, y, 'CmdRec' );
				} else 
				if ( this.textContent === 'New Frame with Tabs' ) {
					scope.addTabs ( x, y );
				} else 
				if ( this.textContent === 'New Frame' ) {
					scope.addFrame ( x, y );
				} else 
				if ( this.textContent === 'Add Pane' ) {
					scope.addPane ( x, y );
				} else 
				if ( this.textContent === 'Float' ) {
					scope.floatPane();
				} else 
				if ( this.textContent === 'Drag' ) {
					scope.$emit ( 'PanelessDrag', scope.menuElement );
				} else 
				if ( this.textContent === 'Split Horizontally' ) {
					scope.splitHorz();
				} else 
				if ( this.textContent === 'Split Vertically' ) {
					scope.splitVert();
				} else 
				if ( this.textContent === 'Bring to Front' ) {
					scope.$emit ( 'PanelessBringToFront' );
				} else 
				if ( this.textContent === 'Send to Back' ) {
					scope.$emit ( 'PanelessSendToBack' );
				}
				
			}	//	itemClick()

			element.on ( 'mousedown', function ( evt ) {

				evt.stopPropagation();

				console.log ( "menu/element mousedown" );

			} );	//	horz click

			$document.on ( 'mousedown', mousedown );

			function mousedown ( evt ) {

				evt.preventDefault();
				evt.stopPropagation();

				console.log ( 'menu/document  mousedown()' );


				endMenu();

			}	//	mousedown()



		}	//	link()

        return {
            restrict: 'E',

            link: link
        }

    }	//	panelessMenuDirective

})();

