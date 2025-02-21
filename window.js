function makeDraggable(draggable, update) {
  // call update with x and y movement while draggable is being dragged
  let pmouseX, pmouseY;
  
  function startDrag(event) {
    console.log("touch started");
    event.preventDefault();
    pmouseX = event.pageX;
    pmouseY = event.pageY;
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchup', endDrag);
    document.addEventListener('mousemove', dragUpdate);
    document.addEventListener('touchmove', dragUpdate);
  }
  
  function endDrag() {
    console.log("touch ended");
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchup', endDrag);
    document.removeEventListener('mousemove', dragUpdate);
    document.removeEventListener('touchmove', dragUpdate);
  }
  
  function dragUpdate(event) {
    event.preventDefault();
    const dmouseX = event.pageX - pmouseX;
    const dmouseY = event.pageY - pmouseY;
    pmouseX = event.pageX;
    pmouseY = event.pageY;
    update(dmouseX, dmouseY);
  }
  
  draggable.addEventListener('mousedown', startDrag);
  draggable.addEventListener('touchdown', startDrag);
}

const windowlayers = new Map();
let windowtop = 0;

function spawnWindow(args = {}) {
  const {init, x = Math.random() * (window.innerWidth - 200), y = Math.random() * (window.innerHeight - 200), w = 200, h = 200, title = ""} = args;
  // spawn a window with a close button and resize handles at the given position
  // call init with an object representing the window
  // it has a bunch of "methods"
  // getw geth getsize setw seth resize
  // getx gety getpos setx sety move - x and y are relative to the top left corner of the page (not the screen)
  // moveleft moveright movetop movebottom
  // bringtofront
  // settitle
  // close
  // and also closed (whether the window has been closed)
  // and root (the root element of the window, which you should put stuff in)
  const container = document.createElement('div');
  container.classList.add('window');

  const win = {closed: false};

  // getx gety getpos
  win.getx = () => container.offsetLeft;
  win.gety = () => container.offsetTop;
  win.getpos = () => [win.getx(), win.gety()];

  // getw geth getsize
  win.setx = (x) => {container.style.left = Math.max(x, 0) + 'px';};
  win.sety = (y) => {container.style.top = Math.max(y, 0) + 'px';};
  win.move = ({x, y}) => {
    if (x != undefined) win.setx(x);
    if (y != undefined) win.sety(y);
  };

  // setx sety move
  win.getw = () => container.offsetWidth;
  win.geth = () => container.offsetHeight;
  win.getsize = () => [win.getw(), win.geth()];

  // setw seth resize
  win.setw = (w) => {container.style.width = Math.max(w, 20) + 'px';};
  win.seth = (h) => {container.style.height = Math.max(h, 20) + 'px';};
  win.resize = ({w, h}) => {
    if (w != undefined) win.setw(w);
    if (h != undefined) win.seth(h);
  };
  
  // moveleft moveright movetop movebottom
  win.moveleft = (dx) => {win.setx(container.offsetLeft + dx); win.setw(container.offsetWidth - dx);};
  win.moveright = (dx) => {win.setw(container.offsetWidth + dx);};
  win.movetop = (dy) => {win.sety(container.offsetTop + dy); win.seth(container.offsetHeight - dy);};
  win.movebottom = (dy) => {win.seth(container.offsetHeight + dy);};

  // bringtofront
  windowtop++;
  win.bringtofront = () => {
    const currlayer = windowlayers.get(win.root);
    windowlayers.forEach((v, k) => {
      if (v > currlayer) {
        k.parentElement.style.zIndex = v - 1;
        windowlayers.set(k, v - 1);
      }
    });
    container.style.zIndex = windowtop;
    windowlayers.set(win.root, windowtop);
  };

  
  // close closed
  win.close = () => {
    win.closed = true;
    container.remove();
  };

  // when a window is touched, bring it to the front
  container.addEventListener('mousedown', win.bringtofront);

  // the window bar
  const bar = document.createElement('div');
  bar.classList.add('windowbar');

  // title
  const wtitle = document.createElement('span');
  wtitle.classList.add('windowtitle');
  bar.append(wtitle);

  // settitle
  win.settitle = (newtitle) => {
    wtitle.textContent = newtitle;
  };

  // close button
  const close = document.createElement('div');
  close.classList.add('windowclose');
  close.addEventListener('click', win.close);
  bar.append(close);

  //const full = document.createElement('div');
  //full.classList.add('windowfull');
  //bar.append(full);

  //const minimize = document.createElement('div');
  //minimize.classList.add('windowminimize');
  //bar.append(minimize);

  makeDraggable(bar, (dx, dy) => {win.setx(container.offsetLeft + dx); win.sety(container.offsetTop + dy);});
  container.append(bar);

  // root
  win.root = document.createElement('div');
  win.root.classList.add('windowcontent');
  container.append(win.root);
  win.bringtofront();

  // eight resize handles for each corner and edge
  const resizeleft = document.createElement('div');
  resizeleft.classList.add('windowresizeleft');
  makeDraggable(resizeleft, (dx, dy) => {win.moveleft(dx);});
  container.append(resizeleft);

  const resizeright = document.createElement('div');
  resizeright.classList.add('windowresizeright');
  makeDraggable(resizeright, (dx, dy) => {win.moveright(dx);});
  container.append(resizeright);

  const resizetop = document.createElement('div');
  resizetop.classList.add('windowresizetop');
  makeDraggable(resizetop, (dx, dy) => {win.movetop(dy);});
  container.append(resizetop);

  const resizebottom = document.createElement('div');
  resizebottom.classList.add('windowresizebottom');
  makeDraggable(resizebottom, (dx, dy) => {win.movebottom(dy);});
  container.append(resizebottom);

  const resizebottomleft = document.createElement('div');
  resizebottomleft.classList.add('windowresizebottom', 'windowresizeleft');
  makeDraggable(resizebottomleft, (dx, dy) => {win.movebottom(dy); win.moveleft(dx);});
  container.append(resizebottomleft);

  const resizetopright = document.createElement('div');
  resizetopright.classList.add('windowresizetop', 'windowresizeright');
  makeDraggable(resizetopright, (dx, dy) => {win.movetop(dy); win.moveright(dx);});
  container.append(resizetopright);

  const resizetopleft = document.createElement('div');
  resizetopleft.classList.add('windowresizetop', 'windowresizeleft');
  makeDraggable(resizetopleft, (dx, dy) => {win.movetop(dy); win.moveleft(dx);});
  container.append(resizetopleft);

  const resizebottomright = document.createElement('div');
  resizebottomright.classList.add('windowresizebottom', 'windowresizeright');
  makeDraggable(resizebottomright, (dx, dy) => {win.movebottom(dy); win.moveright(dx);});
  container.append(resizebottomright);

  console.log("creating window", x, y, w, h, title);
  win.move({x, y});
  win.resize({w, h});
  win.settitle(title);

  // add the window
  document.querySelector("#windowcontainer").append(container);

  // call init if it happens
  if (init != undefined) {
    init(win, args);
  }

  return win;
}
