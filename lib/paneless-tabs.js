
//  lib/paneless-tabs.js

(function () { 

    'use strict';
    
    var directiveId = 'panelessTabs';

    angular.module('app').directive ( directiveId, ['$compile', panelessTabsDirective] );

    function panelessTabsDirective ( $compile ) {

        function link ( scope, element, attrs ) {

			var	html, contents;

			//	Indices of the tab elements.  Keeps track of which tab is painted at the 
			//	far left, which is next to the right, and so on to the far right.
			//
			//	For example, if there are 3 tabs then there are 6 elements (counting the 
			//	panes that show the contents of each tab, see below).  The active tab is
			//	always placed as the last child element, the panes before it and the other
			//	tabs before the panes.  If the active tab is the middle tab (visually) 
			//	then tabsL2R[1] === 5.
			//
			//	Update -
			//
			//	Each item in the tabsL2R array is an object -
			//	
			//		 { name: '<name on tab>,
			//		   iC:   <child idx of element.children()> }
			//
			//	When a tab  is selected, for example, the group of tabs and the order
			//	(from left to right) that they  * appear *  does not change  but their 
			//	order in the DOM does change and therefore the ie value of the objects
			//	in this array is updated.
			//
			//	On the other hand, if a tab is moved or if a tab is dragged/dropped then 
			//	the location of the tab in this array might change as well.
			//
			var tabsL2R = [];


			function logL2R() {
				var s = '', c, i, ie;

				c = element.children();

				for ( i = 0; i < tabsL2R.length; i += 1 ) {
					ie = tabsL2R[i].iC;

					if ( ie >= c.length ) {
						s += '(error at tabsL2R[' + i + ']: ' + ie + ' >= c.length)   ';
						continue;
					}

					if ( ie === (c.length - 1) ) {
						s += '[' + i + ']: ' + ie + ' selected   ';
						continue;
					}

					if ( ie >= ((c.length / 2) - 1) ) {
						s += '(error at tabsL2R[' + i + ']: ' + ie + ' beyond unselected)   ';
						continue;
					}

					s += '[' + i + ']: ' + ie + ' ' + c[ie].getAttribute ( 'paneless-tab-name' ) + '   ';
				}

				console.log ( 'logL2R(): ' + s );

			}	//	logL2R()


			function fixL2R() {
				var c, i, name, j;

				c = element.children();

				for ( i = 0; i < c.length; i += 1 ) {

					if ( c[i].tagName.toLowerCase() !== 'paneless-tab' )  continue;

					name = c[i].getAttribute ( 'paneless-tab-name' );

					if ( ! name )  continue;			//	For now.  This is an error.  FIX

					for ( j = 0; j < tabsL2R.length; j++ ) {
						if ( tabsL2R[j].name === name ) {
							tabsL2R[j].iC = i;
							break;
						}
					}
				}	//	for ( i )

			}	//	fixL2R()


			scope.tabClick = function() {
				var c, ic, cIC, cL1, ta, ps, ipSel, ipCur, isL2R, icL2R, i;

				console.log ( 'tabClick()' + this );

				c = element.children();

				for ( ic = 0; ic < c.length; ic += 1 ) {
					if ( c[ic] === this )  break;
				}

				if ( ic >= c.length ) {				//	Not sane?
					return;
				}

				console.log ( 'tabClick()  ic ' + ic );

				if ( ic === c.length - 1 ) {
					console.log ( 'tabClick()  tab is the current active tab' );
					return;
				}

				if ( ic === c.length - 2 ) {
					console.log ( 'tabClick()  Clicked on the pane?' );
					return;
				}

				//	Clone c[ic] and c[c.length - 1] and remove them.
				//
				//	Hide the tab's pane (set its css visible to 'hidden').
				//
				//	Prepend c[c.length - 1] to the element.
				//
				//	Append c[ic] to the element.
				//
				//	Fix tabsL2R[].
				//
				//	Show the pane associated with the selected and now active tab.

				//	Clone the tabs.
				cIC = c[ic].cloneNode();			cIC.innerHTML = c[ic].innerHTML;			//	Selected
				cL1 = c[c.length-1].cloneNode();	cL1.innerHTML = c[c.length-1].innerHTML;	//	Current

				//	Find the panes of the selected and current tabs.
				ta = cIC.getAttribute ( 'paneless-tabs-attr' );
				ps = element[0].getElementsByTagName ( 'paneless-pane' );
				for ( ipSel = 0; ipSel < ps.length; ipSel += 1 ) {
					if ( ps[ipSel].getAttribute ( 'paneless-tabs-attr' ) === ta )  break;
				}
				if ( ipSel >= ps.length ) {
					console.log ( 'tabClick()  Failed to find pane of selected tab.' );
					return;
				}
				ta = cL1.getAttribute ( 'paneless-tabs-attr' );
				for ( ipCur = 0; ipCur < ps.length; ipCur += 1 ) {
					if ( ps[ipCur].getAttribute ( 'paneless-tabs-attr' ) === ta )  break;
				}
				if ( ipCur >= ps.length ) {
					console.log ( 'tabClick()  Failed to find pane of current tab.' );
					return;
				}


				//	Selected and Current tab's L2R indices.
				for ( isL2R = 0; isL2R < tabsL2R.length; isL2R += 1 ) {
					if ( tabsL2R[isL2R].iC === ic )  break;
				}
				if ( isL2R >= tabsL2R.length ) {
					console.log ( 'tabClick()  Failed to find selected tab\'s L2R index.' );
					return;
				}
				for ( icL2R = 0; icL2R < tabsL2R.length; icL2R += 1 ) {
					if ( tabsL2R[icL2R].iC === (c.length - 1) )  break;
				}
				if ( icL2R >= tabsL2R.length ) {
					console.log ( 'tabClick()  Failed to find current tab\'s L2R index.' );
					return;
				}

			//	tabsL2R[isL2R] = c.length - 1;
			//	tabsL2R[icL2R] = 0;
			//
			//	for ( i = 1; i < isL2R; i += 1 ) {
			//		tabsL2R[i] += 1;
			//	}

				c[c.length - 1].remove();
				c[ic].remove();

				cL1.style.color = 'gray';
				element.prepend ( $compile ( cL1 ) ( scope ) );
				cIC.style.color = 'black';
				element.append ( $compile ( cIC ) ( scope ) );

				//	Finally, show the selected pane.
				ps[ipCur].style.visibility = 'hidden';
				ps[ipSel].style.visibility = 'visible';

				fixL2R();

				logL2R();

			}	//	scope.tabClick()


			//	Tab elements are positioned along the bottom of the parent pane.
			//
			//	Associated with each tab element is another pane that is the container of
			//	app-specfied contents of the tab.
			//
			//		This pane is an element contained by the tab element?
			//
			//	Do this -
			//
			//		Use just one container pane for each tab.  Its contents change as the selected
			//		tab changes.
			//
			//		Position that pane at the top lef, 100% width.  Its height is not 100% but
			//		instead it leaves room at the bottom for the tabs.  It has a bottom border.
			//
			//		The selected tab is painted last so that it obscures the pane border.  The other
			//		tabs are painted before the pane so that the pane bottom border obscures them.
			//
			//	To start, just one tab element.

		//	html =	'<paneless-pane style="width: 100%; height: 60px; border-bottom: 1px solid gray;"></paneless-pane>'
		//		  +	'<paneless-tab></paneless-tab>';

			tabsL2R = [ { name: 'Tab 1', iC: 0 },		//	Start with tree tabs.  The child indices
						{ name: 'Tab 2', iC: 0 },		//	are corrected after the tabs are set in the 
						{ name: 'Tab 3', iC: 0 } ];		//	DOM.

			//	Just one tab pane is visible at any time.
			//
			//	All the tabs are always visible.
			//
			//	Z wise, the selected tab is on top, then the panes (only one of which is visible),
			//	then the other tabs.
			//
			//	When a tab is selected -
			//
			//		The current tab element in the DOM is moved to the bottom of Z.  Its pane is hidden.
			//
			//		The newly selected tab is moved to the top.  Its pane is made visible.
			//
			//		The order in which the tabs * appear *, left to right, does not change.

			html =	'<paneless-tab paneless-tabs-attr="tab1" paneless-tab-name="' + tabsL2R[1].name + '"></paneless-tab>'
				  +	'<paneless-tab paneless-tabs-attr="tab2" paneless-tab-name="' + tabsL2R[2].name + '"></paneless-tab>'
				  +	'<paneless-pane paneless-tabs-attr="tab1" style="visibility: hidden; width: 100%; height: 0px; border-bottom: 1px solid gray;">'
				  +		'<div>Pane of ' + tabsL2R[1].name + '.</div>'
				  + '</paneless-pane>'
				  +	'<paneless-pane paneless-tabs-attr="tab2" style="visibility: hidden; width: 100%; height: 0px; border-bottom: 1px solid gray;">'
				  +		'<div>Pane of ' + tabsL2R[2].name + '.</div>'
				  + '</paneless-pane>'
				  +	'<paneless-pane paneless-tabs-attr="tab3" style="visibility: visible; width: 100%; height: 0px; border-bottom: 1px solid gray;">'
				  +		'<div>Pane of ' + tabsL2R[0].name + '.</div>'
				  + '</paneless-pane>'
				  +	'<paneless-tab paneless-tabs-attr="tab3" paneless-tab-name="' + tabsL2R[0].name + '"></paneless-tab>';

			contents = $compile ( html ) ( scope );

			element.append ( contents );

			fixL2R();

			logL2R();

			scope.init = function() {
				var parent, c, i;

				parent = element.parent();

				if ( parent ) {
					parent.scope().onSizeChange ( parentSizeChange );
				}

				c = element.children();

			//	tabsL2R[0] = c.length - 1;			//	Make the active tab the left most.
			//
			//	for ( i = 0; i < c.length - 2; i++ ) {
			//		if ( c[i].tagName.toLowerCase() !== 'paneless-tab' )  break;
			//		tabsL2R[i + 1] = i;
			//	}

				parentSizeChange ( parent[0].clientWidth, parent[0].clientHeight );

			}	//	scope.init()


			function parentSizeChange ( w, h ) {

				//	If the parent size shrinks too quickly scroll bars appear.
				//
				//	So here we first shrink enough to hide possible scroll bars.

				var w2 = w - 16, h2 = h - 16;

				if ( w2 < 0 )  w2 = 0;
				if ( h2 < 0 )  h2 = 0;

				setSize ( w2, h2 );

				//	Then set to the specified size.  (Maybe I will figure out how to 
				//	do this properly later.)

				setSize ( w, h );
				
			}	//	parentSizeChange()


			function setSize ( w, h ) {
				var c, pane, tab, yT, wT, x, i, j;

				var ts = element[0].getElementsByTagName ( 'paneless-tab' );			//	tabs
				var ps = element[0].getElementsByTagName ( 'paneless-pane' );		//	panes

				c    = element.children();
				pane = element.find ( 'paneless-pane' );
				tab  = c[c.length - 1];						//	Active tab is always the last element.

				wT = Math.round ( (w - 12) / ts.length );

				yT = h - (tab.offsetHeight + 2);

				//	First the tabs that are not active.
			//	for ( i = 0; i <  c.length - 2; i += 1 ) {
				for ( i = 0; i < ts.length - 1; i += 1 ) {
			//		if ( c[i].tagName.toLowerCase() !== 'paneless-tab' )  break;

					for ( x = 6, j = 0; j < tabsL2R.length; x += wT, j += 1 ) {
						if ( tabsL2R[j].iC === i )  break;
					}

					if ( j >= tabsL2R.length )  continue;

			//		tab = angular.element (  c[i] );
					tab = angular.element ( ts[i] );
					tab.css ( { left:  x  + 'px',
								top:   yT + 'px',
								width: wT + 'px', 
								color: 'gray'     } );
				}

				//	The tab panes.
				for ( i = 0; i < ps.length; i++ ) {
					pane[i].style.height = yT + 'px';
				}

				//	The active tab.
				tab  = angular.element ( c[c.length-1] );

				for ( x = 6, j = 0; j < tabsL2R.length; x += wT, j += 1 ) {
					if ( tabsL2R[j].iC === (c.length - 1) )  break;
				}

				if ( j < tabsL2R.length ) {
					tab.css ( { left:  x  + 'px',
								top:   yT + 'px',
								width: wT + 'px',
								color: 'black'    } );
				}

			}	//	setSize()

		}	//	link()

        return {
            restrict:	'E',
			scope:		true,
            link:		link
        }

    }	//	panelessTabsDirective

})();

