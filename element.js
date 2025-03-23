function element(type, attrs = {}, ...parts) {
  const e = document.createElement(type);

  if ("classes" in attrs) {
    for (const c of attrs.classes) {
      e.classList.add(c);
    }
  }

  if ("id" in attrs) {
    e.id = attrs.id;
  }

  if ("events" in attrs) {
    for (const event in attrs.events) {
      e.addEventListener(event, attrs.events[event]);
    }
  }
  
  const copied = ['style', 'type', 'src', 'width', 'height', 'href', 'target', 'rel'];
  for (const prop of copied) {
    if (prop in attrs) {
      e[prop] = attrs[prop];
    }
  }

  for (const part of parts) {
    e.append(part);
  }

  return e;
}
