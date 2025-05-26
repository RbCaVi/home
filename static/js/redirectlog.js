window.redirectlog = (() => {
  const savedlog = [];
  let log = console.log;
  console.log = function newlog(...arguments) {
    savedlog.push(arguments);
    log(...arguments);
  }
  return {
    setlog: f => {log = f; for (const message in savedlog) log(...message)},
    log,
  };
})()