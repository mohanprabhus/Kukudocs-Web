function readTextFile(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.responseType = "blob";
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                var blob = rawFile.response;
                callback(blob);
            }
        }
    };
    rawFile.send(null);
}

document.addEventListener('DOMContentLoaded', function () {
	var $body = document.querySelector('body');
	var $files =  document.querySelector("#files");
	var $loading =  document.querySelector("#parser-loading");
	var $modal =  document.querySelector("#modal");
	var $docxjsWrapper = document.querySelector("#docxjs-wrapper");

	var instance = null;

	var stopEvent= function(e) {
		if(e.preventDefault) e.preventDefault();
		if(e.stopPropagation) e.stopPropagation();

		e.returnValue = false;
		e.cancelBubble = true;
		e.stopped = true;
	};

	var getInstanceOfFileType = function(file) {
		var fileExtension = null;

		if (file) {
			var fileName = file.name;
			fileExtension = fileName.split('.').pop();
		}

		return fileExtension;
	};

	var documentParser = function(file) {
		var fileType = getInstanceOfFileType(file);

		if (fileType) {
			if (fileType === 'docx') {
				instance = window.docxJS = window.createDocxJS();

			} else if (fileType === 'xlsx') {
				instance = window.cellJS = window.createCellJS();

			} else if (fileType === 'pptx') {
				instance = window.slideJS = window.createSlideJS();

			} else if (fileType === 'pdf') {
				instance = window.pdfJS = window.createPdfJS();
			}


			if (instance) {
				$loading.style.display = 'block';
				instance.parse(
					file,
					function () {
						afterRender(file, fileType);
						$loading.style.display = 'gone';
					}, function (e) {
						if(!$body.hasClass('is-docxjs-rendered')){
							$docxjsWrapper.style.display = 'gone';
						}

						if(e.isError && e.msg){
							alert(e.msg);
						}

						$loading.style.display = 'gone';
					}, null
				);
			}
		}
	};

	var afterRender = function (file, fileType) {
		var element = $docxjsWrapper;
		$(element).css('height','calc(100% - 65px)');

		var loadingNode = document.createElement("div");
		loadingNode.setAttribute("class", 'docx-loading');
		element.parentNode.insertBefore(loadingNode, element);
		$modal.style.display = 'block';

		var endCallBackFn = function(result){
			if (result.isError) {
				if(!$body.hasClass('is-docxjs-rendered')){
					$docxjsWrapper.style.display = 'gone';
					$body.classList.remove('is-docxjs-rendered');
					element.innerHTML = "";

					$modal.style.display = 'gone';
					$body.classList.add('rendered');
				}
			} else {
				$body.classList.add('is-docxjs-rendered');
				console.log("Success Render");
			}

			loadingNode.parentNode.removeChild(loadingNode);
		};

		if (fileType === 'docx') {
			window.docxAfterRender(element, endCallBackFn);

		} else if (fileType === 'xlsx') {
			window.cellAfterRender(element, endCallBackFn);

		} else if (fileType === 'pptx') {
			window.slideAfterRender(element, endCallBackFn, 0);

		} else if (fileType === 'pdf') {
			window.pdfAfterRender(element, endCallBackFn, 0);
		}
	};

	var filePath = "http://localhost:8383/docviewer/docs/sample_pptx_file.pptx";

	readTextFile(filePath, function(content) {
		var parts = [
			content
		];
		
		var myfile = new File(parts, 'sample_powerpoint.pptx', {
			lastModified: new Date(),
			type: "overide/mimetype"
		});

		documentParser(myfile);
	});
});
