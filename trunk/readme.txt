Unofficial Pirate Quest Sidebar
v2.0b1
Created by Jonathan Fingland aka Gilgalad
readme date: 2009-03-18

WARNING:This extension, although approved by PQ staff, is in no way an official Pirate Quest extension.
This extension does not protect you from the PQ rules. If you would get frozen/banned for behaviour using 
the regular PQ interface, then you will get frozen/banned for doing it through the sidebar. 



Feedback
--------

I want your feedback. Please message me in-game (Gilgalad) or via email at pqsidebar@ashita.org
Now, when I say I want your feedback, I mean "hey, I did X, Y, Z, and firefox crashed.", or "X didn't work", 
or "I'd really like to see feature X in the next release" NOT "you suck and should die.", "Your sidebar suXX0rz", etc.

If something doesn't work, please check the Error Console (Tools->Error Console) and tell me of any errors related to this sidebar. 
The errors will have the source in small writing. My files are all under chrome://piratequesting/.  At time of writing, 
the piratequest.net site has 4 warnings and 2 errors on EVERY page. Those have nothing to do with the piratequesting sidebar. 



Installation instructions
-------------------------

The piratequesting.xpi should be all you need. There aren't any options to configure right now (It won't login for you or anything)

To enable the sidebar, go to the View menu->Sidebar->Pirate Questing. Or press Ctrl+Shift+E.



Notes
-----

The 2.0b3 release is a _beta_. It will have bugs. Please let me know what you find And I'll do my best to resolve them.

And of course, Happy Pirating!



Version History
---------------

v2.0b3
- Should fix the problem with loading duplicate overlays. now check for duplicate non-null tab ids and tabpanel ids, as well as duplicate filenames

v2.0b2
- changes the loadOverlay observer to reveal the sidebar content  even in the event of a failure
- refactored the ProcessResponse to remove the text-to-document conversion and make that a separate function, thus allowing for more specialized uses (in this case, processing prices from the item market)
- fixes TrainingLog and FightLogViewer/FightLog so the update button/command works as expected
- Changed the event that's fired when only updating points.
- Inventory now only updates the points if that's the only part that changed.
- Equipment no longer requests the item guide when there's missing info for anything other than equipment
- Fixed Player info processing so stats over 1000 are processed correctly (failed to process correctly when there were commas)

v2.0b1
- Massive update. Essentially a complete rewrite.

v1.1.1
- BugFix: Corrected an oversight on my part in the last release

v1.1
- Changed how item use and point actions are performed to reflect changes on the site
- Added new way of updating stats to accomodate the changes above

v1.0.9
- Fixed fight processing again. FM changed it *right* after the sidebar update

v1.0.8
- Fixed item guide processing bug
- Fixed Item guide and inventory record multi-processing bug
- Fixed Fight processsing bug-- will likely need to be fixed again after PQ fixes some bugs on their side.

v1.0.7
- Fixed item market price check bug

v1.0.6
- Fixed inventory check (tags changed slightly)
- Fixed hand code (source image location changed)

v1.0.5
- Added hand code notifier in the training section
- Added mugging countdown timer to each mugging page
- Fixed bug in server clock

v1.0.4
- Fixed Item Guide processing
- Added Delete options for Item Guide Reference and Inventory Record

v1.0.3
- Fixed hand code non-display error
- Fixed training chance omission
- Fixed logging of training chance
- Fixed Armor menu display
- Fixed order in which adjusted attributes are calculated

v1.0.2
- Fixed training related bugs. all three methods of training should now work with the site updates
- Fixed error that was occurring when the player lost a battle
- Fixed bug of not recognizing prize value after a fight (due to site changes)
- Fixed Inventory update problems (due to changing of spelling on site)
- Optimized points and edibles use so they are now faster and involve only one request to the site.

v1.0.1
- significant changes made to accomodate site layout changes to the PirateQuest site.
- no new features added in this release

v1.0 
 - fixed bug that occurred when trying to attack while the player had insufficient energy, was in hospital or in prison.
 - fixed bug that occurred after Final Motive changed the attack page. This caused the formatter and logging system to fail.

v1.0rc1
 - Moved database info to the log pages so they no longer rely on having the sidebar open
 - Changed page processing a little so it no longer uses the user data as indicator that the user is logged in. 
 	Now uses the logout button to indicate that.
 - Fixed fight processing and logging. Final Motive (the game company) changed the fight page. Now works as well as before the change
 - Added more descriptive error messages in most places.
 - Fixed equipment menu update. If the stored item guide didn't have an item in your inventory, the user would get an error. 
 	The system now gets the new version of the item guide and tries again. If it fails again, it skips that entry and moves on.   

v1.0b5
 - fixed a small bug with the training system. Recent code changes had broken the train by percentage feature 

v1.0b4
 - fixed ship identification. the new ships were still not being recognized correctly
 - fixed fight log error which caused the opponent stats to be recorder incorrectly
 - fixed the battle converter to handle people with $ in their name
 - improved the sorting on logs  

v1.0b3
 - fixed logs so they show properly in Firefox 2
 - other minor enhancements

v1.0b2
 - added various copy and delete operations to the log. Right-clicking will bring up a menu on selected items.
 - added number rolled and success chance to the training log data

v1.0b1
 - Complete re-organization of the code
 - eliminated extra bank request to get the coins/chest values. Sidebar does the math instead.
 - fixed a serious bug in which the sidebar was making additional requests unbeknownst to me.
 - changed fight and training logs to sqlite database tables. now should be much faster when the logs get big
 	also allows more opportunity for analyzing the data
 - Notes: 
 	- speed isn't adjusted for offhands
 	- battle parser still probably messes up on certain combinations of equipment 		

v0.2.08
 - Added Support for Firefox 3.0.1
 - Hopefully Fixed support for new ships
 - Fixed battle formatter to allow disguises.... may not be perfect as I suspect the Mayan Spear is still causing problems  

v0.2.07
 - Added Abort buttons to Ajax request "Please Wait..." windows
 - Improved price result display for selling and marketing items
 - Corrected Adjusted stats display to fit with PQ's slightly screwy Speed calculations
 - Other minor improvements 

v0.2.06
 - Fixed code and about windows as FF3 broke them a little.

v0.2.05
 - Improved support for Firefox 3 RC1. Logs now work properly.

v0.2.04
 - Updated to support Firefox 3 RC1. Support incomplete.

v0.2.03
 - BugFix: Added another server address for PQ to reflect the server move. Old addresses remain as they still function.
 - Added Clear events button

v0.2.02
 - BugFix: fixed another bug with the clock - my bad :(

v0.2.01
 - BugFix: fixed the clock. it was not updating properly since PQ no longer provides a date with the time.
 - BugFix: Fixed a training bug whereby having the left hand menu turned off would cause it to fail to report the results

v0.2.00
 - New minor version number to reflect the significant changes made due to site layout modifications by FM
 - functionality the same as previous version (v0.1.20)

v0.1.20
 -Added checkbox to switch to adjusted stats view

v0.1.19
 -Fixed battle bug
 -Added links to Item guide and Fortune Teller.

v0.1.18
 - Added Fight Log
 - Prettied up the Fight results
 - switched the order of point actions and edibles 
 - Added Server Clock
 - Added Message and Event Notifications
 - Added Tabs for Logs and Links
 - Fixed Price check which broke when FM changed the layout a little

v0.1.17
 - Added Points to the inventory list including market and check prices.
 - Added tooltips to item equipping
 - Added stat/attribute information to the item guide page.

v0.1.16
 - BugFix: fixed the error handling when there's a connection problem to the server. it now releases the controls that were disabled
 - BugFix: fixed a serious bug with the inventory list items actions disappearing if the player visited the "Manage Inventory" page
	Firefox was changing all of the & symbols to &amp; for some reason. The sidebar changes them back before analysis.

v0.1.15
 - BugFix: The points section was checking whether or not something was selected in the edibles list... now fixed.
 - Added more context-sensitive links to the inventory list items. now includes use and return actions.

v0.1.14
 - Added lots of error checking. Things *shouldn't* break anymore if PQ returns a strange page or has a server error.
 - Added the ability to check market prices :)
 - Tab highlighting when the data on a tab is updated but is not active. Only applies to tabs in the top section.
 - BugFix: no longer breaks if you try to use an edible without one selected. Also made points have no default option as well.
 - BugFix: fixed error in which the sidebar script was looking for a player name without spaces.... PQ, however, allows spaces in names.
 - Changed the way failures are recorded. when you fail on a max train, it records the stat you were trying to train in the log.

v0.1.13
 - Added progress/wait info for certain actions where people may inadvertantly hammer the site.
 - moved the training log location to be held outside of the extension. It now resides in the profile directory.

v0.1.12
 - Added system to sell or market inventory items
 - Adjusted Equipment system. Equipped items must now be unequipped before you can equip other items.
 - Added an option to clear the training log and an about box for pirate questing.
 - tab groups can now be collapsed to save space (if you want). just right click on the tabs to collapse the associated panel
 - Changed hwo the equipment is displayed. Looks much more organized now.
 - BugFix: when I added the percentage option to the training fields, I broke the old style... this has now been fixed.

v0.1.11
 - Sidebar now scrolls if the area is too small to display everything
 - Changed style a little more
 - values now remain if you close the sidebar and reopen later. NOTE: opening and closing the sidebar sevearl times often results in a failure
to process some information correctly.... it kind of loses contact with the rest of firefox. This is a bug which affects a number of extensions
so there's not much I can do about it.
 - Moved stuff around a bit so inventory related stuff is at the bottom.
 - added http://76.76.6.166 to the list of supported "versions" of the pirate quest address
 - BugFix: the code dialog was still working on the assumption people were using www.piratequest.net. This has now been fixed.

v0.1.10
 - Responses from the bank and trianing are now selectable and thus can be copied
 - Stats are bolded when less than 100%
 - Cash in hand is colored red when you have more than $0 out of your treasure chest
 - Training values can be input based on percentages.
 - New Look using authentic pirate quest colors and background :)

v0.1.09 - First Public Release
 - BugFix: Previously, the extension assumed everyone was using www.piratequest.net. This is no longer the case. Users can use 
	piratequest.net or www.piratequest.net without breaking the sidebar.
 - Silent feature added: links for piratequest.net or www.piratequest.net are automatically fixed depending on which version of the site
	the user is on.
 - BugFix: small problem with the stylesheets for the training log. if the user selected one of the "odd" rows, the text waas essentially
	invisible. This has now been fixed. Things still act a little funky if you select something and then the table loses focus, but this
	doesn't interfere with the user's ability to read the data.
 - Added Equipment tab. Clicking on an equipment slot will bring up a menu with options for equipping or unequipping items.
 - Optimization: Reduced the number of page requests required for using edibles. Should be about 33% faster now.

v0.1.08
 - Corrected the displayed date in the new training log.

v0.1.07
 - Overhauled the Training log system. No longer opens in a dialog but in a tab which can remain open (and updated) while the user continues playing on PQ.

v0.1.06
 - BugFix: fixed two bugs with player info. If the player experience was at 100% but had not yet leveled up, the player info didn't get read
correctly (it was expecting 1 or 2 digits for the percentage. The second bug was bigger... the player info section couldn't handle a pirate
without a ship. These have now been fixed

v0.1.05
 - Fixed up the training log a bit. Added the option to limit the number of results shown and resize the window. Added Awake to the log and 
also did a little coloring to the list.
 - BugFix: fixed the player info update problems with training, and point_shop usage.
 - BigFix: sort of fixed the problem with the code entry. For now it simply stops after you enter the code. User has to request training again
after entering the code. 
 - BugFix: fixed the edibles list so it no longer barfs on edibles when you have more than 999 of them (the commas were doing it in).

v0.1.04
 - Added log for training results. should help users in assessing the benefits of new hideouts, bandanas, etc. 
    * Future releases may include sorting of the log. Right now it's newest first.

v0.1.03
 - Removed annoying alert windows left in by programmer error.

v0.1.02
 - Added a deposit all button so people can quickly deposit everything (requested)
 - stopped the train button from clearing the train value inputs. (requested)
 - BugFix: Fixed the edibles update problem. This occurred when the user visited an inventory page that was not the main inventory page. 
e.g. equipping/unequipping/send to market. What happened: edibles list would clear but never repopulate.

v0.1
 - First release of Pirate Questing
 - Basic support for:
			- Bank features
			- Character Data
			- Ship Data
			- Training
			- Consuming edibles
			- Using points