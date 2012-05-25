VISH.Editor.Video = (function(V,$,undefined){
		
	var init = function(){
		VISH.Editor.Video.HTML5.init();
		VISH.Editor.Video.Repository.init();
		VISH.Editor.Video.Youtube.init();
		VISH.Editor.Video.Vimeo.init();

    var urlInput = $("#tab_video_from_url_content").find("input");
    $(urlInput).watermark('Paste video URL');
    
    $("#tab_video_from_url_content .previewButton").click(function(event) {
      if(VISH.Police.validateObject($(urlInput).val())[0]){
        contentToAdd = $(urlInput).val();
        VISH.Editor.Object.drawPreview("tab_video_from_url_content", contentToAdd)
      } else {
        contentToAdd = null;
      }
    });
	};	

  
  var onLoadTab = function(tab){  
	  //Load Video from URL
		$("#tab_video_from_url_content").find("input").val("")
		VISH.Editor.Object.resetPreview("tab_video_from_url_content");
  }
	
	
  var drawPreviewElement = function(){
    VISH.Editor.Object.drawPreviewObject(contentToAdd);
  }
			
	return {
		init: init,
		onLoadTab : onLoadTab,
		drawPreviewElement : drawPreviewElement
	};

}) (VISH, jQuery);
