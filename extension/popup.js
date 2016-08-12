var excludeSessionSaves = true;
var maxDepthParentFoldr = (1 + (2 * (2)));

var parentFolderOptions = [];

$(document).ready(function()
{
  // Load saved parentFolderOptions
  if(localStorage["savedPFOs"]){ parentFolderOptions = JSON.parse(localStorage["savedPFOs"]); }

  // Populate the select - even if there were no saved PFOs since there may be an inject..
  populateParentFolderOptions(parentFolderOptions);

  // Set close windows option to saved setting
  $(':checkbox').prop('checked',localStorage["closeWindowsBoolean"]);

  // Set folder name to formatted date (default entry)
  $('#fName').val("Session Save Data ".concat(formattedDate(new Date())));

  // Status update
  updateStatus("Choose options:");

  // Add Listeners and brace for impact..
  document.getElementById("reload").addEventListener("click", reloadParentFolderOptions(), false);
  $('form').on('submit', processSubmit);
});

function reloadParentFolderOptions()
{
  // Get current bookmark folders/subfolders...
  chrome.bookmarks.getTree
  (
    function(tree)
    {
      // Status Updates
      updateStatus("Getting tree...");
      
      // Process and clean the bookmark tree
      parentFolderOptions = []; // Reset parent folder options since we're reloading..
      cleanTree(tree[0], "");   // And now clean the tree and save into parentFolderOptions

      // Save the parent folder options (PFOs) for future use (speeds things up)
      localStorage["savedPFOs"] = JSON.stringify(parentFolderOptions);

      // And now populate the select
      populateParentFolderOptions(parentFolderOptions);

      // Status updates
      updateStatus("Choose options:");
    }
  );
}

function processSubmit()
{
  // Status updates...
  updateStatus("Form submitted; Processing...");

  // Get Form data
  var tValues = $('form').serializeArray(), data = {};     //Get form values
  tValues.forEach(function(a){ data[a.name] = a.value; }); //And format form values

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
  // Status Updates..
  updateStatus("Populating Folder Options...");

  // Add the inject if it exists..
  if(localStorage['inject'] != "undefined")
  {
    parentFolderOptions.push(localStorage['inject']);
  }

  // Process all the PFOs and add them to a fragment..
  var fragment = document.createDocumentFragment();

  parentFolderOptions.forEach(function(fName, index)
  {
    var opt       = document.createElement('option');
    opt.innerHTML = fName;
    opt.value     = fName;
    fragment.appendChild(opt);
  });

  // Now add them to the select..
  document.getElementById('location').innerHTML = "";        //First clear the select (gets rid 
                                                             //of saved or old options)...
  document.getElementById('location').appendChild(fragment); //..and now add the new ones.

  // Finally, default select the option that was selected last time
  $('select option:contains(' + localStorage["defaultParentFolder"]+ ')').prop('selected',true);

  return;
}

function cleanTree(raw, prepend)
{
  updateStatus("Cleaning tree...");

  // First check if element is a folder -- technically not needed.
  if(!raw.hasOwnProperty("children"))
  {
    return;
  }

  // If the folder is a "Window #" or "Session Save Data" folder, go no further (if specified)
  if( excludeSessionSaves == true &&
      ( raw.title.indexOf("Window") != -1 ||
        raw.title.indexOf("Session Save Data") != -1
      )
    )
  {
    return;
  }

  // If folder name isn't empty, add it to za list (basically, don't add the root folder)
  if(raw.title)
  {
    parentFolderOptions.push(padNumber(raw.id, "000000").concat(" | ").concat(prepend).concat(raw.title));
  }


  /// Now process the element's children
  for(var i = 0; i < raw.children.length; i++)
  {
    var child = raw.children[i];

    if(child.hasOwnProperty("children") &&       // If the child is a folder...
       prepend.length < maxDepthParentFoldr)     // ..and if under the depth limit...
    {
        cleanTree(child, "> ".concat(prepend));  // ..send it through the process.
    }
  }

  return;
}

// function standardizeNumber(numString, requiredChars)
// {
//   while(numString.length < requiredChars)
//   {
//     numString = "0".concat(numString);
//   }

//   return numString;
// }

function padNumber(numString, padString)
{
  if(numString.length < padString.length)
    return padString.substring(0, padString.length - numString.length).concat(numString);

  return numString;
}

function formattedDate(d) 
{
  function pad(n) { return n<10 ? '0'+n : n }

  return pad(d.getMonth()+1) + '/'
       + pad(d.getDate())    + '/'
       + d.getFullYear();
}

// Form Debug Code...
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

/* * * * * * * * * * * * *
 * AUTHOR:  Rahul Butani *
 * DATE:    Aug 11, 2016 *
 * VERSION: 0.3.1        *
 * * * * * * * * * * * * */
