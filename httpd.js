var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var port = process.argv[2] || 8000;

port = parseInt(port, 10);

http.createServer((req, res) => {

    try{
        var files = [];
        var body = [];

        var uri = url.parse(req.url)
        var pathname = `.${uri.pathname}`;
        var ext = path.parse(pathname).ext;

        var contentTypesByExtensions = {
            '.ico': 'image/x-icon',
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword'
        };

        req.on('error', (err) => {
            console.log(err);
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
        });

        console.log(req.method + " " + req.url + " " + req.httpVersion + " " + contentTypesByExtensions[ext]);
        console.log(body);

        fs.exists(pathname, function (exist) {
            if(!exist) {
              res.statusCode = 404;
              res.end(`File ${pathname} not found!`);
              return;
            }
            if (fs.statSync(pathname).isDirectory()){
                pathname += '/index.html';
            }

            fs.readFile(pathname, function(err, data){
                if(err){
                //   res.statusCode = 500;
                //   res.end(`Error getting the file: ${err}.`);
                pathname = pathname.slice (0, -11);
                console.log(pathname);
                fs.readdir(pathname, function(err,list){
                            if(err) throw err;
                            //files = [];
                            for(var i=0; i<list.length; i++)
                            {
                                path.extname(list[i])
                                //console.log(list[i]); //print the file
                                files.push(list[i]);
                                files.sort();
                            }
                                res.writeHead(200, 'Content-type', 'text/plain');
                                res.end(files.join('\n'));
                        });
                } else {
                  res.writeHead(200, 'Content-type', contentTypesByExtensions[ext] || 'text/plain');
                  res.end(data);
                }
            });
        });
    } catch(e) {
        res.writeHead(404)
        res.end("404 Error occured when reading file")
        console.log(e.stack)
    }

    // fs.exists(filename, function(exists) {
    //     if(!exists) {
    //         res.writeHead(404, {'Content-Type' : 'text/plain'});
    //         res.write("404 Not found\n");
    //         res.end();
    //         return;
    //     }

    //     if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    //     fs.readFile(filename, "binary", function(err, file){
    //         if(err) {
    //             res.writeHead(500, {"Content-Type" : "text/plain"});
    //             res.write(err + "\n");
    //             res.end();
    //             return;
    //         }

    //         res.writeHead(200, { 'Content-Type': 'text/html'});
    //         //res.write("<h1>Hello World</h1>");
    //         res.write(file, "binary");
    //         res.end();
    //     });
    // });
}).listen(port);

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");