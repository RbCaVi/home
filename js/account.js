window.account = (() => {
  const accountprototype = {
    getid: async () => this.id ?? (this.id = await db.select('users', {username: "eq." + user.replace('"', '\\"'), select: "id"})),
  }
  
  return {
    create: async (user, pass) => (await auth.makeaccount(user, pass), account.login(user, pass)),
    login: async (user, pass) => Object.create(accountprototype, {token: {value: await auth.login(user, pass)}}),
    addmethod: (name, f) => accountprototype[name] = f,
  };
})();