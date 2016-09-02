# blueheart
A HTTP Terminal for Linux/OS X

This is a simple web server, that provides web-based shell access to a computer system. The client-side uses the [xterm.js](sourcelair/xterm.js) terminal emulator. Communication between client-side and server-side is by Socket.IO. I've configured it to invoke `/bin/login`. This means users will have to authenticate first, before gaining access to a shell. 
