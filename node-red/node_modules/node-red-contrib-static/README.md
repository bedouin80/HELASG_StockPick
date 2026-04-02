# node-red-contrib-static

This Node-RED node allows serving static files from local directories over HTTP/HTTPS.

![flow](flow.png)

# Install

`npm i node-red-contrib-static`

# Use

Input the directory path that will act as the root in the input field `folder`. NOTE: make sure to put a wildcard in the HTTP/HTTPS node path after the root url path, so that the file / directory names are passed to the static node. e.g.: `prefix/*`

# LICENSE

[ISC](https://opensource.org/licenses/ISC)

# Contact

[node-red@digitalarsenal.io](mailto:node-red@digitalarsenal.io)