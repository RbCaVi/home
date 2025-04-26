window.account = (() => {
  const accountprototype = {};
  
  return {
    create: async (user, pass) => (await auth.makeaccount(user, pass), account.login(user, pass)),
    login: async (user, pass) => Object.create(accountprototype, {
      token: {value: await auth.login(user, pass)},
      id: {value: (await db.select('users', {username: "eq." + user.replace('"', '\\"'), select: "id"}))[0].id},
    }),
    addmethod: (name, f) => accountprototype[name] = f,
  };
})();