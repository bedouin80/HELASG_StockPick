let serveStatic = require("serve-static");

let StaticInitFunc = function (RED) {
  function StaticNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;
    var folder = n.folder;
    var serve = serveStatic(folder, {
      index: ["index.html", "index.htm"],
    });

    node.on("input", function (msg) {
            msg.req.pathname = msg.req.path = msg.req.url = `/${msg.req.path
        .replace(msg.req.baseUrl, "")
        .replace(msg.req.path.match(msg.req.route.path)[0], "")}`;
      serve(msg.req, msg.res._res, function () {
        node.send(msg);
      });
    });
  }
  RED.nodes.registerType("static", StaticNode);
};

module.exports = StaticInitFunc;
