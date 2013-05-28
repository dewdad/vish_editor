 /**
  * Provide an API with ViSH (Virtual Science Hub)
  */

VISH.Editor.API = (function(V,$,undefined){
	
	var init = function(){}

  /**
   * function to call to VISH and request excursions in json format
   * The request is:
   * GET /excursions/search.json?type=&q=text
   */
  var requestExcursions = function(text, successCallback, failCallback){
    if(V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER){
      if(typeof successCallback == "function"){
        var result = V.Samples.API.excursionsList;
        successCallback(result);
      }
      return;
    }
       
    _requestByType("excursion", text, successCallback, failCallback);
  };


  /**
   * function to call to VISH and request recommended excursions
   */
  var requestRecomendedExcursions = function(successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
            var result = V.Samples.API.excursionsList;
            successCallback(result);
      }
      return;
    }

    _requestByType("excursion", "", successCallback, failCallback);
  };


  /**
   * function to call to VISH and request smartcards (flashcards and virtual tours) in json format
   * The request is:
   * GET /excursions/search.json?type=smartcard&q=text
   */
  var requestSmartcards = function(text, successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = V.Samples.API.smartcardList;
        successCallback(result);
      }
      return;
    }
             
    _requestByType("smartcard", text, successCallback, failCallback);   
  };

  /**
   * function to call to VISH and request recommended smartcards
   */
  var requestRecomendedSmartcards = function(successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
            var result = V.Samples.API.smartcardList;
            successCallback(result);
      }
      return;
    }
    
    _requestByType("smartcard", "", successCallback, failCallback);
  };


	/**
	 * function to call to VISH and request videos in json format
	 * The request is:
	 * GET /search.json?type=video&q=text
	 */
	var requestVideos = function(text, successCallback, failCallback){
		
		if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = jQuery.extend({}, V.Samples.API.videoList);

        switch(text){
          case "dummy":
            result['videos'] = V.Samples.API.videoListDummy['videos'];
            break;
          case "little":
            result['videos'] = V.Debugging.shuffleJson(V.Samples.API.videoListLittle['videos']);
            break;
          default:
            result['videos'] = V.Debugging.shuffleJson(V.Samples.API.videoList['videos']);
        }
            
        successCallback(result);
      }
      return;
    }
		
		_requestByType("video", text, successCallback, failCallback);		
	};
	
	
	/**
	 * function to call to VISH and request recommended videos
	 */
	var requestRecomendedVideos = function(successCallback, failCallback){
		if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
	      if(typeof successCallback == "function"){
	            var result = V.Samples.API.videoList;
	            result['videos'] = V.Debugging.shuffleJson(V.Samples.API.videoList['videos']);
	            successCallback(result);
	      }
        return;
    }
		
    _requestByType("video", "", successCallback, failCallback);
  };
	
	
	/**
	 * function to call to VISH and request flash objects in json format
	 * The request is:
	 * GET /search.json?type=flash&q=text
	 */
	var requestFlashes = function(text, successCallback, failCallback){
		
		if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = jQuery.extend({}, V.Samples.API.flashList);

        switch(text){
          case "dummy":
            result['flashes'] = V.Samples.API.flashListDummy['flashes'];
            break;
          case "little":
            result['flashes'] = V.Debugging.shuffleJson(V.Samples.API.flashListLittle['flashes']);
            break;
          default:
            result['flashes'] = V.Debugging.shuffleJson(V.Samples.API.flashList['flashes']);
        }
            
        successCallback(result);
      }
      return;
    }
		
		_requestByType("swfs", text, successCallback, failCallback);	
	};
	
	
	/**
	 * function to call to VISH and request recommended flash objects
	 */
	var requestRecomendedFlashes = function(successCallback, failCallback){
		if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
			if(typeof successCallback == "function"){
				var result = V.Samples.API.flashList;
				result['flashes'] = V.Debugging.shuffleJson(V.Samples.API.flashList['flashes']);
        successCallback(result);
      }
			return;
	  }
	  else{
        	_requestByType("swfs", "", successCallback, failCallback);
        }
   };
    
		
  /**
	 * function to call to VISH and request videos in json format
	 * The request is:
	 * GET /search.json?type=picture&q=text
	 */
	var requestImages = function(text, successCallback, failCallback){
		if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
				var result = jQuery.extend({}, V.Samples.API.imageList);

			  switch(text){
					case "dummy":
	          result['pictures'] = V.Samples.API.imageListDummy['pictures'];
					  break;
					case "little":
	          result['pictures'] = V.Debugging.shuffleJson(V.Samples.API.imageListLittle['pictures']);
					  break;
					default:
	          result['pictures'] = V.Debugging.shuffleJson(V.Samples.API.imageList['pictures']);
				}
            
        successCallback(result);
      }
      return;
    }
		 		     
    _requestByType("picture", text, successCallback, failCallback);		
	};
	
	/**
	 * function to call to VISH and request recommended videos
	 */
	var requestRecomendedImages = function(successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
            var result = V.Samples.API.imageList;
            result['pictures'] = V.Debugging.shuffleJson(V.Samples.API.imageList['pictures']);
            successCallback(result);
      }
      return;
    }
		
    _requestByType("picture", "", successCallback, failCallback);
  };
    
		
		  
  /**
   * function to call to VISH and request live objects in json format
   * The request is:
   * GET /search.json?live=1&q=
   */
  var requestLives = function(text, successCallback, failCallback){
    
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = jQuery.extend({}, V.Samples.API.liveList);

        switch(text){
          case "dummy":
            result = V.Samples.API.liveListDummy;
            break;
          case "little":
            result = V.Debugging.shuffleJson(V.Samples.API.liveListLittle);
            break;
          default:
            result = V.Debugging.shuffleJson(V.Samples.API.liveList);
        }
            
        successCallback(result);
      }
      return;
    }
    
    _requestByType("live", text, successCallback, failCallback);  
  };
  
  
  /**
   * function to call to VISH and request recommended lives objects
   */
  var requestRecomendedLives = function(successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = V.Debugging.shuffleJson(V.Samples.API.liveList);
        successCallback(result);
      }
			return;
    }
		
		_requestByType("live", "", successCallback, failCallback);
   };
		
		
		      
  /**
   * function to call to VISH and request objects in json format
   * The request is:
   * GET /search.json?object=1&q=
   */
  var requestObjects = function(text, successCallback, failCallback){
    
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = jQuery.extend({}, V.Samples.API.objectList);

        switch(text){
          case "dummy":
            result = V.Samples.API.objectListDummy;
            break;
          case "little":
            result = V.Debugging.shuffleJson(V.Samples.API.objectListLittle);
            break;
          default:
            result = V.Debugging.shuffleJson(V.Samples.API.objectList);
        }
            
        successCallback(result);
      }
      return;
    }
    
    _requestByType("object", text, successCallback, failCallback);  
  };
  
  
  /**
   * function to call to VISH and request recommended lives objects
   */
  var requestRecomendedObjects = function(successCallback, failCallback){
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
        var result = V.Debugging.shuffleJson(V.Samples.API.objectList);
        successCallback(result);
      }
      return;
    }
    
    _requestByType("object", "", successCallback, failCallback);
   };
		
		
    /**
     * generic function to call VISH and request by query and type
     * The request is:
	 * GET /search.json?type=type&q=query
     */    
  var _requestByType = function(type, query, successCallback, failCallback){
		
		if((type==="live")||(type==="object")){
			_requestResourceType(type,query, successCallback, failCallback);
			return;
		}else if((type==="excursion")||(type==="smartcard")){
      _requestExcursionType(type,query, successCallback, failCallback);
      return;
    }
		
  	$.ajax({
              type: "GET",
              url: "/search.json?type="+ type +"&q="+ query,
              //url: "/tmp.json",
              dataType:"html",
              success:function(response){
                  if(typeof successCallback == "function"){
                  	var resp = JSON.parse(response);
    					      successCallback(resp);
  				        }
              },
              error:function (xhr, ajaxOptions, thrownError){
                  if(typeof failCallback == "function"){
                  	failCallback();
                  }
              }
     });	
  };
	
	
  /**
   * Specific function to call VISH and request lives
   * The request is:
   * GET /resources/search.json?live=1&q=
   */    
  var _requestResourceType = function(type, query, successCallback, failCallback){
    $.ajax({
              type: "GET",
              url: "/resources/search.json?" + type + "=1&q="+ query,
              dataType:"html",
              success:function(response){
                  if(typeof successCallback == "function"){
                    var resp = JSON.parse(response);
                    successCallback(resp);
                  }
              },
              error:function (xhr, ajaxOptions, thrownError){
                  if(typeof failCallback == "function"){
                    failCallback();
                  }
              }
     });  
  };


	/**
   * Specific function to call VISH and request excursions
   * The request is:
   * GET /excursions/search.json?type=&q=query
   */    
  var _requestExcursionType = function(type, query, successCallback, failCallback){
    if(type === "excursion"){
      type = "";
    }

    $.ajax({
              type: "GET",
              url: "/excursions/search.json?type=" + type + "&q="+ query,
              dataType:"html",
              success:function(response){
                  if(typeof successCallback == "function"){
                    var resp = JSON.parse(response);
                    successCallback(resp);
                  }
              },
              error:function (xhr, ajaxOptions, thrownError){
                  if(typeof failCallback == "function"){
                    failCallback();
                  }
              }
     });  
  };
	
	/**
   * function to call to VISH and request tags
   */
	var tags;
	
  var requestTags = function(successCallback, failCallback){
		
		if((tags)&&(typeof successCallback == "function")){
			successCallback(tags);
			return;
		}
		
    if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
      if(typeof successCallback == "function"){
            tags = V.Samples.API.tagsList['tags'];
            successCallback(V.Samples.API.tagsList['tags']);
      }
      return;
    }
		
    $.ajax({
        type: "GET",
        url: "/tags.json?mode=popular&limit=100",
        dataType:"html",
        success:function(response){
            if(typeof successCallback == "function"){
              var tagsJSON = JSON.parse(response);
							tags = [];
              if(tagsJSON.length>0){								 
		             $.each(tagsJSON, function(index, tagJSON) {
		               tags.push(tagJSON.value)
		             });
		          }
              successCallback(tags);
            }
        },
        error:function (xhr, ajaxOptions, thrownError){
            if(typeof failCallback == "function"){
              failCallback();
            }
        }
    });
  };
	
	
	/**
   * Function to get the available avatars from the server, they should be at /excursion_thumbnails.json
   */
	var requestThumbnails = function(successCallback, failCallback){

      if (V.Utils.getOptions().configuration.mode==V.Constant.NOSERVER) {
        if(typeof successCallback == "function"){
              successCallback(V.Samples.API.thumbnailsList);
        }
        return;
      }


      $.ajax({
	      async: false,
	      type: 'GET',
	      url: '/excursion_thumbnails.json',
	      dataType: 'json',
	      success: function(data) {
            if(typeof successCallback == "function"){
              successCallback(data);
            }
	      },
	      error: function(xhr, ajaxOptions, thrownError){
	          if(typeof failCallback == "function"){
              failCallback(xhr, ajaxOptions, thrownError);
            }
	      }
      });
  }
	
	
	return {
		init					              : init,
    requestExcursions           : requestExcursions,
    requestRecomendedExcursions : requestRecomendedExcursions,
    requestSmartcards           : requestSmartcards,
    requestRecomendedSmartcards : requestRecomendedSmartcards,
		requestVideos               : requestVideos,
		requestRecomendedVideos     : requestRecomendedVideos,
		requestImages               : requestImages,
		requestRecomendedImages     : requestRecomendedImages,
		requestFlashes			        : requestFlashes,
		requestRecomendedFlashes    : requestRecomendedFlashes,
		requestObjects              : requestObjects,
    requestRecomendedObjects    : requestRecomendedObjects,
		requestLives                : requestLives,
		requestRecomendedLives      : requestRecomendedLives,
		requestTags                 : requestTags,
		requestThumbnails           : requestThumbnails
	};

}) (VISH, jQuery);
