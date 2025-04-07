window.auth = (() => {
  let hashcreds = (user, pass) => ({username: user, passhash: oldhash(user + oldhash(pass))}) // "use the username as a salt"
  
  return {
    makeaccount: (user, pass) => db_call('create_user', hashcreds(user, pass)),
    login: (user, pass) => db_call('login', hashcreds(user, pass)), // login and get a token + userid
    refresh: token => db_call('refresh_token', {token}).then(data => data.token),
    logout: token => db_call('logout', {token}),
    changepass: (token, user, pass) => db_call('change_pass', {...hashcreds(user, pass), token}),
    getsessions: user => db_select('users', {username: "eq." + user.replace('"', '\\"'), select: "id"})
        .then(rows => rows[0].id)
        .then(uid => db_select('sessions', {user: `eq.${uid}`, select: "tokenhash,expire"})),
    endsession: (token, sessionhash) => db_call('end_session', {token, sessionhash}),
    resetpass: (token, user, pass) => db_call('reset_password', {token: token, ...hashcreds(user, pass)}),
  }
})();