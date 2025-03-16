import os
import sys

print("reloaded")

base = "rbcavi.github.io/home"

def templatechain(path):
    return ['template.html', 'generated.html']

def readfile(file):
    with open(file) as f:
        return f.read()

def readfiles(files):
    return [readfile(file) for file in files]

def escape(s):
    return f"{s}".replace("<", "&lt;")

def parseone(s):
    s = s.strip()
    assert s.startswith('###')
    _,name,rest = s.split('###', maxsplit = 2)
    content,rest = rest.split(f'###/{name}###', maxsplit = 1)
    return (name, content), rest

def parse(s):
    parts = []
    while s.strip() != '':
        part,s = parseone(s)
        parts.append(part)
    out = {k:[v for k2,v in parts if k == k2] for k in set(k for k,v in parts)}
    out['base'] = [base]
    return out

def replacep(s, parts):
    a = ''
    while "###" in s:
        before,name,s = s.split('###', maxsplit = 2)
        a += before
        print("name:", name)
        if name in parts:
            #print(parts)
            a += parts[name][0]
        elif name.startswith("call#"):
            a += f"{eval(name[5:])}"
        else:
            a += f"###{name}###"
    return a + s

def replace(s, parts):
    while True:
        #print("A", s)
        i = s.rfind("###foreach#")
        if i != -1:
            before = s[:i]
            s = s[i + len("###foreach#"):]
            name,s = s.split("###", maxsplit = 1)
            #print(s)
            j = s.index("###/foreach###")
            middle = s[:j]
            after = s[j + len("###/foreach###"):]
            parts2 = {**parts}
            middle2 = ''
            for x in parts2[name]:
                parts2[name] = [x]
                middle2 += replacep(middle, parts2)
            s = before + middle2 + after
        else:
            break
    s = replacep(s, parts)
    return s

def generate(path):
    f = "<html><head></head><body>"
    f += f"<pre>{path}</pre>"
    f += "<pre>template chain</pre>"
    chain = templatechain(path)
    for c in chain:
        f += f"<pre>{c}</pre>"
    f += "<pre>template chain 2</pre>"
    files = readfiles(templatechain(path))
    for c in files:
        f += f"<pre>{escape(c)}</pre>"
    f += "<pre>aaaaaaaaaaaaaaaaaaaaaaaaaaaa</pre>"
    for i,c in enumerate(parse(f) for f in files):
        f += f"<pre>{i}</pre>"
        for name,c in c.items():
            f += f"<pre>{name}=</pre>"
            for c in c:
                f += f"<pre>{escape(c)}</pre>"
    t0 = parse(files[0])['main'][0]
    t1 = parse(files[1])
    t1 = {k:[replace(c, {}) for c in v] for k,v in t1.items()}
    print("a")
    #f += f"<pre>{escape(replace(t0, t1))}</pre>"
    f += "</body></html>"
    return replace(t0, t1)

def generatedfiles():
    files = ['generated.html', "secrets.json"]
    return files

def hiddenfiles():
    files = ['template.html', "plainsecrets.json", "not-me.png", "server.py", "regen.py", "generators.py", "hash.py", "crypt.py", "template.html"]
    return files

def delmodule(mod):
    if mod in sys.modules:
        del sys.modules[mod]

def generatesecrets(plain):
    def generatesecrets(path):
        delmodule('encrypt')
        delmodule('crypt')
        delmodule('hash')
        import encrypt
        return encrypt.encryptsecrets(readfile(plain))
    return generatesecrets

def getgenerator(path):
    if path == "secrets.json":
        return generatesecrets("plainsecrets.json")
    return generate