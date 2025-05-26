# Python 3 server example
# https://pythonbasics.org/webserver/
import http.server
import time
import posixpath
import sys
import traceback

sys.path = ['server'] + sys.path # so you can run it inside or outside this directory

import generators

hostname = "localhost"
serverPort = 7999

def torelpath(path):
    return posixpath.normpath(posixpath.join('.', './' + posixpath.normpath(posixpath.join('/', path))))

mimetypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
}

def getmimetype(path):
    ext = posixpath.splitext(path)[1]
    if ext in mimetypes:
        return mimetypes[ext]
    print(f"unknown extension {ext} ({path})")
    return 'application/octet-stream'

class MyHandler(http.server.BaseHTTPRequestHandler):
    def send_data(self, data, mimetype, code = 200):
        self.send_response(code)
        self.send_header("Content-Type", mimetype)
        self.end_headers()
        self.wfile.write(data)

    def send_path(self, path, code = 200):
        with open(path, 'rb') as f:
            self.send_data(f.read(), getmimetype(path), code)
    
    def try_send(self, path, code = 200):
        path = torelpath(path)
        staticpath = posixpath.join('static', path)
        if posixpath.exists(staticpath) and posixpath.isfile(staticpath):
            print("file at", staticpath)
            self.send_path(staticpath, code = code)
            return True
        if 'generators' in sys.modules:
            del sys.modules['generators']
        import generators
        generators.base = "%s:%s" % (hostname, serverPort)
        try:
            print("trying", path)
            if path in generators.generatedfiles():
                print("generated", path)
                data = generators.getgenerator(path)(path) # i'm <age> and this is aeh
                if type(data) == str:
                    data = bytes(data, 'utf-8', errors = 'surrogateescape')
                self.send_data(data, getmimetype(path), code = code)
                return True
        except Exception as e:
            print("error", path)
            traceback.print_exc()
            self.send_data(b"<html><head></head><body>oops " + bytes(str(e), 'utf-8') + b"<pre>" + bytes(traceback.format_exc(), 'utf-8') + b"</pre></body></html>", 'text/html', code = 404)
            return True
        else:
            print("not found", path)
            return False

    def do_GET(self):
        path = self.path.split('?', maxsplit = 1)[0]
        # these should emulate the github rules
        if self.try_send(path): return
        if self.try_send(path + '.html'): return
        if self.try_send(posixpath.join(path, 'index.html')): return
        self.try_send('404.html', code = 404)

if __name__ == "__main__":
    webServer = http.server.HTTPServer((hostname, serverPort), MyHandler)
    print("Server started at http://%s:%s" % (hostname, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")