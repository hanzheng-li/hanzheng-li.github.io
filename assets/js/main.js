/*
	Dimension by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.children('ul').children('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}

		// Submenu (Teaching dropdown).
			var $submenuParents = $nav_li.filter('.has-submenu'),
				hoverCapable = !!(window.matchMedia
					&& window.matchMedia('(hover: hover) and (pointer: fine)').matches);

			function closeSubmenus() {
				$submenuParents.removeClass('open')
					.children('a').attr('aria-expanded', 'false');
			}

			// Parent toggles its submenu instead of navigating.
				$submenuParents.children('a').on('click', function(event) {

					// Hover-capable pointers (desktop): hover reveals the submenu,
					// so let the click follow the link to Student Achievements.
						if (hoverCapable)
							return;

					event.preventDefault();
					event.stopPropagation();

					var $li = $(this).parent(),
						isOpen = $li.hasClass('open');

					// Close all, then open this one if it was closed.
						closeSubmenus();

						if (!isOpen)
							$li.addClass('open')
								.children('a').attr('aria-expanded', 'true');

				});

			// Any outside click (incl. selecting an item) closes open submenus.
				$body.on('click', function() {
					if ($submenuParents.hasClass('open'))
						closeSubmenus();
				});

			// On hover/focus devices, keep aria-expanded synced with the CSS reveal.
				if (hoverCapable)
					$submenuParents
						.on('mouseenter focusin', function() {
							$(this).children('a').attr('aria-expanded', 'true');
						})
						.on('mouseleave focusout', function(event) {
							if (!this.contains(event.relatedTarget))
								$(this).children('a').attr('aria-expanded', 'false');
						});

			// Esc closes open submenus.
				$window.on('keyup', function(event) {
					if (event.key === 'Escape' || event.keyCode === 27)
						closeSubmenus();
				});

	// Lightbox (view certificate images in-place instead of opening a new tab).
		var $gallery = $('.cert-gallery');

		if ($gallery.length > 0) {

			var $lightbox = $(
					'<div id="lightbox" role="dialog" aria-modal="true" aria-hidden="true">' +
						'<button type="button" class="lightbox-close" aria-label="Close">&#10005;</button>' +
						'<img alt="" />' +
						'<div class="lightbox-caption"></div>' +
					'</div>'
				).appendTo($body);

			var $lightboxImg = $lightbox.children('img'),
				$lightboxCaption = $lightbox.children('.lightbox-caption'),
				$lightboxClose = $lightbox.children('.lightbox-close'),
				lightboxReturnFocus = null;

			function hideLightbox() {
				$lightbox.removeClass('visible').attr('aria-hidden', 'true');
				$wrapper.removeAttr('inert');
				if (lightboxReturnFocus) {
					lightboxReturnFocus.focus();
					lightboxReturnFocus = null;
				}
			}

			// Open the clicked certificate in the lightbox.
				$gallery.find('figure a').on('click', function(event) {

					event.preventDefault();
					event.stopPropagation();

					var $figure = $(this).closest('figure'),
						caption = $figure.find('figcaption').text().replace(/\s+/g, ' ').trim();

					$lightboxImg
						.attr('src', this.getAttribute('href'))
						.attr('alt', $figure.find('img').attr('alt') || caption);
					$lightboxCaption.text(caption);
					$lightbox.attr('aria-label', caption);

					lightboxReturnFocus = this;
					$wrapper.attr('inert', '');
					$lightbox.addClass('visible').attr('aria-hidden', 'false');
					$lightboxClose[0].focus();

				});

			// Backdrop / close button dismisses; clicking the image itself does not.
				$lightboxImg.on('click', function(event) {
					event.stopPropagation();
				});

				$lightbox.on('click', function(event) {
					event.stopPropagation();
					hideLightbox();
				});

			// Esc closes the lightbox first (capture phase pre-empts the article's Esc handler).
				window.addEventListener('keyup', function(event) {
					if ((event.key === 'Escape' || event.keyCode === 27) && $lightbox.hasClass('visible')) {
						hideLightbox();
						event.stopPropagation();
					}
				}, true);

		}

	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);