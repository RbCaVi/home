import os

base = "rbcavi.github.io/home"

def generate(path):
    return f"<html><head></head><body>{path}</body></html>"

def generatedfiles():
    files = ['generated.html']
    return files

def hiddenfiles():
    files = []
    return files

def getgenerator(path):
    return generate