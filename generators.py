import os
import sys

print("reloaded")

base = "rbcavi.github.io/home"

def escape(s):
    return f"{s}".replace("<", "&lt;")

def parseone(s):
    s = s.strip()
    #print("saerts", s[:100].encode('utf-8'))
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
            names = name.split('#')
            for xs in zip(*[parts2.get(name, []) for name in names]):
                for name,x in zip(names,xs):
                    parts2[name] = [x]
                middle2 += replacep(middle, parts2)
            s = before + middle2 + after
        else:
            break
    s = replacep(s, parts)
    return s

def templatechain(path):
    if path.startswith("keypad"):
        keys = path[:-5].split('/')[1:]
        if len(keys) < 4:
            return [
                {
                    "current": [f"code: {''.join(keys)}"],
                    "currentkeys": keys,
                    "keys": [*'123456789'],
                },
                parse(readfile('keypad.html')),
                parse(readfile('template.html')),
            ]
        else:
            if ''.join(keys) in ['1111', '1234', '9999', '4321', '8324']:
                return [{"current": [f"code: {''.join(keys)}"]}, parse(readfile('keysuccess.html')), parse(readfile('template.html'))]
            else:
                return [{"current": [f"code: {''.join(keys)}"]}, parse(readfile('keyfail.html')), parse(readfile('template.html'))]
    if path == "changelog.html":
        return [parse(readfile('changelogdata.html')), parse(readfile('changelog.html')), parse(readfile('template.html'))]
    return [parse(readfile(path)), parse(readfile('template.html'))]

def readfile(file):
    with open(file) as f:
        return f.read()

def generate(path):
    templates = templatechain(path)
    bits = {}
    for template in templates:
        bits.update({k:[replace(c, bits) for c in v] for k,v in template.items()})
    return bits['main'][0]

def generatedfiles():
    files = ['plc.html', 'generated.html', "secrets.json", "changelog.html", 'raypath.html', 'parserlang.html']
    keys = '123456789'
    for l1 in keys:
        for l2 in keys:
            for l3 in keys:
                for l4 in keys:
                    files.append(f'keypad/{l1}/{l2}/{l3}/{l4}.html')
                files.append(f'keypad/{l1}/{l2}/{l3}.html')
            files.append(f'keypad/{l1}/{l2}.html')
        files.append(f'keypad/{l1}.html')
    files.append(f'keypad.html')
    return files

def hiddenfiles():
    files = [
        'template.html',
        "plainsecrets.json",
        "not-me.png",
        "server.py",
        "regen.py",
        "generators.py",
        "hash.py",
        "crypt.py",
        "keyfail.html",
        "keysuccess.html",
        "changelogdata.html",
    ]
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