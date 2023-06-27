# webpack
My webpack config
First version was made on 2023-06-03

HTML pages shoudl be listed in array htmlPageNames, index page included, wihout file extention ('html' by default), for example: 
['file1', 'folder/file2' ...]

Source / distribution / assets directories must be specified in PATH constant (base configuration)

JS files goes to JS folder
CSS / Images / Fonts / HTML pages goes to assets folder

Configs for development and production modes are in config folder.
In production config you must manually choose between lossless or lossy images optimization by commenting lines for JPG / PNG files
