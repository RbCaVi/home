function element(type, attrs = {}, ...parts) {
  const e = document.createElement(type);

  if ("classes" in attrs) {
    for (const c of attrs.classes) {
      e.classList.add(c);
    }
  }

  if ("class_" in attrs) {
    e.classList.add(attrs.class_);
  }

  if ("events" in attrs) {
    for (const event in attrs.events) {
      e.addEventListener(event, attrs.events[event]);
    }
  }

  if ("text" in attrs) {
    e.textContent = attrs.text;
  }
  
  const copied = ['id', 'style', 'type', 'src', 'width', 'height', 'href', 'target', 'rel'];
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
