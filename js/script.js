////////////////////////////////////////////////////
// main Jquery scripts for DreadUrHead App
// developped by Mike Barmettler 2017/2018
// redesign and step-by-step functional by Andrew Silent 2018 - gitlab(@andrewsilent)
////////////////////////////////////////////////////

var state = 'step-one';
var array = ['step-one', 'step-two', 'step-three', 'direct-download', 'email-send', 'email-download'];

handleStepChange(state);

document.getElementById('myPortraitSelector').addEventListener('change', function() {handleStepChange('step-two');});
NodeList.prototype.forEach = Array.prototype.forEach;
document.querySelectorAll('#goto-step-three').forEach(function(e){ e.addEventListener('click', function() {handleStepChange('step-three');} )});
document.querySelectorAll('#goto-direct-download').forEach(function(e){ e.addEventListener('click', function() {directDownload(); handleStepChange('direct-download');} )});
document.querySelectorAll('#goto-email-send').forEach(function(e){ e.addEventListener('click', function() {handleStepChange('email-send');} )});
document.querySelectorAll('#goto-email-download').forEach(function(e){ e.addEventListener('click', function() {handleStepChange('email-download');} )});

function handleStepChange(state){
    for (let i=0; i<array.length; i++) {
        if (array[i]==state) document.getElementById(array[i]).style.display='block';
        else document.getElementById(array[i]).style.display='none';
    }
}

function directDownload() {
    var save = document.createElement('a');
    save.setAttribute("href", document.getElementById('final-img').src);
    save.setAttribute("download", 'myDreadHead.png');
    save.click();
}

var hidden = document.querySelectorAll('.hidden .element')
if (!!hidden) {
    for (let i=0, x=hidden.length; i<x; i++) {
        hidden[i].addEventListener('click', function() { hiddenStateChange(hidden[i]) });
        // document.querySelector('.step-two').style.marginTop = '-64px';
        // document.querySelector('.step-three').style.marginTop = '-64px';
    }
}

function hiddenStateChange(e) {
    e.classList.toggle('active');
    if( e.classList.contains('active')) {
        document.querySelector('.step-two').style.marginTop = '0';
        document.querySelector('.step-three').style.marginTop = '0';
    }
    else if (window.innerWidth<640) {
        document.querySelector('.step-two').style.marginTop = '-64px';
        document.querySelector('.step-three').style.marginTop = '-64px';
    }
}

//specify Dread Hair images on web folder /img/dreads/
var dreadSelectionArray = ["Dreads(1).png", "Dreads(2).png", "Dreads(3).png", "Dreads(4).png", "Dreads(5).png", "Dreads(6).png", "Dreads(7).png", "Dreads(8).png", "Dreads(9).png", "Dreads(10).png", "Dreads(11).png", "Dreads(12).png", "Dreads(13).png", "Dreads(14).png", "Dreads(15).png", "Dreads(16).png", "Dreads(17).png", "Dreads(18).png", "Dreads(19).png", "Dreads(20).png", "Dreads(21).png", "Dreads(22).png", "Dreads(23).png", "Dreads(24).png"];
//Path on FTP to the orginal Dreard photos
var ftpPathToOrginalDreads = "img/dreads/large/";
var ftpPathToThumbDreads = "img/dreads/thumbs/";
var ftpPathToLogo = "img/dreads/";

//global variables for image editing/sizing/transform
var orginalPortraitWidth = 0;
var scaleddownMaxPortraitwidth = 0;
var portraitexiforientation = -1;
var portraitRotationDegree = 0;
var currentPortraitScale = 1.0;
var currentRotate = 0;
var transform = detectTransformProp();


function detectTransformProp() {
  var testElement = $('body');
  var transformProp;
  var transformProps = ["transform", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform"];

  for(var i = 0; i < transformProps.length; i++) {
    var tr = transformProps[i];

    if( testElement.css(tr) ) {
      transformProp = tr;
      break;
    }
  }

  if(!transformProp) {
    console.error('The property "transform" is not supported in this browser');
    transformProp = 'transform';
  }

  return transformProp;
}

//logo image for photo
var image = new Image(80, 80);
image.setAttribute("crossOrigin", 'anonymous');
image.src = ftpPathToLogo + 'logo.png';

//photo
var portrait = new Image();
portrait.setAttribute("crossOrigin", 'anonymous');

var result = new Image();
result.setAttribute("crossOrigin", 'anonymous');

//Main function
$(function () {

    //init DreadSelectionList
    initializeDreadSelectionList(dreadSelectionArray);

    //User portrait image changed / selected
    $("input:file").change(function () {
        $('#userPortrait').remove();
        // Let's store the FileList Array into a variable:
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        var files = this.files;
        // Let's create an empty `errors` String to collect eventual errors into:
        var errors = "";

        portraitRotationDegree = 0;

        if (!files) {
            errors += "File upload not supported by your browser.";
        }

        // Check for `files` (FileList) support and if contains at least one file:
        if (files && files[0]) {

            // Iterate over every File object in the FileList array
            for (var i = 0; i < files.length; i++) {

                // Let's refer to the current File as a `file` variable
                // https://developer.mozilla.org/en-US/docs/Web/API/File
                var file = files[i];

                // Test the `file.name` for a valid image extension:
                // (pipe `|` delimit more image extensions)
                // The regex can also be expressed like: /\.(png|jpe?g|gif)$/i
                if ((/\.(png|jpeg|jpg|gif)$/i).test(file.name)) {
                    // SUCCESS! It's an image!
                    // Send our image `file` to our `readImage` function!
                    // reset exifInformation
                    portraitexiforientation = -1;
                    readImage(file);
                }
                else {
                    errors += file.name + ": Unsupported Image extension\n";
                }
            }
        }

        // Notify the user for any errors (i.e: try uploading a .txt file)
        if (errors) {
            $('p#errors').html('<p id="errorText" style="color: #d9534f;font-size: 1.2rem">'+errors+'<p/>');
        }
        else{
            $('#errorText').remove();
        }
    });

    $("#zoomplus").on("click", function (e) {
        var newValue = currentPortraitScale + 0.15;
        var n = $('#userPortrait');
        var oldwidth = parseFloat(n.css("width"));
        var newWidth = oldwidth * newValue + "px";
        var oldHeight = parseFloat(n.css("height"));
        var newHeight = oldHeight * newValue + "px";
        var horizontal = parseFloat(n.css('left'))-(parseInt(newWidth,10)-parseInt(oldwidth,10))/2;
        var vertical = parseFloat(n.css('top'))-(parseInt(newHeight,10)-parseInt(oldHeight,10))/2;
        $('#userPortrait').css("width", newWidth);
        $('#userPortrait').css("top", vertical);
        $('#userPortrait').css("left", horizontal);
    });

    $("#zoomminus").on("click", function (e) {
        var newValue = currentPortraitScale - 0.15;
        var n = $('#userPortrait');
        var oldwidth = parseFloat(n.css("width"));
        var newWidth = oldwidth * newValue + "px";
        var oldHeight = parseFloat(n.css("height"));
        var newHeight = oldHeight * newValue + "px";
        var horizontal = parseFloat(n.css('left'))-(parseInt(newWidth,10)-parseInt(oldwidth,10))/2;
        var vertical = parseFloat(n.css('top'))-(parseInt(newHeight,10)-parseInt(oldHeight,10))/2;
        $('#userPortrait').css("width", newWidth);
        $('#userPortrait').css("top", vertical);
        $('#userPortrait').css("left", horizontal);
    });

    $(".btn-circle-up").on("click", function () {
        var offsets = document.getElementById('croppingArea').getBoundingClientRect();
        var portrait = document.getElementById('userPortrait');

        if(!portrait) {
          return;
        }

        var userPortrait = portrait.getBoundingClientRect();
        var top = offsets.top;
        var top1 = userPortrait.top;
        if (top1 - top > 10) {
            var n = $("#userPortrait");
            n.css('top', (parseFloat(n.css('top')) - 10) + 'px');
        }
    });

    $(".btn-circle-down").on("click", function () {
        var n = $("#userPortrait");
        n.css('top', (parseFloat(n.css('top')) + 10) + 'px');
    });

    $(".btn-circle-left").on("click", function () {
        var n = $("#userPortrait");
        n.css('left', (parseFloat(n.css('left')) - 10) + 'px');
    });

    $(".btn-circle-right").on("click", function () {
        var n = $("#userPortrait");
        n.css('left', (parseFloat(n.css('left')) + 10) + 'px');
    });

    $("#btn-circle-rotate-right").on("click", rotateFaceRight);
    $("#btn-circle-rotate-left").on("click", rotateFaceLeft);

    function rotateFaceRight() {
      rotateFace(+90);
    }

    function rotateFaceLeft() {
      rotateFace(-90);
    }

    function rotateFace(deg) {
      var target = $("#userPortrait");
      var rotateDeg = currentRotate + deg;

      target.css(transform, 'rotate(' + rotateDeg + 'deg)');
      currentRotate = rotateDeg;
    };

    // //selecting dreads and add to cropping area
    $(".thumbnail").on("click", function (e) {
        e.preventDefault();
        if ($('#userPortrait').length > 0) {
            if (!$(this).hasClass('active')) {
                $(".thumbnail").removeClass("active");
                $(this).addClass("active");
            }
            $(".ui-wrapper img").remove();

            //prepare dread img from selectionlist (thumbs)
            //create new img with orginal Dread photo
            var thumbdreadImgsrc = $(this).find('img').attr("src");
            var dreadPathArray = thumbdreadImgsrc.split('/');
            var filename = dreadPathArray[dreadPathArray.length - 1];

            var orginalDreadImgSrc = ftpPathToOrginalDreads + filename;

            var img = $('<img />', {
                id: 'userDreads',
                src: orginalDreadImgSrc,
                alt: 'dreadcanvas'
            });

            var loadingHtmlstring = "<div id='loading'><p><img src='Assets/img/busy.gif'/> Please Wait</p></div>";

            //important - wait for the image is loaded
            img.on('load', function () {
                img.prependTo($('#croppingArea'));
                $(".ui-wrapper").append(loadingHtmlstring);

                var ratio = 0;
                var width = $("#userDreads").width();    // Current image width
                var height = $("#userDreads").height();  // Current image height
                var maxWidth = 300 //$("#croppingArea").width();
                var maxHeight = 300; //$("#croppingArea").height();

                if (height > maxHeight) {
                    ratio = maxHeight / height; // get ratio for scaling image
                    $("#userDreads").css("height", maxHeight);   // Set new height
                    width = width * ratio;    // Reset width to match scaled image
                    $("#userDreads").css("width", width);    // Scale width based on ratio
                }

                //rotatable Options - defines angle of rotation
                var options = {
                    rotationCenterOffset: {
                        top: 0,
                        left: 0
                    }
                };

                //adding img editing options
                $("#userDreads").resizable({handles: "ne"});
                $("#userDreads").parent().rotatable(options);
                $("#userDreads").parent().css("z-index", 1);
                $("#userDreads").parent().draggable({appendTo: '#croppingArea', scroll: true});

                //place rotatable icon on top left
                $(".ui-rotatable-handle").prependTo(".ui-wrapper");

                //enable functional buttons
                $('.btn').removeClass("disabled");

                // innit multitouch
                allowFaceResizing();

                function allowFaceResizing() {
                  var evCache = new Array();
                  var prevDiff = -1;
                  // this var controls how quickly image will change its sizes
                  // by pinch/unpinch
                  var resizingSpeed = 2;

                  init();

                  function init() {
                   // Install event handlers for the pointer target
                   var el = document.getElementById("userDreads");
                   el.onpointerdown = pointerdown_handler;
                   el.onpointermove = pointermove_handler;

                   // Use same handler for pointer{up,cancel,out,leave} events since
                   // the semantics for these events - in this app - are the same.
                   el.onpointerup = pointerup_handler;
                   el.onpointercancel = pointerup_handler;
                   el.onpointerout = pointerup_handler;
                   el.onpointerleave = pointerup_handler;
                  }

                  function pointerdown_handler(ev) {
                   // The pointerdown event signals the start of a touch interaction.
                   // This event is cached to support 2-finger gestures
                   evCache.push(ev);
                  }


                  function pointermove_handler(ev) {
                   // This function implements a 2-pointer horizontal pinch/zoom gesture.

                   // Find this event in the cache and update its record with this event
                   for (var i = 0; i < evCache.length; i++) {
                     if (ev.pointerId == evCache[i].pointerId) {
                        evCache[i] = ev;
                     break;
                     }
                   }

                  // Param vector means in which way resize dread,
                  // -1 if deacrease or +1 if increase
                  function resizingDread(vector) {
                     var img = $('#userDreads');
                     var imgWrap = img.closest('.ui-wrapper');

                     var width = imgWrap.width();
                     var height = imgWrap.height();

                     img.width(width + (resizingSpeed * vector));
                     img.height(height + (resizingSpeed * vector));
                     imgWrap.width(width + (resizingSpeed * vector));
                     imgWrap.height(height + (resizingSpeed * vector));
                   }

                   // If two pointers are down, check for pinch gestures
                   if (evCache.length == 2) {
                     // Calculate the distance between the two pointers
                     var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

                     if (prevDiff > 0) {
                       if (curDiff > prevDiff) {
                         // The distance between the two pointers has increased
                           resizingDread(+1);
                       }
                       if (curDiff < prevDiff) {
                         // The distance between the two pointers has decreased
                           resizingDread(-1);
                       }
                     }

                     // Cache the distance for the next move event
                     prevDiff = curDiff;
                   }
                  }

                  function pointerup_handler(ev) {
                    // Remove this pointer from the cache and reset the target's
                    // background and border
                    remove_event(ev);

                    // If the number of pointers down is less than two then reset diff tracker
                    if (evCache.length < 2) prevDiff = -1;
                  }

                  function remove_event(ev) {
                   // Remove this event from the target's cache
                   for (var i = 0; i < evCache.length; i++) {
                     if (evCache[i].pointerId == ev.pointerId) {
                       evCache.splice(i, 1);
                       break;
                     }
                   }
                  }
                }
            });
            $("#loading").remove();
        }
    });
});

//File selection dialog with Filereader and exception handling
var useBlob = false && window.URL;

function readImage(file) {

    // Create a new FileReader instance
    // https://developer.mozilla.org/en/docs/Web/API/FileReader
    var reader = new FileReader();

    //check image exif metadate (mobile photos)
    //affects initial rotation
    preRotateImage(file);

    // Once a file is successfully readed:
    reader.addEventListener("load", function () {
        // At this point `reader.result` contains already the Base64 Data-URL
        // and we've could immediately show an image using
        // `elPreview.insertAdjacentHTML("beforeend", "<img src='"+ reader.result +"'>");`
        // But we want to get that image's width and height px values!
        // Since the File Object does not hold the size of an image
        // we need to create a new image and assign it's src, so when
        // the image is loaded we can calculate it's width and height:
        /*var image = new Image();
        image.setAttribute("crossOrigin", 'anonymous');
*/
        portrait.addEventListener("load", function () {
            var image = $(this);
            var area = $("#croppingArea");
            //remove old images
            area.empty();

            //exif metadata rotation applying
            switch (portraitexiforientation) {
                case -1:
                    portraitRotationDegree = 0;
                    break;
                case 1:
                    portraitRotationDegree = 0;
                    break;
                case 2:
                    portraitRotationDegree = 0;
                    break;
                case 3:
                    portraitRotationDegree = 180;
                    break;
                case 4:
                    portraitRotationDegree = 180;
                    break;
                case 5:
                    portraitRotationDegree = 90;
                    break;
                case 6:
                    portraitRotationDegree = 90;
                    break;
                case 7:
                    portraitRotationDegree = 270;
                    break;
                case 8:
                    portraitRotationDegree = 270;
                    break;
            }

            image.prop("id", "userPortrait");

            area.empty();

            // Finally append our created image
            area.append(this);
            resetMetrics();
            checkImageWidth();

            function resetMetrics() {
              image.css({
                top: '',
                left: '',
                width: '',
                transform: 'rotate(0deg)'
              });

              currentRotate = 0;
            }

            // if image is wider than canvas, its width will be equal canvas width
            function checkImageWidth() {
              var imageWidth = image.width();
              var areaWidth = area.width();

              if(imageWidth > areaWidth) {
                image.width(areaWidth);
              }
            }

            //activate zoom buttons
            if (window.innerWidth<640){
                $(".controls").css("display", "flex");
            }

            var portraitwidth = $("#userPortrait").width();
            var portraitheight = $("#userPortrait").height();

            if (portraitexiforientation > 4) {
                $(this).css('transform', 'rotate(' + portraitRotationDegree + 'deg)')
                //switch height and width after rotated
                //todo - do this in switch case degree
                // portraitwidth = $("#userPortrait").height();
                // //reset width / height
                // $("#userPortrait").width(portraitwidth);
            }

            $("#userPortrait").draggable({appendTo: "#croppingArea"})

            if (useBlob) {
                // Free some memory for optimal performance
                window.URL.revokeObjectURL(portrait.src);
            }
        });
        portrait.src = useBlob ? window.URL.createObjectURL(file) : reader.result;
    });
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
    reader.readAsDataURL(file);
}

function initializeDreadSelectionList(dreadSelectionArray) {
    $.each(dreadSelectionArray, function (index, item) {
        $("#dreadSelectionList").append(
            '<a href="#" class="thumbnail"><img src="'
            + ftpPathToThumbDreads + item + '"/></a>');
    });
}

//Exif Metadata handling
function preRotateImage(file) {
    var binfR = new FileReader();

    binfR.addEventListener("load", function () {

        var view = new DataView(binfR.result);

        if (view.getUint16(0, false) != 0xFFD8) {
            portraitexiforientation = -2;
        }
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    portraitexiforientation = -1;
                }
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        portraitexiforientation = view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
    });
    binfR.readAsArrayBuffer(file);
}

//calculates Degree value of Rotation Transformation Matrix (css helper)
function getCurrentRotationFixed(elid, searchOnParent) {
    var el;
    var st;
    var tr;
    if (searchOnParent) {
        el = document.getElementById(elid).parentNode;
        st = window.getComputedStyle(el, null);
        tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform") ||
            "fail...";
    }
    else {
        el = document.getElementById(elid);
        st = window.getComputedStyle(el, null);
        tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform") ||
            "fail...";
    }

    if (tr !== "none") {
        var values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];

        var scale = Math.sqrt(a * a + b * b);
        var radians = Math.atan2(b, a);
        if (radians < 0) {
            radians += (2 * Math.PI);
        }
        var angle = Math.round(radians * (180 / Math.PI));
    }
    else {
        var angle = 0;
    }
    return angle;
}

document.getElementById("btnExport").addEventListener('click', exportPhoto);
document.getElementById("mbtnExport").addEventListener('click', exportPhoto);

function exportPhoto() {
    $(".final-logo").css("display","block");
    $(".final-sign").css("display","inline-block");
    $(".controls").css("display","none");
    $(".mobile-buttons").css("display","none");
    $(".step-two-portrait").css("background-color","#3c3c3c");
    $(".ui-rotatable-handle").css("display","none");
    $(".ui-resizable-handle").css("display","none");
    var pic = $("#picture")[0];
    domtoimage.toPng(pic)
    .then(function (dataUrl) {
        document.getElementById("final-img").src = dataUrl;
        handleStepChange('step-three');
    })
    .then(function(){
        $(".final-logo").css("display","none");
        $(".final-sign").css("display","none");
        $(".controls").css("display","inline-block");
        if (window.innerWidth<640) {$(".mobile-buttons").css("display","block");}
        $(".step-two-portrait").css("background-color","#ececec");
        $(".ui-wrapper").css("padding-top","0");
        $(".ui-rotatable-handle").css("display","block");
        $(".ui-resizable-handle").css("display","block");
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
}
