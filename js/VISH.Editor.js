VISH.Editor = (function(V,$,undefined){
	
	var initOptions;
	var domId = 0;  //number for next doom element id
	
	// Hash to store: 
	// current_el that will be the zone of the template that the user has clicked
	var params = {
		current_el : null		
	};
	
	
	/**
	 * Initializes the VISH editor
	 * Adds the listeners to the click events in the different images and buttons
	 * Call submodule initializers
	 */
	var init = function(options){
		initOptions = options;
				
		$("a#addslide").fancybox({
			'width': 800,
    		'height': 600});		
		$(document).on('click','.templatethumb', _onTemplateThumbClicked);
		$(document).on('click','#save', _onSaveButtonClicked);
		$(document).on('click','.editable', _onEditableClicked);
		$(document).on('click','.selectable', _onSelectableClicked);
		$(document).on('focusout', '.selectable', _onSelectableLoseFocus);
		$(document).on('click','.delete_content', _onDeleteItemClicked);
		$(document).on('click','.delete_slide', _onDeleteSlideClicked);
		
		//arrows in button panel
		$(document).on('click','#arrow_left_div', _onArrowLeftClicked);
		$(document).on('click','#arrow_right_div', _onArrowRightClicked);
		
		//used directly from SlideManager, if we separate editor from viewer that code would have to be in a common file used by editor and viewer
		V.SlideManager.addEnterLeaveEvents();
		
		V.Editor.SlidesUtilities.redrawSlides();
		
		//Init submodules
		V.Debugging.init(true);
		V.Editor.Text.init();
		V.Editor.Image.init();
		V.Editor.Video.init();
		V.Editor.Object.init();
		
		//Remove overflow from fancybox
//		$($("#fancybox-content").children()[0]).css('overflow','hidden')
	};
	
	
	
  ////////////////
  /// Helpers 
  ////////////////
  
  
  /**
   * Return a unic id.
   */
  var getId = function(){
    domId = domId +1;
    return "unicID_" + domId;
  }
	
  /**
   * function to dinamically add a css
   */
  var _loadCSS = function(path){
    $("head").append("<link>");
    css = $("head").children(":last");
    css.attr({
      rel:  "stylesheet",
      type: "text/css",
      href: path
    });
  };

  /**
   * Function to add a delete button to the element
   */
  var addDeleteButton = function(element){
  	element.append("<div class='delete_content'></div>");
  };
  

  /////////////////////////
  /// Fancy Box Functions
  /////////////////////////

	/**
	 * function to load a tab and its content in the fancybox
	 */
	var loadTab = function (tab_id){
	    //deselect all of them
	    $(".fancy_tab").removeClass("fancy_selected");
	    //select the correct one
	    $("#" + tab_id).addClass("fancy_selected");
	    
	    //hide previous tab
	    $(".fancy_tab_content").hide();
	    //show content
	    $("#" + tab_id + "_content").show();

      //Submodule callbacks
			
		switch(tab_id) {
			//Image
			case "tab_pic_from_url":
				V.Editor.Image.onLoadTab("url");
				break;
			case "tab_pic_upload":
				V.Editor.Image.onLoadTab("upload");
				break;
			case "tab_pic_repo":
				V.Editor.Image.Repository.onLoadTab();
				break;
			case "tab_pic_flikr":
				V.Editor.Image.Flikr.onLoadTab();
				break;

			//Video
			case "tab_video_from_url":
				VISH.Editor.Video.HTML5.onLoadTab("url");
				break;
			case "tab_video_upload":
				VISH.Editor.Video.HTML5.onLoadTab("upload");
				break;
			case "tab_video_repo":
				VISH.Editor.Video.Repository.onLoadTab();
				break;
			case "tab_video_youtube":
				VISH.Editor.Video.Youtube.onLoadTab();
				break;

			//Flash
			case "tab_flash_from_url":
				VISH.Editor.Object.onLoadTab("url");
				break;
			case "tab_flash_upload":
				VISH.Editor.Object.onLoadTab("upload");
				break;
			case "tab_flash_repo":
				VISH.Editor.Object.Repository.onLoadTab();
				break;
				
				
			default:
				break;
		}

	};


  /**
   * Function to get the value from the input identified by the id param and draw it in the zone in params['current_el']
   */
  var getValueFromFancybox = function(id_to_get){
    $.fancybox.close();
    
	//Call the draw function of the submodule
    switch(id_to_get)  {
      case "picture_url":
        V.Editor.Image.drawImage($("#"+id_to_get).val());
        break;
      case "flash_embed_code":
    	V.Editor.Object.drawObject($("#"+id_to_get).val())
        break;
      case "video_url":
        V.Editor.Video.HTML5.drawVideoWithUrl($("#"+id_to_get).val())
        break;
      //case "add_your_input_id_here":
        //VISH.Editor.Resource.Module.function($("#"+id_to_get).val())
      // break;
      default:
        break;
    }
    
    //delete the value
    $("#"+id_to_get).val("");
    
    //finally set focus to current_area
    var current_area = VISH.Editor.getCurrentArea();
    current_area.trigger("focus");   
    
  };

  /**
   * Removes the lightbox
   */
  var _closeFancybox = function(){
    $.fancybox.close();
  };


  //////////////////
  ///    Events
  //////////////////

	/**
	 * function called when user clicks on template
	 * Includes a new slide following the template selected
	 */
	var _onTemplateThumbClicked = function(event){
		var slide = V.Dummies.getDummy($(this).attr('template'));
		
		V.Editor.SlidesUtilities.addSlide(slide);	
		V.Editor.SlidesUtilities.addThumbnail("t" + $(this).attr('template'), slideEls.length + 1); //it is slideEls.length +1 because we have recently added a slide and it is not in this array
		
		$.fancybox.close();
		
		//used directly from SlideManager, if we separate editor from viewer that code would have to be in a common file used by editor and viewer
		//V.SlideManager.addEnterLeaveEvents();
		
		V.Editor.SlidesUtilities.redrawSlides();
		setTimeout("VISH.Editor.SlidesUtilities.lastSlide()", 300);
	};

	/**
	 * function called when user clicks on an editable element
	 * Event launched when an editable element belonging to the slide is clicked
	 */
	var _onEditableClicked = function(event){
		//first remove the "editable" class because we are going to add clickable icons there and we don´t want it to be editable any more
		$(this).removeClass("editable");
		params['current_el'] = $(this);
				
		//need to clone it, because we need to show it many times, not only the first one
		//so we need to remove its id		
		var content = null;
		
		if($(this).attr("areaid")==="header"){
			content = $("#menuselect_for_header").clone().attr('id','');
		}
		else{
			content = $("#menuselect").clone().attr('id','');
		}
				
		//add zone attr to the a elements to remember where to add the content
		content.find("a").each(function(index, domElem) {
			$(domElem).attr("zone", params['current_el'].attr("id"));
		});
		
		$(this).html(content);
		
		$("a.addpicture").fancybox({
			'autoDimensions' : false,
			'width': 800,
    		'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				//re-set the params['current_el'] to the clicked zone, because maybe the user have clicked in another editable zone before this one
				var clickedZoneId = $(data).attr("zone");
				params['current_el'] = $("#" + clickedZoneId);
				loadTab('tab_pic_from_url');
			}
		});
		$("a.addflash").fancybox({
			'autoDimensions' : false,
			'width': 800,
    		'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				var clickedZoneId = $(data).attr("zone");
				params['current_el'] = $("#" + clickedZoneId);
				loadTab('tab_flash_from_url');
			}
		});
		$("a.addvideo").fancybox({
			'autoDimensions' : false,
			'width': 800,
    		'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				var clickedZoneId = $(data).attr("zone");
				params['current_el'] = $("#" + clickedZoneId);
				loadTab('tab_video_from_url');
			}
		});
	};


  /**
   * function called when user clicks on the delete icon of the zone
   */
  var _onDeleteItemClicked = function(){
  	params['current_el'] = $(this).parent();
  	$("#image_template_prompt").attr("src", VISH.ImagesPath + params['current_el'].attr("type") + ".png");
  	$.fancybox(
		$("#prompt_form").html(),
		{
        	'autoDimensions'	: false,
			'width'         	: 350,
			'height'        	: 150,
			'showCloseButton'	: false,
			'onClosed'			: function(){
				//if user has answered "yes"
				if($("#prompt_answer").val() ==="true"){
					$("#prompt_answer").val("false");
					params['current_el'].html("");
					params['current_el'].removeAttr("type");
					if(params['current_el'].attr("type")==="image"){
						$(".theslider").hide();	
					}
					params['current_el'].addClass("editable");
				}
			}
		}
	);
  };
  
  /**
   * function called when user clicks on the delete icon of the zone
   */
  var _onDeleteSlideClicked = function(){
  	var article_to_delete = $(this).parent();
  	$("#image_template_prompt").attr("src", VISH.ImagesPath + "templatesthumbs/" + article_to_delete.attr("template") + ".png");
  	$.fancybox(
		$("#prompt_form").html(),
		{
        	'autoDimensions'	: false,
			'width'         	: 350,
			'height'        	: 150,
			'showCloseButton'	: false,
			'onClosed'			: function(){
				//if user has answered "yes"
				if($("#prompt_answer").val() ==="true"){
					$("#prompt_answer").val("false");
					article_to_delete.remove();
					//set curSlide to the preious one if this was the last one
					if(curSlide == slideEls.length-1){
						curSlide -=1;
					}
					V.Editor.SlidesUtilities.redrawThumbnails();
					V.Editor.SlidesUtilities.redrawSlides();					
				}
			}
		}
	);
  };

  /**
   * function called when user clicks on template zone with class selectable
   * we change the border to indicate this zone has been selected and show the slider if the type is an image
   */
  var _onSelectableClicked = function(){  		
  	//add menuselect and delete content button
  	$(this).find(".menuselect_hide").show();
  	$(this).find(".delete_content").show();
  		
  	//show sliders  	
  	if($(this).attr("type")==="image"){
  		var img_id = $(this).find("img").attr("id");
  		//the id is "draggableunicID_1" we want to remove "draggable"
  		img_id = img_id.substring(9);
  		
  		$("#sliderId" + img_id).show();  		
  	}  	
  };
  
  var _onSelectableLoseFocus = function(){  	
  	$(".theslider").hide();
  	$(this).find(".menuselect_hide").hide();
  	$(this).find(".delete_content").hide();
  };

  /**
   * function called when user clicks on save
   * Generates the json for the current slides
   * covers the section element and every article inside
   * finally calls SlideManager with the generated json
   */
  var _onSaveButtonClicked = function(){
    var excursion = {};
    //TODO decide this params
    excursion.id = '';
    excursion.title = '';
    excursion.description = '';
    excursion.author = '';
    excursion.slides = [];
    var slide = {};
    $('article').each(function(index,s){
      slide.id = $(s).attr('id'); //TODO what if saved before!
      slide.template = $(s).attr('template');
      slide.elements = [];
      var element = {};
      $(s).find('div').each(function(i,div){
        //to remove all the divs of the sliders, only consider the final boxes
        if($(div).attr("areaid") !== undefined){
          element.id     = $(div).attr('id');
          element.type   = $(div).attr('type');
          element.areaid = $(div).attr('areaid');
          if(element.type=="text"){
            //TODO make this text json safe
            element.body   = $(div).find(".wysiwygInstance").html();
          } else if(element.type=="image"){
            element.body   = $(div).find('img').attr('src');
            element.style  = $(div).find('img').attr('style');
          } else if(element.type=="iframe"){
            element.body   = $(div).attr('src'); //we have the iframe code in the src attribute
          } else if(element.type=="video"){
		    var video = $(div).find("video");
			element.poster = $(video).attr("poster");
			element.style  = $(video).attr('style');
			//Sources
			var sources= '';				
			$(video).find('source').each(function(index, source) {
			  if(index!=0){
			    sources = sources + ',';
			  }
			  var type = (typeof $(source).attr("type") != "undefined")?' "type": "' + $(source).attr("type") + '", ':''
              sources = sources + '{' + type + '"src": "' + $(source).attr("src") + '"}'
            });
			sources = '[' + sources + ']'
			element.sources = sources;
	      } else if(element.type=="swf"){
	    	  var swf = $(div).find("embed");
	    	  element.body   = $(swf).attr('src');
	    	  element.style  = $(swf).parent().attr('style');
	      } else if(element.type=="object"){
	    	  var object = $(div).find(".object_wrapper").children()[0];
	    	  element.body   = $(object)[0].outerHTML;
	    	  element.style  = $(object).parent().attr('style');
	      }
          
          slide.elements.push(element);
          element = {};
        }
      });
      excursion.slides.push(slide);
      slide = {};
    });
    var jsonexcursion = JSON.stringify(excursion);
    console.log(jsonexcursion);
    
    $('article').remove();
    $('#menubar').remove();
    $('.theslider').remove();
    $(".nicEdit-panelContain").remove();
    V.SlideManager.init(excursion);
    
    
    /*
    //POST to http://server/excursions/
    var params = {
      "excursion[json]": jsonexcursion,
      "authenticity_token" : initOptions["token"]
    }
    
    $.post(initOptions["postPath"], params, function(data) {
          document.open();
      document.write(data);
      document.close();
      });
      */
    
  };
	
	/**
	 * Function to move the slides left one item
	 * curSlide is set by slides.js and it is between 0 and the number of slides, so we use it to move one to the left
	 */
	var _onArrowLeftClicked = function(){
		V.Editor.SlidesUtilities.goToSlide(curSlide);
	};
	
	/**
	 * Function to move the slides right one item
	 * curSlide is set by slides.js and it is between 0 and the number of slides, so we use +2 to move one to the right
	 */
	var _onArrowRightClicked = function(){
		V.Editor.SlidesUtilities.goToSlide(curSlide+2);
	};
	
	
	//////////////////
  ///    Getters
  //////////////////
	
	var getParams = function(){
		return params;
	}
	
	var getTemplate = function() {
		if(params['current_el']){
			return params['current_el'].parent().attr('template');
		}
		return null;
	}
	
	var getCurrentArea = function() {
	    if(params['current_el']){
	      return params['current_el'];
	    }
	    return null;
  }


	return {
		init					         	: init,
		addDeleteButton						: addDeleteButton,
		loadTab 				        	: loadTab,
		getValueFromFancybox    			: getValueFromFancybox,
		getId                  		 		: getId,
		getTemplate            				: getTemplate,
		getCurrentArea        				: getCurrentArea,
		getParams            				: getParams
	};

}) (VISH, jQuery);
