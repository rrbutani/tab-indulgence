// var numWindows, numTabs = 0, parentId;

// function handler(parentFolder, folderName, closeWindows)
// {
// 	/// Preprocessing stuff...
// 	parentId = parseInt(parentFolder.substring(0, parentFolder.indexOf(" |")));

// 	/// Kick it all off
// 	createParentFolder(parentId, folderName, closeWindows);
// }

// function createParentFolder(parentID, folderName, closeWindows)
// {
// 	chrome.bookmarks.create
// 	(
// 		{
// 			'parentId' : parentId,
// 			'title'    : folderName,
// 			function(newFolder)
// 			{
// 				console.log("Created folder " + newFolder.title);
// 				bookmarkAll(newFolder.id, closeWindows);
// 			}
// 		}
// 	);
// }

// function bookmarkAll(parentFolderId, closeWindows)
// {
// 	chrome.windows.getAll
// 	(
// 		{
// 			populate : true
// 		},

// 		function(windows)
// 		{
// 			numWindows = windows.length;

// 			for(var a = 0; a < windows.length; a++)
// 			{
// 				bookmarkWindow(parentFolderId, a+1, windows[a]);
// 			}
// 		}
// 	);
// }

// function bookmarkWindow(parentFolderId, windowNumber, window, closeWindows)
// {
// 	chrome.bookmarks.create
// 	(
// 		{
// 			'parentId' : parentFolderId,
// 			'title'	   : ("Window " + windowNumber),

// 			function(windowFolder)
// 			{
// 				console.log("** Created folder " + windowFolder.title + "...");

// 				numTabs += window.tabs.length;

// 				for(var b = 0; b < window.tabs.length; b++)
// 				{
// 					var tab = window.tabs[b];

// 					chrome.bookmarks.create
// 					(
// 						{
// 							'parentId' : windowFolder.id,
// 							'title'    : tab.title,
// 							'url'	   : tab.url
// 						}
// 					);
// 				}

// 				closeWindow(window.id, closeWindows);
// 			}
// 		}
// 	);
// }

// function closeWindow(windowId, closeWindows)
// {
// 	if(closeWindows)
// 	{
// 		chrome.windows.remove
// 		(
// 			windowId,

// 			function()
// 			{
// 				console.log("## Closed window " + windowId);
// 				numWindows--;
// 				finish();
// 			}
// 		);
// 	}
// 	else
// 	{
// 		numWindows--;
// 		finish();
// 	}
// }

// function finish()
// {
// 	if(numWindows == 0)
// 	{
// 		console.log("All windows (supposedly) closed, exiting...");
// 		alert(numTabs + " tabs bookmarked. Finished!");
// 	}
// }

// console.log("background.js loaded.");

// /* * * * * * * * * * * * *
//  * AUTHOR:  Rahul Butani *
//  * DATE:    Août 9, 2016 *
//  * VERSION: 0.0.1        *
//  * * * * * * * * * * * * */