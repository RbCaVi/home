def renderelementjs(element):
  if isinstance(element, str):
    return repr(element) # python and js string escaping are close enough right?
  if element['type'] == 'mod':
    if element['mod'] == 'onPressEnter':
        if 'events' not in element['element']:
            element['element']['events'] = {}
        element['element']['events']['keyup'] = f'if(event.key=="Enter"){{{element["code"]},event.preventDefault()}}' + element['element']['events'].get('keyup', '')
        return renderelementjs(element['element'])
    raise Error('can"t')
  if 'contents' in element:
    content = renderelementsjs(element['contents'])
  elif 'content' in element:
    content = renderelementjs(element['content'])
  else:
    content = ''
  args = ''
  if 'style' in element:
    args += f'style:{repr(element["style"])},'
  if 'attrs' in element:
    for k,v in element['attrs'].items():
      args += f'[{repr(k)}]:{repr(v)},'
  if 'events' in element:
    args += 'events:{'
    for k,v in element['events'].items():
      args += f'[{repr(k)}]:()=>{{{v}}},'
    args += '},'
  out = f'element("{element["type"]}",{{{args}}},{content})'
  if 'name' in element:
    out = element['name'] + '=' + out
  return out

def renderelementsjs(elements):
  return ',\n'.join(renderelementjs(element) for element in elements)

voidelements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']

def renderelementhtml(element):
  if isinstance(element, str):
    return element
  if element['type'] == 'mod':
    if element['mod'] == 'onPressEnter':
        if 'events' not in element['element']:
            element['element']['events'] = {}
        element['element']['events']['keyup'] = f'if(event.key=="Enter"){{{element["code"]},event.preventDefault()}}' + element['element']['events'].get('keyup', '')
        return renderelementhtml(element['element'])
    raise Error('can"t')
  if 'contents' in element:
    content = renderelementshtml(element['contents'])
  elif 'content' in element:
    content = renderelementhtml(element['content'])
  else:
    content = ''
  args = ''
  if 'style' in element:
    args += f'style={repr(element["style"])} '
  if 'attrs' in element:
    for k,v in element['attrs'].items():
      args += f'{k}={repr(v)} '
  if 'events' in element:
    for k,v in element['events'].items():
      args += f'on{k}={repr(v)} '
  if 'name' in element:
    args += f'id={repr(element["name"])} '
  if element['type'] in voidelements:
    return f'<{element["type"]} {args} />'
  return f'<{element["type"]} {args}>{content}</{element["type"]}>'
  out = f'element("{element["type"]}",{{{args}}},{content})'
  return out

def renderelementshtml(elements):
  return '\n'.join(renderelementhtml(element) for element in elements)

def rendervariablejs(element):
  if isinstance(element, str):
    return ''
  if 'contents' in element:
    content = rendervariablesjs(element['contents'])
  elif 'content' in element:
    content = rendervariablejs(element['content'])
  else:
      content = ''
  if 'name' in element:
    var = f'let {element["name"]};'
  else:
    var = ''
  return f'{var}\n{content}'.strip()

def rendervariablesjs(elements):
  return '\n'.join(filter(lambda e: e != '', (rendervariablejs(element) for element in elements)))

def rendervariablehtml(element):
  if isinstance(element, str):
    return ''
  if 'contents' in element:
    content = rendervariableshtml(element['contents'])
  elif 'content' in element:
    content = rendervariablehtml(element['content'])
  else:
      content = ''
  if 'name' in element:
    var = f'let {element["name"]} = document.querySelector("#{element["name"]}");'
  else:
    var = ''
  return f'{var}\n{content}'.strip()

def rendervariableshtml(elements):
  return '\n'.join(filter(lambda e: e != '', (rendervariablehtml(element) for element in elements)))