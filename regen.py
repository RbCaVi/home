import generators
import os

generated = {}

for path in generators.generatedfiles():
    data = generators.getgenerator(path)(path) # i'm <age> and this is aeh
    if type(data) == str:
        data = bytes(data, 'utf-8')
    generated[path] = data

for path in generators.hiddenfiles():
    os.remove(path)

for path,data in generated.items():
    with open(path, 'wb') as f:
        f.write(data)