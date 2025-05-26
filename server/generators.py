import os
import sys
import json

def delmodule(mod):
    if mod in sys.modules:
        del sys.modules[mod]

delmodule('renderelements')

import renderelements

print("reloaded")

base = "rbcavi.github.io/home"

def renderjs(f):
    with open(f) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.renderelementsjs(e)
    return renderelements.renderelementjs(e)

def renderhtml(f):
    with open(f) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.renderelementshtml(e) + '\n<script>\n' + renderelements.rendervariableshtml(e) + '\n</script>'
    return renderelements.renderelementhtml(e) + '\n<script>\n' + renderelements.rendervariablehtml(e) + '\n</script>'

def rendervars(f):
    with open(f) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.rendervariablesjs(e)
    return renderelements.rendervariablejs(e)

def include(f):
    with open(f) as f:
        return f.read()

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
    return out

def replacep(s, parts):
    a = ''
    while "###" in s:
        before,name,s = s.split('###', maxsplit = 2)
        a += before
        #print("name:", name)
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
        i1 = s.rfind("###foreach#")
        i2 = s.rfind("###if#")
        if i1 != -1:
            before = s[:i1]
            s = s[i1 + len("###foreach#"):]
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
        elif i2 != -1:
            before = s[:i2]
            s = s[i2 + len("###if#"):]
            name,s = s.split("###", maxsplit = 1)
            #print(name)
            j = s.index("###/if###")
            k = s.index("###else###")
            if k < j and k != -1:
                middle = s[:k]
            else:
                middle = s[:j]
            after = s[j + len("###/if###"):]
            if name in parts:
                middle = replacep(middle, parts)
            else:
                if k < j and k != -1:
                    #print("beanch 1", )
                    middle = replacep(s[k + len("###else###"):j], parts)
                else:
                    #print("beanch 2")
                    middle = ''
            s = before + middle + after
        else:
            break
    s = replacep(s, parts)
    return s

def readfile(file):
    # surrogateescape so i don't run into utf 8 encoding errors
    # (copypastes.html is the only reason for this (i think))
    with open(file, encoding = 'utf-8', errors = 'surrogateescape') as f:
        return f.read()

def parsefile(file):
    return parse(readfile(file))

def rendertemplates(templates):
    bits = {'base': [base]}
    for template in templates:
        bits.update({k:[replace(c, bits) for c in v] for k,v in template.items()})
    return bits['main'][0]

def generatesimple(path):
    return rendertemplates([parsefile(path), parsefile('template.html')])

def generatekeypad(path):
    keys = path[:-5].split('/')[1:] # assume the path is "keypad/<key>/...<key>.html"
    if len(keys) < 4:
        templates = [
            {
                "current": [f"code: {''.join(keys)}"],
                "currentkeys": keys,
                "keys": [*'123456789'],
            },
            parsefile('keypad.html'),
            parsefile('template.html'),
        ]
    else:
        success = ''.join(keys) in ['1111', '1234', '9999', '4321', '8324']
        templates = [{"current": [f"code: {''.join(keys)}"]}, parsefile('keysuccess.html' if success else 'keyfail.html'), parsefile('template.html')]
    return rendertemplates(templates)

def generatechangelog(path):
    return rendertemplates([parsefile('changelogdata.html'), parsefile('changelog.html'), parsefile('template.html')])

redirects = {
    'pl_exec_run.html': 'parserlang/online.html',
    'plc.html': 'parserlang/online.html',
}

def generateredirect(path):
    return rendertemplates([{'to': [redirects[path]]}, parsefile('redirect.html'), parsefile('template.html')])

def generatedfiles():
    files = [
        # different
        "secrets.json",
        "changelog.html",
        
        # just simple template filling
        'generated.html',
        'raypath.html',
        'links.html',
        'factorio.html',
        'copypastes.html',
        'webgl.html',
        '404.html',
        'desktop.html',
        'chat.html',
        'test.html',
        'dialogue.html',
        'index.html',
        'computer.html',

        'parserlang.html',
        'parserlang/history.html',
        'parserlang/reference.html',
        'parserlang/online.html',
        
        # the "blog"
        'blog.html',
        *['blog/' + f + '.html' for f in blogposts],
        
        # redirects
        *redirects,
    ]
    
    # the keypad 
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
        "redirect.html",
    ]
    return files

def generatesecrets(plain):
    def generatesecrets(path):
        delmodule('encrypt')
        delmodule('crypt')
        delmodule('hash')
        import encrypt
        return encrypt.encryptsecrets(readfile(plain))
    return generatesecrets

blogposts = [
    'blog1',
    'blog2',
]

def generatebloghome(path):
    return rendertemplates([{
        "post": blogposts,
    }, parsefile(path), parsefile('template.html')])

def generateblog(path):
    return rendertemplates([parsefile(path), parsefile('blog/template.html'), parsefile('template.html')])

def getgenerator(path):
    if path == "secrets.json":
        return generatesecrets("plainsecrets.json")
    if path == "blog.html":
        return generatebloghome
    if path.startswith("blog/"):
        return generateblog
    if path.startswith("keypad"):
        return generatekeypad
    if path == 'changelog.html':
        return generatechangelog
    if path in redirects:
        return generateredirect
    return generatesimple