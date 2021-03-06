VISH.Viewer = (function(V,$,undefined){

	//Initial options
	var initOptions;
	//Pointer to the current presentation
	var current_presentation;


	/**
	 * Function to initialize the Viewer, saves the slides object and init the presentation with it
	 * options is a hash with params and options from the server.
	 */
	var init = function(options, presentation){
		V.Editing = false;
		$("body").addClass("ViSHViewerBody");
		
		initOptions = (typeof options == "object") ? options : {};

		V.Debugging.init(options);
		
		if((initOptions["configuration"])&&(V.Configuration)){
			V.Configuration.init(initOptions["configuration"]);
		}

		if(V.Debugging.isDevelopping()){
			if ((!presentation)&&(V.Debugging.getPresentationSamples()!==null)){
			 	presentation = V.Debugging.getPresentationSamples();
			}
		}

		V.Utils.init();
		V.I18n.init(initOptions,presentation);

		V.Debugging.log("\n\nViSH Viewer init with presentation:\n"); 
		V.Debugging.log(JSON.stringify(presentation));

		presentation = V.Utils.fixPresentation(presentation);
		if(presentation===null){
			V.Utils.showPNotValidDialog();
			return;
		}
		current_presentation = presentation;
		
		V.Status.init(function(){
			//Status loading finishes
			_initAferStatusLoaded(options,presentation);
		});
	};

	var _initAferStatusLoaded = function(options,presentation){
		V.Utils.Loader.loadDeviceCSS();
		V.Utils.Loader.loadLanguageCSS();
		V.Themes.init();
		V.Themes.Core.applyConfigTheme(function(VEtheme){
			_initAferVEThemeLoaded(options,presentation);
		});
	};

	var _initAferVEThemeLoaded = function(options,presentation){
		V.EventsNotifier.init();
		V.Object.init();
		V.Slideset.init();
		V.Quiz.initBeforeRender(presentation);
		V.Slides.init();
		V.I18n.translateUI();
		V.User.init(options);
		V.Storage.init();
		V.Recommendations.init(options);
		V.Events.init();
		V.Video.init();
		V.Audio.init();
		V.FullScreen.init();
		V.SCORM.init();
		V.Themes.Presentation.loadTheme(presentation.theme, function(){
			_initAferPresentationThemeLoaded(options,presentation);
		});
	};

	var _initAferPresentationThemeLoaded = function(options,presentation){
		V.Presentation.init(presentation.slides, function(){
			_initAferRenderPresentation(options,presentation);
		});
	};

	var _initAferRenderPresentation = function(options,presentation){
		V.Video.HTML5.setMultimediaEvents();
		V.Animations.loadAnimation(presentation.animation, function(){
			_initAferAnimationLoaded(options,presentation);
		})
	};

	var _initAferAnimationLoaded = function(options,presentation){
		V.Slides.updateCurrentSlideFromHash();
		//we have to update slides AFTER load theme and before anything
		//This way we prevent undesired behaviours 
		V.Slides.updateSlides();

		//Init some modules (and submodules) after render
		V.Quiz.init();
		V.SCORM.initAfterRender();
		V.IframeMessenger.init();

		//Init ViSH Editor Addons
		if(options.addons){
			V.Addons.init(options.addons);
		}

		V.ViewerAdapter.init(options); //Also init texts

		//Clean hash
		// V.Utils.cleanHash();

		if(V.Slides.getCurrentSlideNumber()>0){
			V.Slides.triggerEnterEventById($(V.Slides.getCurrentSlide()).attr("id"));
		}

		if(!V.Status.isExternalDomain()){
			//Try to win focus
			window.focus();
		}

		//After all, init tracking system
		V.TrackingSystem.init();
	};

	
	var getOptions = function(){	
		return initOptions;
	};

	/**
	* Function called when entering slide in viewer, we have to show the objects
	*/
	var onSlideEnterViewer = function(e){
		var slide = e.target;
		var cSlideNumber = V.Slides.getCurrentSlideNumber();
		var isSubslide = V.Slides.isSubslide(slide);
		var isSlideset = ((!isSubslide)&&(V.Slideset.isSlideset(slide)));

		//Prevent parent to trigger onSlideEnterViewer
		//Use to prevent slidesets to be called when enter in one of their subslides
		e.stopPropagation();

		var timeToLoadObjects = 500;

		if(!isSubslide){
			V.ViewerAdapter.decideIfPageSwitcher();
		} else {
			timeToLoadObjects = 1000;
		}

		setTimeout(function(){
			if(!isSubslide){
				if(cSlideNumber!==V.Slides.getCurrentSlideNumber()){
					//Prevent objects to load when the slide isn't focused
					return;
				}
			}
			if(!isSlideset){
				if($(slide).hasClass(V.Constant.OBJECT)){
					V.ObjectPlayer.loadObject($(slide));
				}
				if($(slide).hasClass(V.Constant.SNAPSHOT)){
					V.SnapshotPlayer.loadSnapshot($(slide));
				}
			}
		},timeToLoadObjects);

		// if(V.Status.getDevice().mobile){
		// 	V.ImagePlayer.reloadGifs($(slide));
		// }

		if(!isSlideset){
			V.Video.HTML5.playMultimedia(slide);
		}

		if(isSlideset){
			V.Slideset.onEnterSlideset(slide);
		}

		if(!isSubslide){
			V.Recommendations.checkForRecommendations();
		}

		V.EventsNotifier.notifyEvent(V.Constant.Event.onEnterSlide,{"id": slide.id, "slideNumber": cSlideNumber},false);
	};

	/**
	* Function called when leaving a slide in viewer
	*/
	var onSlideLeaveViewer = function(e){
		var slide = e.target;
		var isSubslide = V.Slides.isSubslide(slide);
		var isSlideset = ((!isSubslide)&&(V.Slideset.isSlideset(slide)));

		e.stopPropagation();

		if(!isSlideset){
			if($(slide).hasClass(V.Constant.OBJECT)){
				V.ObjectPlayer.unloadObject($(slide));
			} else if($(slide).hasClass(V.Constant.SNAPSHOT)){
				V.SnapshotPlayer.unloadSnapshot($(slide));
			}
			V.Video.HTML5.stopMultimedia(slide);
		} else {
			V.Slideset.onLeaveSlideset(slide);
		}
	};
	
	/**
	 * function to update the number that indicates what slide is diplayed
	 * with this format: 1/12 2/12
	 */
	var updateSlideCounter = function(){
		var number_of_slides = V.Slides.getSlides().length;
		var slide_number = V.Slides.getCurrentSlideNumber();
		if(number_of_slides===0){
			slide_number = 0;
		}
		$("#slide-counter-input").val(slide_number);
		$("#slide-counter-span").html("/" + number_of_slides);
	};
	
	var getCurrentPresentation = function(){
		return current_presentation;
	};

	var getPresentationType = function(){
		var cPresentation = getCurrentPresentation();
		if(typeof cPresentation == "object"){
			return cPresentation.type;
		} else {
			return undefined;
		}
	};


	return {
		init 						: init, 
		getOptions					: getOptions,
		updateSlideCounter			: updateSlideCounter,
		getCurrentPresentation		: getCurrentPresentation,
		getPresentationType			: getPresentationType,
		onSlideEnterViewer			: onSlideEnterViewer,
		onSlideLeaveViewer			: onSlideLeaveViewer
	};

}) (VISH,jQuery);