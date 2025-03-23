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

  if ("style" in attrs) {
    e.style = attrs.style;
  }

  if ("type" in attrs) {
    e.type = attrs.type;
  }

  if ("src" in attrs) {
    e.src = attrs.src;
  }

  for (const part of parts) {
    e.append(part);
  }

  return e;
}
