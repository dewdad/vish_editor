VISH.ViewerAdapter = (function(V,$,undefined){

	//Viewbar
	var _showViewbar;
	//Arrows
	var _showArrows;

	//Full Screen
	var _fsButton;

	//Close button
	var _closeButton;

	//Internals
	var _initialized = false;
	//Prevent updateInterface with same params (Make ViSH Viewer more efficient)
	var _lastWidth;
	var _lastHeight;


	var init = function(options){
		if(_initialized){
			return;
		} 
		_initialized = true;

		//Init vars
		_lastWidth = -1;
		_lastHeight = -1;

		_showViewbar = _defaultViewbar();
		_showArrows = true;
		_fsButton = V.FullScreen.canFullScreen();

		//Close button
		_closeButton = (V.Status.getDevice().mobile)&&(!V.Status.getIsInIframe())&&(options)&&(options["comeBackUrl"]);


		//////////////
		//Restrictions
		/////////////

		//No fs for preview
		_fsButton = _fsButton && (!V.Status.getIsPreview());

		//Mobiles
		if(V.Status.getDevice().mobile){
			_showViewbar = false;
		}

		//Uniq mode
		if(V.Status.getIsUniqMode()){
			_showViewbar = false;
			_showArrows = false;
		}

		////////////////
		//Init interface
		///////////////

		//Init viewbar
		if((V.Status.getDevice().desktop)&&(_showArrows)){
			$("#back_arrow").html("");
			$("#forward_arrow").html("");
		}

		if(_showViewbar){
			V.Viewer.updateSlideCounter();
			$("#viewbar").show();
		} else {
			$("#viewbar").hide();
		}

		if(!_showArrows){
			$("#back_arrow").hide();
			$("#forward_arrow").hide();
		};

		if(V.Status.getIsPreview()){
			$("div#viewerpreview").show();
		}

		if(V.Status.getIsPreviewInsertMode()){
			$("#selectSlidesBar").show();
			$("#viewbar").css("bottom",$("#selectSlidesBar").height()+"px");
			$("#viewbar").css("border-bottom","none");
			V.SlidesSelector.init();
		}

		//Watermark
		if((V.Status.getIsInExternalSite())&&(!V.Status.getIsPreviewInsertMode())){
			if((options)&&(typeof options.watermarkURL == "string")){
				$("#embedWatermark").parent().attr("href",options.watermarkURL);
				$("#embedWatermark").show();
			}
		}

		//Evaluations (in recommendation window)
		//Only show evaluations in the ViSH Site
		if(V.Status.getIsInVishSite() || (V.Configuration.getConfiguration()["mode"]===V.Constant.NOSERVER && !V.Status.getIsScorm() && !V.Status.getIsEmbed())){
			$(".rec-first-row").show();
		} else {
			$(".rec-first-row").hide();
			$(".rec-second-row").css("margin-top","10%"); //Center second row vertically
		}

		if(_closeButton){
			$("button#closeButton").show();
		}

		//Init fullscreen
		if(_fsButton){
			V.FullScreen.enableFullScreen();
			$("#page-fullscreen").show();
		} else {
			$("#page-fullscreen").hide();
		}

		//Update interface and init texts
		updateInterface();
		V.Text.init();
	}

	///////////////
	// PAGER
	//////////////

	/**
	 * Function to hide/show the page-switchers buttons and arrows
	 * hide the left one if on first slide
	 * hide the right one if on last slide -> always show it, it will show the recommendations if on last slide
	 * show both otherwise
	 */
	var decideIfPageSwitcher = function(){

		//Arrows
		if(_showArrows){
			if(V.Viewer.getPresentationType()===V.Constant.PRESENTATION){
				if (V.Slides.getCurrentSubslide()!==null){
					//Subslide active
					$("#forward_arrow").hide();
					$("#back_arrow").hide();
				} else {
					//No subslide
					if(V.Slides.isCurrentFirstSlide()){
						$("#back_arrow").hide();
					} else {
						$("#back_arrow").show();
					} 
					//Always show
					$("#forward_arrow").show();
				}
			} else if (V.Viewer.getPresentationType()===V.Constant.QUIZ_SIMPLE){
				//Remove arrow for simple quizs
				$("#forward_arrow").hide();
			}
		}

		// Pager
		if(V.Slides.isCurrentFirstSlide()){
			$("#page-switcher-start").addClass("disabledarrow");
		} else {
			$("#page-switcher-start").removeClass("disabledarrow");
		}
		//Always show, if you are in the last you can see the recommendations
		$("#page-switcher-end").show(); 
	};


	///////////
	// ViewBar
	///////////

	var _decideIfViewBarShow = function(){
		if(_showViewbar){
			$("#viewbar").show();
		} else {
			$("#viewbar").hide();
		}
	}

	var _defaultViewbar = function(){
		var presentationType = V.Viewer.getPresentationType();
		var slidesQuantity = V.Slides.getSlidesQuantity();
		if((presentationType===V.Constant.QUIZ_SIMPLE)&&(slidesQuantity===1)){
			return false;
		} else {
			return true;
		}
	}

	///////////
	// Setup
	///////////

	var updateInterface = function(){
		var cWidth = $(window).width();
		var cHeight = $(window).height();
		if((cWidth===_lastWidth)&&(cHeight===_lastHeight)){
			return;
		}
		_lastWidth = cWidth;
		_lastHeight = cHeight;
		_setupSize();
	};


	/**
	 * Function to adapt the slides to the screen size
	 */
	var _setupSize = function(){
		var reserved_px_for_menubar = _getDesiredVieweBarHeight(_lastHeight);
		var min_margin_height = 25;
		var min_margin_width = 60;

		if(!_showViewbar){
			//Cases without viewbar (quiz_simple , etc)
			reserved_px_for_menubar = 0;
			min_margin_height = 0;
			min_margin_width = 0;
		} else if(V.Status.getIsPreviewInsertMode()){
			//Preview with insert images
			reserved_px_for_menubar = 120; //Constant because is displayed from ViSH Editor
		}

		// V.FullScreen.updateFsButtons();
		
		var height = _lastHeight - reserved_px_for_menubar; //the height to use is the window height - menubar height
		var width = _lastWidth;
		var finalW = 800;
		var finalH = 600;

		var finalWidthMargin;

		var aspectRatio = (width-min_margin_width)/(height-min_margin_height);
		var slidesRatio = 4/3;
		if(aspectRatio > slidesRatio){
			finalH = height - min_margin_height;
			finalW = finalH*slidesRatio;
			var widthMargin = (width - finalW);
			if(widthMargin < min_margin_width){
				finalWidthMargin = min_margin_width;
				var marginWidthToAdd = min_margin_width - widthMargin;
				finalW = finalW - marginWidthToAdd;
			} else {
				finalWidthMargin = widthMargin;
			}
		}	else {
			finalW = width - min_margin_width;
			finalH = finalW/slidesRatio;
			finalWidthMargin = min_margin_width;
			var heightMargin = (height - finalH);
			if(heightMargin < min_margin_height){
				var marginHeightToAdd = min_margin_height - heightMargin;
				finalH = finalH - marginHeightToAdd;
			}
		}

		//finalWidthMargin: margin with added 
		$(".vish_arrow").width(finalWidthMargin/2*0.9);

		//Viewbar
		if(!V.Status.getIsPreviewInsertMode()){
			$("#viewbar").height(reserved_px_for_menubar);
		}

		//resize slides
		var topSlides = $(".slides > article");
		var subSlides = $(".slides > article > article");
		var allSlides = $(".slides article");
		$(allSlides).css("height", finalH);
		$(allSlides).css("width", finalW);

		//margin-top and margin-left half of the height and width
		var marginTop = finalH/2 + reserved_px_for_menubar/2;
		var marginLeft = finalW/2;
		$(topSlides).css("margin-top", "-" + marginTop + "px");
		$(subSlides).css("margin-top", "-" + finalH/2 + "px");
		$(allSlides).css("margin-left", "-" + marginLeft + "px");
		
		var increase = finalH/600;
		var increaseW = finalW/800;
		
		//Paddings
		var paddingTopAndBottom = 3/100*finalW;	//3%
		var paddingLeftAndRight = 5/100*finalW;	//5%
		$(allSlides).css("padding-left",paddingLeftAndRight);
		$(allSlides).css("padding-right",paddingLeftAndRight); 
		$(allSlides).css("padding-top",	paddingTopAndBottom);
		$(allSlides).css("padding-bottom",paddingTopAndBottom);

		//and now the arrows have to be increased or decreased
		$(".fc_poi img").css("width", 50*increase + "px");
		$(".fc_poi img").css("height", 50*increase + "px");

		decideIfPageSwitcher();

		updateFancyboxAfterSetupSize();

		//Texts callbacks
		V.Text.aftersetupSize(increase,increaseW);

		//Snapshot callbacks
		V.SnapshotPlayer.aftersetupSize(increase,increaseW);
		
		//Object callbacks
		V.ObjectPlayer.aftersetupSize(increase,increaseW);

		//Maps callbacks
		V.VirtualTour.aftersetupSize(increase,increaseW);

		//Quiz callbacks
		V.Quiz.aftersetupSize(increase,increaseW);

		//Recommendations callbacks
		V.Recommendations.aftersetupSize(increase,increaseW);
	};

	var _getDesiredVieweBarHeight = function(windowHeight){
		var minimumViewBarHeight = 20;
		var maxViewBarHeight = 40;
		var viewBarHeight = 40;
		//TODO: Make Viewbar responsive
		return Math.min(Math.max(viewBarHeight,minimumViewBarHeight),maxViewBarHeight);
	}

	/**
	 * Fancybox resizing. If a fancybox is opened, resize it
	 */
	var updateFancyboxAfterSetupSize = function(){
		var fOverlay = $("#fancybox-overlay");
		if(($(fOverlay).length<1)||(!$(fOverlay).is(":visible"))){
			return;
		}

		var fwrap = $("#fancybox-wrap");
		var fcontent = $("#fancybox-content");
		var fccontentDivs = $("#" + $(fcontent).attr("id") + " > div");
		
		var currentSlide = $(".current");
		var paddingTop = $(currentSlide).cssNumber("padding-top");
		var paddingLeft = $(currentSlide).cssNumber("padding-left");
		var offset = $(currentSlide).offset();
		
		var fcClose = $("#fancybox-close");
		$(fcClose).height("22px");
		$(fcClose).css("padding","10px");
		$(fcClose).css("padding-left","4px");
		
		$(fwrap).css("margin-top", "0px");
		$(fwrap).width($(currentSlide).width()+paddingLeft);
		$(fwrap).height($(currentSlide).height()+2*paddingTop);
		$(fwrap).css("top", offset.top + "px");  
		$(fwrap).css("left", offset.left + "px");

		$(fcontent).width("100%");
		$(fcontent).height("100%");
		$(fccontentDivs).width("100%");
		$(fccontentDivs).height("100%");
	}

	/*
	 * Show close button if is appropiate
	 */
	var decideIfCloseButton = function(){
		if(_closeButton){
			$("#closeButton").show();
		}
	}
	
	return {
		init 					: init,
		updateInterface 		: updateInterface,
		decideIfPageSwitcher	: decideIfPageSwitcher,
		decideIfCloseButton		: decideIfCloseButton,
		updateFancyboxAfterSetupSize	: updateFancyboxAfterSetupSize
	};

}) (VISH, jQuery);
