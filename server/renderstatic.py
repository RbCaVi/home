import os
import sys

sys.path = ['server'] + sys.path # so you can run it inside or outside this directory

import generators

generated = {}

for path in generators.generatedfiles():
    data = generators.getgenerator(path)(path) # i'm <age> and this is aeh
    if type(data) == str:
        data = bytes(data, 'utf-8', errors = 'surrogateescape')
    generated[path] = data

for path in generators.hiddenfiles():
    if os.path.exists(path):
        os.remove(path)

for path,data in generated.items():
    if '/' in path:
        os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)