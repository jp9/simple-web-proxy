simple-web-proxy
================

Simple Web proxy using Node.js. The proxy server is not meant for production. 



Instruction to use the server:
=============================

node app.js


Known Issues:
=============

- Need to spawn new threads to process the requests (to prevent memory leaks when the connection closes unexpectedly).
