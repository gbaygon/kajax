var kajax_registered_error_handler = false;


(function( $ ) {
	$.fn.kajax = function(options) {

		var defaultOptions = {
			target : '#kajax-target',  /*target to load the content*/
			loading_class : 'kajax-loading', /*override loading div class*/
			loading_sub:'',  /*selector, to insert loading in a subelement*/
			eval:false,
			debug: true  /*show debug*/
		};

		var opt = $.extend(defaultOptions, options);

		var LOADING_DIV = '<div class="'+opt.loading_class+'"><div class="'+opt.loading_class+'-image"></div></div>';


		function init_pushState()
		{
			if(history.pushState)
			{
				// needed to recreate the 'first' page with AJAX
				history.replaceState({ path: window.location.href }, '');

				$(window).bind('popstate', function(event) {
					// if the event has our history data on it, load the page fragment with AJAX
					var state = event.originalEvent.state;
					if (state) {
						ajax_load(state.path);
					}
				});
			}
		}

		/*raises a javascript overlay on the page, to show an unrecoverable exception*/
		function raiseOverlay(content)
		{
			if(opt.debug)
			{
				$("body").append(
					$("<div id='overlay'><a href=\"javascript:$('#overlay').remove();\">close</a><pre id='debug_content'></pre></div>")
				);
				$("#debug_content").html(content);
				$("#overlay").css({
						'position': 'absolute',
						'top': 0,
						'right':0,
						'left':0,
						'overflow': 'hidden',
						'backgroundColor':'#000000',
						'color':'gray',
						'fontFamily':'verdana',
						'padding':'40px 100px 40px 100px',
						'opacity': 0.8,
						'z-index': 5000
					}
				);
			}
		}

		function htmlspecialchars(string) { return $
			('<span>').text(string).html() };

		function error2html(errobj)
		{
			var s = '';
			$.each(
				errobj, function(k,v)
				{
					v = htmlspecialchars(v);
					if(k!='')
					{
						s += '\n---------------\n';
						s += '<span style="color:red">'+ k + '</span>' + v;
					}
					else{
						s += '<span style="color:red; font-size:2.0em;">'+v+ '</span>';
					}
				}
			)
			return s;
		}

		function error2txt(errobj)
		{
			var s = '';
			$.each(
				errobj, function(k,v)
				{
					s += '\n---------------\n';
					s += k + v;
				}
			)
			return s;
		}

		function ajax_load( load_url )
		{
			if(history.pushState)
			{
				where = $(opt.target);

				history.pushState({path:load_url}, '', load_url);
				beginLoading(where);

				where.load(load_url,{'kajax':true},
					function(){
						endLoading(where);
					}
				);
			}
			else
			{
				window.location = load_url;
			}
		}

		function ajax_eval(url, data /*this can be null*/, onSuccess /*this can be null*/)
		{
			$.post(url,data,
				function(res)
				{
					try
					{
						eval(res);
					}
					catch(err)
					{
						msg = {
							'':'KAJAX Exception while evaluating response',
							'Url: ':url,
							'Sent Data: ':decodeURIComponent(data),
							'Error Type: ':err.name,
							'Debug message: ':err.message,
							'Received Script: \n\n':res
						};

						raiseOverlay(error2html(msg));
						throw error2txt(msg);
					}
					if(onSuccess)
					{
						onSuccess();
					}
				}
			);
		}


		function beginLoading(el){
			if(opt.loading_sub != '')
			{
				$(opt.loading_sub,el).append(LOADING_DIV);
			}
			else
			{
				$(el).append(LOADING_DIV);
			}
		}

		function endLoading(el)
		{
			$('.'+opt.loading_class, el).remove();
		}



		function register_ErrorHandler()
		{
			if(kajax_registered_error_handler)
			{
				return; //only once
			}

			/*catches all ajax errors*/
			$(document).ajaxError(function(event, xhr, ajaxOptions, errorThrown) {

				msg = {
					'':'KAJAX Error while executing ajax request',
					'URL: ':ajaxOptions.url,
					'Status: ':xhr.status+' ('+errorThrown+')',
					'Response Text: ':xhr.responseText
				}

				raiseOverlay(error2html(msg));
				throw error2txt(msg);
			});

			kajax_registered_error_handler = true;
		}

		/****/
		init_pushState();
		register_ErrorHandler();

		$(document).on('click',this.selector, function(event){
			var el = $(this);
			if(el.is('a'))
			{
				if(event.which == 1)
				{
					var load_url = el.attr('href');
					if(opt.eval)
					{
						ajax_eval(load_url);
					}
					else
					{
						ajax_load(load_url);
					}
					event.preventDefault();
				}
			}
		})

		$(document).on('submit',this.selector, function(event){
			var el = $(this);
			if(el.is('form'))
			{
					data = el.serialize();
					url = el.attr('action');
					beginLoading(el);
					ajax_eval(url,data, function(){
						endLoading(el);
					});
				event.preventDefault();
			}
		})



	};
})( jQuery );