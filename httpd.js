var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var port = process.argv[2] || 8000;
var files = [];

port = parseInt(port, 10);

var server = http.createServer((req, res) => {

    console.log(req.method + " " + req.url + " " + req.httpVersion);

    try{
        var uri = url.parse(req.url)
        

        var contentTypesByExtensions = {
            '.html' : "text/html",
            '.css' : "text/css",
            '.js' : "javascript"
        };
            // if(fs.statSync(fsPath).isDirectory()){
            //     fsPath += '/index.html';
            // }
            var fsPath = uri.pathname.substring(1)
            var fileStream = fs.createReadStream(fsPath)
            fileStream.pipe(res)
            fileStream.on('open', function() {
            res.writeHead(200)
            })
            fileStream.on('error', function(){
                fs.readdir(fsPath.path, function(err,list){
                    if(err) throw err;
                    for(var i=0; i<list.length; i++)
                    {
                        path.extname(list[i])
                        console.log(list[i]); //print the file
                        files.push(list[i]); //store the file name into the array files
                    }
                });
            })
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