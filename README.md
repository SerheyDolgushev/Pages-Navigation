PagesNavigation
=========

PagesNavigation is flexible paginator plugin.

![Screenshot](http://img187.imageshack.us/img187/7347/screenshotvd.png)


How to Use
----------

Simple usage:

	#HTML
	<div>
		<span>Pages navigation:</span>
		<div id="page-navigation"></div>
	</div>
	<div>
		<span>Blocks per page:</span>
		<div id="page-navigation-quantity"></div>
	</div>

	<div id="virtual-pages">
		<div class="page-block">Lorem Ipsum...</div>
		<div class="page-block">Lorem Ipsum...</div>
		...
		<div class="page-block">Lorem Ipsum...</div>
	</div>

	#JS
	window.addEvent( 'load', function() {
		var options  = {
			'navigationBlocks'         : [ 'page-navigation' ],
			'quantityBlocks'           : [ 'page-navigation-quantity' ]
		}
		var pagesNavigation = new NXC.PagesNavigation( '#virtual-pages .page-block', options );
		pagesNavigation.build();
	} );