var numWindows, numTabs, parentId;

function handler(parentFolder, folderName, closeWindows)
{
	/// Preprocessing stuff...
	parentId = parentFolder.substring(0, parentFolder.indexOf(" |"));
	numTabs  = 0;

	/// Kick it all off
	checkIfFolderExists(parentId, folderName, closeWindows);
}

function checkIfFolderExists(parentId, folderName, closeWindows)
{
	chrome.bookmarks.getSubTree
	(
		parentId,

		function(tree)
		{
			console.log("Checking if folder exists...");
			console.log(tree);

			for(var i = 0; i < tree[0].children.length; i++)
			{
				var subElement = tree[0].children[i];

				if(subElement.hasOwnProperty("children") && //Check for folder...
				   subElement.title == folderName)       //..and now check name
				{
					//If the folder already exists...
					console.log("Specified folder already exists; scanning..");
					getOffset(subElement.id, closeWindows);
					return;
				}
			}

			//If folder doesn't already exist, continue normally
			createParentFolder(parentId, folderName, closeWindows);
		}
	);
}

function createParentFolder(parentID, folderName, closeWindows)
{
	chrome.bookmarks.create
	(
		{
			'parentId' : parentId,
			'title'    : folderName
		},

		function(newFolder)
		{
			console.log("Created folder " + newFolder.title);
			bookmarkAll(newFolder.id, closeWindows, 0);
		}
	);
}

function getOffset(parentFolderId, closeWindows)
{
	var highest = 0;

	chrome.bookmarks.getSubTree
	(
		parentFolderId,

		function(tree)
		{
			for(var i = 0; i < tree[0].children.length; i++)
			{
				var subElement = tree[0].children[i];

				if(subElement.hasOwnProperty("children") &&
				   subElement.title.indexOf("Window ") != -1)
				{
					var number = parseInt(subElement.title.substring(subElement.title.indexOf(" ")));
					highest = Math.max(highest, number);
				}
			}

			console.log("Starting at Window " + (highest + 1));
			bookmarkAll(parentFolderId, closeWindows, highest);
		}
	)
}

function bookmarkAll(parentFolderId, closeWindows, offset)
{
	chrome.windows.getAll
	(
		{
			populate : true
		},

		function(windows)
		{
			numWindows = windows.length;

			for(var a = 0; a < windows.length; a++)
			{
				bookmarkWindow(parentFolderId, a+1+offset, windows[a], closeWindows);
			}
		}
	);
}

function bookmarkWindow(parentFolderId, windowNumber, window, closeWindows)
{
	chrome.bookmarks.create
	(
		{
			'parentId' : parentFolderId,
			'title'	   : ("Window " + windowNumber)
		},

		function(windowFolder)
		{
			console.log("** Created folder " + windowFolder.title + "...");

			numTabs += window.tabs.length;

			for(var b = 0; b < window.tabs.length; b++)
			{
				var tab = window.tabs[b];

				chrome.bookmarks.create
				(
					{
						'parentId' : windowFolder.id,
						'title'    : tab.title,
						'url'	   : tab.url
					}
				);
			}

			closeWindow(window.id, closeWindows);
		}
	);
}

function closeWindow(windowId, closeWindows)
{

	if(closeWindows)
	{
		chrome.windows.remove
		(
			windowId,

			function()
			{
				console.log("## Closed window " + windowId);
				numWindows--;
				finish();
			}
		);
	}
	else
	{
		numWindows--;
		finish();
	}
}

function finish()
{
	if(numWindows == 0)
	{
		console.log("All windows (supposedly) closed, exiting...");
		alert(numTabs + " tabs bookmarked. Finished!");
	}
}

console.log("background.js loaded.");

/* * * * * * * * * * * * *
 * AUTHOR:  Rahul Butani *
 * DATE:    Aug 11, 2016 *
 * VERSION: 0.3.0        *
 * * * * * * * * * * * * */