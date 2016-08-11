var excludeSessionSaves = true;
var maxDepthParentFoldr = (1 + (2 * (2)));

var rawBkmrkTree;
var folderNames = [];

$(document).ready(function()
{
  var reload = document.getElementById("reload");
  reload.addEventListener("click",

    function()
    {
      // Get current bookmark folders/subfolders...
      chrome.bookmarks.getTree
      (
        //numEntriesParentPTH,

        function(tree)
        {
          updateStatus("Getting tree...");
          
          rawBkmrkTree = tree;

          folderNames = [];
          cleanTree(rawBkmrkTree[0], "");

          localStorage["savedFolderStructure"] = JSON.stringify(folderNames);

          populateParentFolderOptions(folderNames);

          $('select option:contains(' + localStorage["defaultParentFolder"]+ ')').prop('selected',true);

          updateStatus("Choose options:");
        }
      );
    },

    false
  );

  if(localStorage["savedFolderStructure"])
  {
    folderNames = JSON.parse(localStorage["savedFolderStructure"]);
  }

  populateParentFolderOptions(folderNames);

  // $('select option:contains(' + localStorage["defaultParentFolder"]+ ')').prop('selected',true);
  $(':checkbox').prop('checked',localStorage["closeWindowsBoolean"]);
  $('#fName').val("Session Save Data ".concat(formattedDate(new Date())));

  updateStatus("Choose options:");

  $('form').on('submit', function()
    {
      console.log("Form submitted");

      // var $inputs = $('#params :input');

      // var values = {};
      // $inputs.each(function() {
      //     values[this.name] = $(this).val();
      // });

      var tValues = $('form').serializeArray();//$(this).serialize();
      var values  = {};

      tValues.forEach(
        function(a)
        {
          values[a.name] = a.value;
        }
      );

      processSubmit(values);
    });

});

// $(function() {
//     var update = function() {
//         $('#serializearray').text(        
//             JSON.stringify($('form').serializeArray())
//         );
//         $('#serialize').text(        
//             JSON.stringify($('form').serialize())
//         );
//     };
//     update();
//     $('form').change(update);
// })

function processSubmit(data)
{
  // Status updates...
  updateStatus("Processing...");
  console.log("recieved this form data:")
  console.log(data);

  // Save parent folder / close windows choice for next time..
  localStorage["defaultParentFolder"] = data["parentFolder"];
  localStorage["closeWindowsBoolean"] = data["closeWindows"];

  // Do the thing
  updateStatus("Running...");
  chrome.extension.getBackgroundPage().handler(data["parentFolder"], data["folderName"], data["closeWindows"]);

}

function updateStatus(statusText)
{
  document.getElementById('status').textContent = statusText;
}

function populateParentFolderOptions(filteredTree)
{
  updateStatus("Populating Folder Options...");
  // console.log("Populating Location Select");
  // console.log(filteredTree);

  var fragment = document.createDocumentFragment();

  folderNames.forEach(function(fName, index)
  {
    var opt       = document.createElement('option');
    opt.innerHTML = fName;
    opt.value     = fName;
    fragment.appendChild(opt);
  });

  if(localStorage['inject'] != "undefined")
  {
    var opt       = document.createElement('option');
    opt.innerHTML = localStorage['inject'];
    opt.value     = localStorage['inject'];
    fragment.appendChild(opt);
  }

  document.getElementById('location').innerHTML = "";
  document.getElementById('location').appendChild(fragment);

  $('select option:contains(' + localStorage["defaultParentFolder"]+ ')').prop('selected',true);

  return;
}

function cleanTree(raw, prepend)
{
  updateStatus("Cleaning tree...");

  //console.log("DebugA: Called with");
  //console.log("Processing " + raw.title);

  /// Check if top element is a (valid) folder

  // First check if element is a folder
  if(!raw.hasOwnProperty("children"))
  {
    //console.log("DebugB: Element is not a folder, exiting.")
    return;
  }

  // If the folder is a "Window #" or "Session Save Data" folder, go no further
  if( 
      excludeSessionSaves == true &&
      ( 
        raw.title.indexOf("Window") != -1 ||
        raw.title.indexOf("Session Save Data") != -1
      )
    )
  {
    return;
  }

  // If folder name isn't empty, add it to za list (basically, don't add the 
  // root folder)
  if(raw.title)
  {
    //console.log("Adding " + raw.title + "...");
    folderNames.push(standardizeNumber(raw.id, 6).concat(" | ").concat(prepend).concat(raw.title));
  }


  /// Now process the element's children

  for(var i = 0; i < raw.children.length; i++)
  {
    var child = raw.children[i];
    //console.log("index is at " + i);
    // If the child is a folder, send it through the process...
    if(child.hasOwnProperty("children"))
    {
      if(prepend.length < maxDepthParentFoldr)
      {
        cleanTree(child, "> ".concat(prepend));
      }
    }
  }

  return;
}

function standardizeNumber(numString, requiredChars)
{
  while(numString.length < requiredChars)
  {
    numString = "0".concat(numString);
  }

  return numString;
}

function formattedDate(d) 
{
  function pad(n) { return n<10 ? '0'+n : n }

  return pad(d.getMonth()+1) + '/'
       + pad(d.getDate())    + '/'
       + d.getFullYear();
}

// // Copyright (c) 2014 The Chromium Authors. All rights reserved.
// // Use of this source code is governed by a BSD-style license that can be
// // found in the LICENSE file.

// /**
//  * Get the current URL.
//  *
//  * @param {function(string)} callback - called when the URL of the current tab
//  *   is found.
//  */
// function getCurrentTabUrl(callback) {
//   // Query filter to be passed to chrome.tabs.query - see
//   // https://developer.chrome.com/extensions/tabs#method-query
//   var queryInfo = {
//     active: true,
//     currentWindow: true
//   };

//   chrome.tabs.query(queryInfo, function(tabs) {
//     // chrome.tabs.query invokes the callback with a list of tabs that match the
//     // query. When the popup is opened, there is certainly a window and at least
//     // one tab, so we can safely assume that |tabs| is a non-empty array.
//     // A window can only have one active tab at a time, so the array consists of
//     // exactly one tab.
//     var tab = tabs[0];

//     // A tab is a plain object that provides information about the tab.
//     // See https://developer.chrome.com/extensions/tabs#type-Tab
//     var url = tab.url;

//     // tab.url is only available if the "activeTab" permission is declared.
//     // If you want to see the URL of other tabs (e.g. after removing active:true
//     // from |queryInfo|), then the "tabs" permission is required to see their
//     // "url" properties.
//     console.assert(typeof url == 'string', 'tab.url should be a string');

//     callback(url);
//   });

//   // Most methods of the Chrome extension APIs are asynchronous. This means that
//   // you CANNOT do something like this:
//   //
//   // var url;
//   // chrome.tabs.query(queryInfo, function(tabs) {
//   //   url = tabs[0].url;
//   // });
//   // alert(url); // Shows "undefined", because chrome.tabs.query is async.
// }

// /**
//  * @param {string} searchTerm - Search term for Google Image search.
//  * @param {function(string,number,number)} callback - Called when an image has
//  *   been found. The callback gets the URL, width and height of the image.
//  * @param {function(string)} errorCallback - Called when the image is not found.
//  *   The callback gets a string that describes the failure reason.
//  */
// function getImageUrl(searchTerm, callback, errorCallback) {
//   // Google image search - 100 searches per day.
//   // https://developers.google.com/image-search/
//   var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
//     '?v=1.0&q=' + encodeURIComponent(searchTerm);
//   var x = new XMLHttpRequest();
//   x.open('GET', searchUrl);
//   // The Google image search API responds with JSON, so let Chrome parse it.
//   x.responseType = 'json';
//   x.onload = function() {
//     // Parse and process the response from Google Image Search.
//     var response = x.response;
//     if (!response || !response.responseData || !response.responseData.results ||
//         response.responseData.results.length === 0) {
//       errorCallback('No response from Google Image search!');
//       return;
//     }
//     var firstResult = response.responseData.results[0];
//     // Take the thumbnail instead of the full image to get an approximately
//     // consistent image size.
//     var imageUrl = firstResult.tbUrl;
//     var width = parseInt(firstResult.tbWidth);
//     var height = parseInt(firstResult.tbHeight);
//     console.assert(
//         typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
//         'Unexpected respose from the Google Image Search API!');
//     callback(imageUrl, width, height);
//   };
//   x.onerror = function() {
//     errorCallback('Network error.');
//   };
//   x.send();
// }



// document.addEventListener('DOMContentLoaded', function() {
//   getCurrentTabUrl(function(url) {
//     // Put the image URL in Google search.
//     renderStatus('Performing Google Image search for ' + url);

//     getImageUrl(url, function(imageUrl, width, height) {

//       renderStatus('Search term: ' + url + '\n' +
//           'Google image search result: ' + imageUrl);
//       var imageResult = document.getElementById('image-result');
//       // Explicitly set the width/height to minimize the number of reflows. For
//       // a single image, this does not matter, but if you're going to embed
//       // multiple external images in your page, then the absence of width/height
//       // attributes causes the popup to resize multiple times.
//       imageResult.width = width;
//       imageResult.height = height;
//       imageResult.src = imageUrl;
//       imageResult.hidden = false;

//     }, function(errorMessage) {
//       renderStatus('Cannot display image. ' + errorMessage);
//     });
//   });
// });

/* * * * * * * * * * * * *
 * AUTHOR:  Rahul Butani *
 * DATE:    Aug 11, 2016 *
 * VERSION: 0.2.0        *
 * * * * * * * * * * * * */
