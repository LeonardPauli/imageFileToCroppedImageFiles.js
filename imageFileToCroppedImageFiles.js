/*

Title: imageFileToCroppedImageFiles.js
Original creator: Leonard Pauli
Date: 18/3-2015
License: MIT

Functions:

aspectContainImageCrop(image, size, isPng) -> Image
imageFileToCroppedImageFiles(file, sizes, callback) (files)

getImageFromSrc(src, callback) (image)
getImageFromFile(file, callback) (image)

dataURItoBlob(dataURI) -> Blob

*/


function aspectContainImageCrop(image, size, isPng) {

  // Get smallest source/destination size factor
  var scale = Math.min(image.width/size.w, image.height/size.h);

  // Scale destination so that smallest
  // side matches smallest source side
  var toSize = {
    w:size.w*scale,
    h:size.h*scale
  };
  
  // Final can be smaller than or equal destination
  var imageScale = Math.min(1,size.w/toSize.w);

  // If final smaller than source,
  // cut overflow to center image
  var cutStart = {
    x:(image.width-toSize.w)/2,
    y:(image.height-toSize.h)/2
  };
  console.log(imageScale, toSize);
  
  // Get a canvas to draw on
  var canvas = $('<canvas/>');
  canvas.attr({width:toSize.w*imageScale,height:toSize.h*imageScale});
  canvas.hide().appendTo('body');

  var ctx = canvas.get(0).getContext('2d');
  
  // Cut and resize image by drawing it scaled in a frame
  ctx.drawImage(image, cutStart.x, cutStart.y, toSize.w, toSize.h, 0, 0, toSize.w*imageScale, toSize.h*imageScale);
  
  // Convert image to data
  var base64ImageData;
  if (isPng) base64ImageData = canvas.get(0).toDataURL("image/png");
  else base64ImageData = canvas.get(0).toDataURL("image/jpeg", 0.8);

  // Clean up
  canvas.remove();

  return base64ImageData;
}

window.getImageFromSrc = function(src, callback) {
  if (!src) return callback();
  
  var image = new Image();
  image.onload = function() {
    callback(image);
  }
  image.src = src;
}

window.getImageFromFile = function(file, callback) {
  if (!file) return callback();
  
  var image = new Image();
  image.onload = function() {
    callback(image);
    URL.revokeObjectURL(image.src)
  }
  image.src = URL.createObjectURL(file);
}

window.dataURItoBlob = function(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

window.imageFileToCroppedImageFiles = function(file, sizes, callback) {
  var isPng = file.type==="image/png";
  getImageFromFile(file, function (original) {
    if (!original) return callback();

    var files = [];
    for (var i = 0; i<sizes.length; i++)
      files[files.length] = dataURItoBlob(aspectContainImageCrop(original, sizes[i], isPng));
    
    return callback(files);
  });
}