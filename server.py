# Python 3 server example
# https://pythonbasics.org/webserver/
import http.server
import time
import os

hostName = "localhost"
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
    def send_path(self, path, mimetype, code = 200):
        self.send_response(code)
        self.send_header("Content-Type", mimetype)
        self.end_headers()
        with open(path, 'rb') as f:
            self.wfile.write(f.read())

    def do_GET(self):
        path = torelpath(self.path.split('?', maxsplit = 1)[0])
        print(path)
        if os.path.exists(path) and os.path.isfile(path):
            self.send_path(path, getmimetype(path))
            return
        elif os.path.exists(path + '.html'):
            # i don't care if it's called something.png.html
            # it's getting sent as html anyway
            self.send_path(path + '.html', 'text/html')
            return
        elif os.path.exists(os.path.join(path, 'index.html')):
            # i don't care if it's called something.png/index.html
            # it's getting sent as html anyway
            self.send_path(os.path.join(path, 'index.html'), 'text/html')
            return
        else:
            self.send_path('404.html', 'text/html', code = 404)
            return

if __name__ == "__main__":
    webServer = http.server.HTTPServer((hostName, serverPort), MyHandler)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")