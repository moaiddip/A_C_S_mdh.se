var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var port = process.argv[2] || 8000;

port = parseInt(port, 10);

let body = [];

http.createServer((req, res) => {

    try{
        var files = [];

        var uri = url.parse(req.url, true);
        var pathname = decodeURIComponent(`.${uri.pathname}`);
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
            console.log(req.method + " " + req.url + " " + req.httpVersion + " " + contentTypesByExtensions[ext]);
            
            if(body){
                console.log(decodeURIComponent(`.${body}`));
            }
        body = [];
        });

        if(pathname==="./information"){
            fs.readFile("./templates/information.html", function(err, data){
                if(data){
                    var informationHtmlString = data.toString("utf8");
                    informationHtmlString = informationHtmlString.replace("{{method}}", req.method);
                    informationHtmlString = informationHtmlString.replace("{{path}}", uri.path.substring(0, uri.path.indexOf("?")));
                    //informationHtmlString = informationHtmlString.replace("{{query}}", JSON.stringify(uri.query));
                    informationHtmlString = informationHtmlString.replace("{{query}}", uri.path.substring(uri.path.indexOf("?")));

                    var parsedQueries = "<ul>";
                    Object.entries(uri.query).forEach((element, key) => {
                        parsedQueries += "<li>"+element[0]+" : "+element[1]+"</li>"
                    });
                    parsedQueries += "</ul>"
                    informationHtmlString = informationHtmlString.replace("{{queries}}", parsedQueries);

                    res.statusCode = 200;
                    res.end(informationHtmlString);
                    return;
                }
            });
        }else{
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
        }
    } catch(e) {
        res.writeHead(404)
        res.end("404 Error occured when reading file")
        console.log(e.stack)
    }
}).listen(port);

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");