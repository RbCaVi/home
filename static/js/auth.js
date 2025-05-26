window.auth = (() => {
  let hashcreds = (user, pass) => ({username: user, passhash: hash.oldhash(user + hash.oldhash(pass))}) // "use the username as a salt"
  
  return {
    makeaccount: (user, pass) => db.call('create_user', hashcreds(user, pass)),
    login: (user, pass) => db.call('login', hashcreds(user, pass)), // login and get a token + userid
    refresh: token => db.call('refresh_token', {token}).then(data => data.token),
    logout: token => db.call('logout', {token}),
    changepass: (token, user, pass) => db.call('change_pass', {...hashcreds(user, pass), token}),
    getsessions: user => db.select('users', {username: "eq." + user.replace('"', '\\"'), select: "id"})
        .then(rows => rows[0].id)
        .then(uid => db.select('sessions', {user: `eq.${uid}`, select: "tokenhash,expire"})),
    endsession: (token, sessionhash) => db.call('end_session', {token, sessionhash}),
    resetpass: (token, user, pass) => db.call('reset_password', {token: token, ...hashcreds(user, pass)}),
  }
})();