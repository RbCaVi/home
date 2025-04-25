account.addmethod("addscript", function addscript(name, script) {
  return db.call('add_script', {token: this.token, name, script});
});

account.addmethod("getownscripts", async function addscript(name, script) {
  return (await db.select(
    'scripts',
    {user: `eq.${this.getid()}`, select: "created_at,name,script"}
  )).map(({created_at, name, script}) => {
    return {
      timestamp: created_at,
      name,
      script,
    }
  });
});

window.scripts = {
  getscripts: async function getscripts(name, script) {
    return (await db.select(
      'scripts',
      {select: "created_at,name,script,users(username)"}
    )).map(({created_at, name, script, users: {username}}) => {
      return {
        timestamp: created_at,
        name,
        script,
        username,
      }
    });
  }
}