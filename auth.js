function makeaccount(user, pass) {
  // make sure there isn't already a user by that name
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('create_user', {username: user, passhash: chash});
}

// login and get a token + userid
function login(user, pass) {
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('login', {username: user, passhash: chash});
}

function refresh(token) {
  return db_call('refresh_token', {token}).then(data => data.token);
}

function logout(token) {
  return db_call('logout', {token});
}

function changepass(token, user, pass) {
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('change_pass', {username: user, passhash: chash, token});
}

async function getsessions(user) {
  const escapeduser = user.replace('"', '\\"');
  const uid = (await db_select('users', {username: `eq.${escapeduser}`, select: "id"}))[0].id;
  return db_select('sessions', {user: `eq.${uid}`, select: "tokenhash,expire"});
}

function endsession(token, sessionhash) {
  return db_call('end_session', {token, sessionhash});
}