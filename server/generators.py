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
    with open(os.path.join('src', f)) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.renderelementsjs(e)
    return renderelements.renderelementjs(e)

def renderhtml(f):
    with open(os.path.join('src', f)) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.renderelementshtml(e) + '\n<script>\n' + renderelements.rendervariableshtml(e) + '\n</script>'
    return renderelements.renderelementhtml(e) + '\n<script>\n' + renderelements.rendervariablehtml(e) + '\n</script>'

def rendervars(f):
    with open(os.path.join('src', f)) as f:
        e = json.load(f)
    if isinstance(e, list):
        return renderelements.rendervariablesjs(e)
    return renderelements.rendervariablejs(e)

def include(f):
    with open(f) as f:
        return f.read()

def escape(s):
    return f"{s}".replace("<", "&lt;")

def parse(s):
    return parseparts(lex(s))

def lex(s):
    parts = s.split('###')
    assert len(parts) % 2 == 1, parts # there are an even number of ###
    return [part if i % 2 == 0 else '###' + part + '###' for i,part in enumerate(parts)]

def parseparts(parts):
    # parts is alternating text and tags, but i'm ignoring that fact
    # and just checking both cases every iteration
    sections = []
    while len(parts) != 0:
        part = parts.pop(0)
        if part.strip() == '':
            continue
        elif part.startswith('###'):
            name = part.split('###')[1]
            section = []
            while True:
                if len(parts) == 0:
                    print(name, 'unclosed')
                part = parts.pop(0)
                if part == f'###/{name}###':
                    break
                section.append(part)
            sections.append((name, parsesectiontrees(section)))
        else:
            print("ignored text outside paired ### tags:", part)
    return {k:[v for k2,v in sections if k == k2] for k in set(k for k,v in sections)}

# these three modify section by popping elements
# section should be empty after parsesectiontrees(section)

def parsesectiontreeswhile(section, cond):
    # stop when cond is false
    trees = []
    while cond(section):
        tree = parsesectiontree(section)
        trees.append(tree)
    return trees

def parsesectiontrees(section):
    return parsesectiontreeswhile(section, lambda section: len(section) != 0)

def parsesectiontree(section):
    start = section.pop(0)
    if not start.startswith('###'):
        return start
    if start.startswith('###if#'):
        name = start[len("###if#"):-3]
        tree1 = parsesectiontreeswhile(section,
            lambda section:
                (not section[0].startswith('###else###')) and
                (not section[0].startswith('###/if###'))
        )
        out = ['###if###', name, tree1]
        if section[0].startswith('###else###'):
            section.pop(0) # pop ###else###
            out.append(parsesectiontreeswhile(section,
                lambda section: not section[0].startswith('###/if###')
            ))
        section.pop(0) # pop ###/if###
        return out
    if start.startswith('###foreach#'):
        names = start[len("###foreach#"):-3].split('#')
        tree = parsesectiontreeswhile(section,
            lambda section: not section[0].startswith('###/foreach###')
        )
        section.pop(0) # pop ###/foreach###
        return ['###foreach###', names, tree]
    if start.startswith('###call#'):
        call = start[len("###call#"):-3]
        return ['###call###', call]
    if start == '###accordion###':
        tree = parsesectiontreeswhile(section,
            lambda section: not section[0].startswith('###/accordion###')
        )
        return ['###accordion###', tree]
    return start

def rendertrees(trees, env):
    out = ''
    for tree in trees:
        if type(tree) == str:
            if tree.startswith('###'):
                # normal template ### part
                name = tree.split('###')[1]
                if name in env:
                    #print(parts)
                    out += env[name][0]
                else:
                    print("template not found:", tree)
                    out += tree
            else:
                # normal string part
                out += tree
        elif type(tree) == list:
            # special template ### part
            if tree[0] == '###if###':
                name = tree[1]
                if name in env:
                    out += rendertrees(tree[2], env)
                else:
                    if len(tree) > 3:
                        out += rendertrees(tree[3], env)
            elif tree[0] == '###foreach###':
                names = tree[1]
                subtree = tree[2]
                subenv = {**env}
                for values in zip(*[env.get(name, []) for name in names]):
                    for name,value in zip(names, values):
                        subenv[name] = [value]
                    out += rendertrees(subtree, subenv)
            elif tree[0] == '###call###':
                out += f"{eval(tree[1])}"
            elif tree[0] == '###accordion###':
                out += "<div class = \"accordion\"><button></button><div>"
                out += rendertrees(tree[1], env)
                out += "</div></div>"
            else:
                # ???
                pass
        else:
            # ???
            pass
    return out

def readfile(file):
    # surrogateescape so i don't run into utf 8 encoding errors
    # (copypastes.html is the only reason for this (i think))
    with open(file, encoding = 'utf-8', errors = 'surrogateescape') as f:
        return f.read()

def parsefile(file):
    return parse(readfile(file))

def rendertemplates(templates):
    env = {'base': [base]}
    for template in templates:
        env.update({k:[rendertrees(section, env) for section in v] for k,v in template.items()})
    return env['main'][0]

def generatesimple(path):
    return rendertemplates([parsefile(os.path.join('src', path)), parsefile('src/template.html')])

def generatekeypad(path):
    keys = path[:-5].split('/')[1:] # assume the path is "keypad/<key>/...<key>.html"
    if len(keys) < 4:
        templates = [
            {
                "current": [f"code: {''.join(keys)}"],
                "currentkeys": keys,
                "keys": [*'123456789'],
            },
            parsefile('src/keypad.html'),
            parsefile('src/template.html'),
        ]
    else:
        success = ''.join(keys) in ['1111', '1234', '9999', '4321', '8324']
        templates = [{"current": [f"code: {''.join(keys)}"]}, parsefile('src/keysuccess.html' if success else 'keyfail.html'), parsefile('src/template.html')]
    return rendertemplates(templates)

def generatechangelog(path):
    return rendertemplates([parsefile('src/changelogdata.html'), parsefile('src/changelog.html'), parsefile('src/template.html')])

redirects = {
    'pl_exec_run.html': 'parserlang/online.html',
    'plc.html': 'parserlang/online.html',
}

def generateredirect(path):
    return rendertemplates([{'to': [redirects[path]]}, parsefile('src/redirect.html'), parsefile('src/template.html')])

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
    }, parsefile(os.path.join('src', path)), parsefile('src/template.html')])

def generateblog(path):
    return rendertemplates([parsefile(os.path.join('src', path)), parsefile('src/blog/template.html'), parsefile('src/template.html')])

def getgenerator(path):
    if path == "secrets.json":
        return generatesecrets("src/plainsecrets.json")
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