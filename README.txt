----- Anglerfish Maze, running instructions -----

-- TL;DR

Start a simple Python web server in the game's root folder using
python3 -m http.server OR python2 -m SimpleHTTPServer
and navigate to
localhost:8000/Welcome_Page.html
in the browser (Firefox works best).



-- GENERAL INFORMATION

The game is started by opening the page Welcome_Page.html. From there you use
the menus to navigate through the pages of the game.

The game uses the browser's localStorage to store settings such as language
and if the sound is muted. If something gets messed up with the settings and
sound/language settings don't seem to work as expected (such as text being
replaced by "undefined"), try running

localStorage.clear()

in the browser's console window (F12), and then navigate to Welcome_Page.html
(Welcome_page.html is the page where the language variable is initially set in
localStorage.).



-- BROWSER SUPPORT

- Google Chrome

JSON files can't be loaded; they get blocked by CORS policy.
Some internet pages suggest using the flag --allow-file-access-from-files as
flag to chrome executable, this have however not been confirmed to work in our
case. Another solution to this is to start a simple local web server and run
the game from there (see instructions for this below).


- Firefox

For the game to be able to play sounds, the setting "Autoplay sound", needs to
be set to "Allow" (can be found in Preferences -> Privacy & Security ->
Permissions -> Block websites from automatically playing sound).

Also, got an error saying currentLanguage is null during first time in Firefox
on Windows. This can be solved by navigating to the Options menu and just
changing the language. However, we never managed to recreate that error again,
even after clearing localStorage. It's worth mentioning though, it might be
the problem if you get error messages in the console window when running it
for the first time.


- Internet Explorer

The game uses ES6 features such as classes and arrow functions, and since 
Internet Explorer doesn't support ES6, it doesn't support our game either.


- Microsoft Edge

Microsoft Edge doesn't allow localStorage from file:// URLs. However, this
can also be fixed by running the game from a local web server (again, see
information on how to do this below).

Also, the game pages might need to be allowed to run ActiveX controls
(there is usually a prompt appearing on the page that says "Allow blocked
content").



-- LOCAL PYTHON WEB SERVER

When running the game directly from the disk using a file:// URL, some
issues might appear such as Google Chrome not allowing JSON files to be
loaded due to the CORS policy, or Microsoft Edge not allowing localStorage.
This can be fixed by starting a local web server on the computer and running
the game from there instead. This can quite easily be done in for example
Python.

To start simple Python web server, start a console window, navigate to the
game's root folder and run the below command, depending on Python version.

For Python3: python3 -m http.server
For Python2: python2 -m SimpleHTTPServer

then access the game in the browser by navigating to

localhost:8000/Welcome_Page.html



-- GENERAL ISSUES

Right now, some of the JavaScript files are loaded in an order that might
cause synchronization issues/race conditions, which causes the game to run
inconsistently. These issues seem to appear mostly in Google Chrome however,
Firefox seems to be the browser that works with our game in its current state.



-- GENERATE LEVELS

To run the level_generator.py script, Python 3 is required.
