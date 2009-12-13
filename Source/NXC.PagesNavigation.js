/*
---
description: Paginator class.

license: MIT-style

authors:
- Dolgushev Serhey (dolgushev.serhey@gmail.com)

requires: core:1.2.4: '*'

provides: [NXC.PagesNavigation]
...
*/

var NXC = NXC || {};
NXC.PagesNavigation = new Class( {

	Implements: [Options, Events],

	options: {
		'navigationBlocks'         : [ 'page-navigation' ],
		'quantityBlocks'           : [ 'page-navigation-quantity-top', 'page-navigation-quantity-bottom' ],
		'possbileQuantities'       : [ 5, 10, 25, 50 ],
		'defaultQuantity'          : 10,
		'currentQuantityCSSClass'  : 'page-navigation-quantity-current',
		'otherQuantityCSSClass'    : 'page-navigation-quantity-other',
		'currentLinkCSSClass'      : 'page-navigation-current',
		'otherLinkCSSClass'        : 'page-navigation-other',
		'disabledLinkCSSClass'     : 'page-navigation-disabled',
		'prevLinkTitle'            : '&laquo Previous',
		'nextLinkTitle'            : 'Next &raquo',
		'prevLinkCSSClass'         : 'page-navigation-prev',
		'nextLinkCSSClass'         : 'page-navigation-next',
		'scrollElement'            : false,
		'currentURL'               : true,
		'onShowPage'               : $empty()
	},

	blocks: [],
	blocksPerPage: 10,
	pagesCount: 0,
	currentPage: 1,
	quantityBlocks: [],
	navigationBlocks: [],

	initialize: function( blocksCSSPath, options ) {
		this.blocks = $$( blocksCSSPath );
		this.setOptions( options );

		this.blocksPerPage = this.options.defaultQuantity;
	},

	build: function() {
		this.parseURL();

		this.calculatePagesCount();

		if ( this.pagesCount > 1 ) {
			this.installPagesNavigation();
			this.installQuantityNavigatoion();
		}

		this.showPage();
	},

	parseURL: function() {
		if( this.options.currentURL ) {
			var uri = new URI();
			if( uri.get( 'fragment' ) ) {
				var quantity    = this.blocksPerPage;

				var parts = uri.get( 'fragment' ).split( '/' );
				parts.each( function( part ) {
					var partElements = part.split( '=' );
					if( partElements.length == 2 ) {
						switch( partElements[0] ) {
							case 'quatity':
								quantity = partElements[1].toInt();
								break;
							case 'page':
								this.currentPage = partElements[1].toInt();
								break;
						}
					}
				}.bind( this ) );

				if( this.options.possbileQuantities.contains( quantity ) ) {
					this.setBlocksPerPage( quantity );
				}
			}
		}
	},

	calculatePagesCount: function() {
		var pagesCount   = ( this.blocks.length / this.blocksPerPage );
		this.pagesCount  = ( pagesCount > pagesCount.round() ) ? pagesCount.round() + 1 : pagesCount.round();
	},

	installPagesNavigation: function() {
		this.options.navigationBlocks.each( function( el ) {
			var navigationBlock = document.id( el );
			if( navigationBlock ) {
				this.navigationBlocks.include( navigationBlock );
			}
		}.bind( this ) );

		this.navigationBlocks.each( function( navigationBlock ) {
			navigationBlock.empty();

			this.buildPagesNavigationPrevLink( navigationBlock );
			if( this.pagesCount > 1 ) {
				var pageNumber = 1;
				while ( pageNumber <= this.pagesCount ) {
					this.buildPagesNavigationLink( pageNumber, navigationBlock );
					pageNumber++;
		        }
			}
	        this.buildPagesNavigationNextLink( navigationBlock );
		}.bind( this ) );
	},

	buildPagesNavigationPrevLink: function( container ) {
		var l = new Element( 'a', {
			'html'  : this.options.prevLinkTitle,
			'href'  : '#',
			'class' : this.options.prevLinkCSSClass
		} ).inject( container );
		l.addEvent( 'click', function( e ) {
			e.stop();

			if( this.currentPage == 1 ) {
				return false;
			}

			this.currentPage--;
			this.showPage();
			this.scrollToTop( e );
		}.bind( this ) );
	},

	buildPagesNavigationLink: function( pageNumber, container ) {
		var l = new Element( 'a', {
			'html'  : pageNumber,
			'href'  : '#',
			'class' : ( pageNumber == this.currentPage ) ? this.options.currentLinkCSSClass : this.options.otherLinkCSSClass
		} ).inject( container );
		l.store( 'page', pageNumber );
		l.addEvent( 'click', function( e ) {
			e.stop();

			this.currentPage = l.retrieve( 'page' );
			this.showPage();
			this.scrollToTop( e );
		}.bind( this ) );
	},

	buildPagesNavigationNextLink: function( container ) {
		var l = new Element( 'a', {
			'html'  : this.options.nextLinkTitle,
			'href'  : '#',
			'class' : this.options.nextLinkCSSClass
		} ).inject( container );
		l.addEvent( 'click', function( e ) {
			e.stop();

			if( this.currentPage == this.pagesCount ) {
				return false;
			}

			this.currentPage++;
			this.showPage();
			this.scrollToTop( e );
		}.bind( this ) );
	},

	installQuantityNavigatoion: function() {
		this.options.quantityBlocks.each( function( el ) {
			var quantityBlock = document.id( el );
			if( quantityBlock ) {
				this.quantityBlocks.include( quantityBlock );
			}
		}.bind( this ) );

		this.quantityBlocks.each( function( quantityBlock ) {
			quantityBlock.empty();
			this.options.possbileQuantities.each( function( quantity ) {
				if( $type( quantity ) == 'number' ) {
					var quantityElement = new Element( 'a', {
						'href'  : '#',
						'html'  : quantity,
						'class' : ( quantity == this.blocksPerPage ) ? this.options.currentQuantityCSSClass : this.options.otherQuantityCSSClass
					} ).inject( quantityBlock );
					quantityElement.store( 'quantity', quantity );
					quantityElement.addEvent( 'click', function( e ) {
						e.stop();
						this.setBlocksPerPage( quantity );
					}.bind( this ) );
				}
			}.bind( this ) );
		}.bind( this ) );
	},

	setBlocksPerPage: function( setBlocksPerPage ) {
		var otherClass   = this.options.otherQuantityCSSClass;
		var currentClass = this.options.currentQuantityCSSClass;
		this.quantityBlocks.each( function( quantityBlock ) {
			quantityBlock.getElements( 'a.' + otherClass ).extend(
				quantityBlock.getElements( 'a.' + currentClass )
			).each( function( el ) {
				el.removeClass( otherClass );
				el.removeClass( currentClass );

				if( el.retrieve( 'quantity' ) == setBlocksPerPage ) {
					el.addClass( currentClass );
				} else {
					el.addClass( otherClass );
				}
			} );
		}.bind( this ) );

		this.blocksPerPage = setBlocksPerPage;
		this.calculatePagesCount();
		if( this.currentPage > this.pagesCount ) {
			this.currentPage = this.pagesCount;
		}
		this.installPagesNavigation();
		this.showPage();
	},

	showPage: function() {
		var linkClassCurrent  = this.options.currentLinkCSSClass;
		var linkClassOther    = this.options.otherLinkCSSClass;
		var linkClassDisabled = this.options.disabledLinkCSSClass;

		this.navigationBlocks.each( function( navigationBlock ) {
			if( this.pagesCount > 1 ) {
				navigationBlock.getElements( 'a.' + linkClassOther ).extend(
					navigationBlock.getElements( 'a.' + linkClassCurrent )
				).each( function( el ) {
					el.removeClass( linkClassOther );
					el.removeClass( linkClassCurrent );
					if( el.retrieve( 'page' ) == this.currentPage ) {
						el.addClass( linkClassCurrent );
					} else {
						el.addClass( linkClassOther );
					}
	        	}.bind( this ) );
    		}

        	var prevLink = navigationBlock.getElement( 'a.' + this.options.prevLinkCSSClass );
			var nextLink = navigationBlock.getElement( 'a.' + this.options.nextLinkCSSClass );
			prevLink.removeClass( linkClassDisabled );
			nextLink.removeClass( linkClassDisabled );
			if( this.currentPage == 1 ) {
				prevLink.addClass( linkClassDisabled );
			}
			if( this.currentPage == this.pagesCount ) {
				nextLink.addClass( linkClassDisabled );
			}
		}.bind( this ) );

		var minBlock = ( this.currentPage - 1 ) * this.blocksPerPage;
		var maxBlock = this.currentPage * this.blocksPerPage;

		var displayeBlocks = [];
		var tag = ( this.blocks[0] ) ? this.blocks[0].get( 'tag' ) : false;
		var displayStyle = ( tag == 'tr' && !Browser.Engine.trident ) ? 'table-row' : 'block';
		this.blocks.each( function( block, index ) {
			if( index >= minBlock && index < maxBlock ) {
				block.setStyle( 'display', displayStyle );
				displayeBlocks.include( block );
			} else {
				block.setStyle( 'display', 'none' );
			}
		} );

		this.updateCurrentURI();

		this.fireEvent( 'pageShow', [ displayeBlocks ] );
	},

	updateCurrentURI: function() {
		if( this.options.currentURL != false ) {
			var uri = new URI();
			uri.set( 'fragment', 'page=' + this.currentPage + '/quatity=' + this.blocksPerPage );
			window.location = uri.toString();
		}
	},

	scrollToTop: function ( e ) {
		new Fx.Scroll( window ).toElement( ( this.options.scrollElement ) ? this.options.scrollElement : this.blocks[0] );
	}
} );