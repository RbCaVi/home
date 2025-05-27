import os
import sys
import shutil

sys.path = ['server'] + sys.path # so you can run it inside or outside this directory

import generators

shutil.copytree('static', 'generated')

for path in generators.generatedfiles():
    data = generators.getgenerator(path)(path) # i'm <age> and this is aeh
    if type(data) == str:
        data = bytes(data, 'utf-8', errors = 'surrogateescape')
    os.makedirs(os.path.dirname(os.path.join('generated', path)), exist_ok=True)
    with open(os.path.join('generated', path), 'xb') as f:
        f.write(data)