# Python 3 server example
# https://pythonbasics.org/webserver/
import http.server
import time
import os

import generators

hostname = "localhost"
serverPort = 7999

def torelpath(path):
    return os.path.normpath(os.path.join('.', './' + os.path.normpath(os.path.join('/', path))))

mimetypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.json': 'application/json',
}

def getmimetype(path):
    ext = os.path.splitext(path)[1]
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

    def send_path(self, path, mimetype, code = 200):
        with open(path, 'rb') as f:
            self.send_data(f.read(), mimetype, code)
    
    def try_send(self, path):
        if os.path.exists(path) and os.path.isfile(path):
            self.send_path(path, getmimetype(path))
            return True
        else:
            return False

    def do_GET(self):
        path = torelpath(self.path.split('?', maxsplit = 1)[0])
        print(path)
        if path in generators.hiddenfiles():
            self.send_path('404.html', 'text/html', code = 404)
            return
        if path in generators.generatedfiles():
            data = generators.getgenerator(path)(path) # i'm <age> and this is aeh
            if type(data) == str:
                data = bytes(data, 'utf-8')
            self.send_data(data, getmimetype(path))
            return
        # these should emulate the github rules
        if self.try_send(path): return
        if self.try_send(path + '.html'): return
        if self.try_send(os.path.join(path, 'index.html')): return
        self.send_path('404.html', 'text/html', code = 404)

if __name__ == "__main__":
    webServer = http.server.HTTPServer((hostname, serverPort), MyHandler)
    print("Server started at http://%s:%s" % (hostname, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")