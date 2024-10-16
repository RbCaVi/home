function hashcreds(user, pass) {
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return {username: user, passhash: chash}
}

function makeaccount(user, pass) {
  // make sure there isn't already a user by that name
  return db_call('create_user', hashcreds(user, pass));
}

// login and get a token + userid
function login(user, pass) {
  return db_call('login', hashcreds(user, pass));
}

function refresh(token) {
  return db_call('refresh_token', {token}).then(data => data.token);
}

function logout(token) {
  return db_call('logout', {token});
}

function changepass(token, user, pass) {
  return db_call('change_pass', {...hashcreds(user, pass), token});
}

async function getsessions(user) {
  const escapeduser = user.replace('"', '\\"');
  const uid = (await db_select('users', {username: `eq.${escapeduser}`, select: "id"}))[0].id;
  return db_select('sessions', {user: `eq.${uid}`, select: "tokenhash,expire"});
}

function endsession(token, sessionhash) {
  return db_call('end_session', {token, sessionhash});
}