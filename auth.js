function makeaccount(user, pass) {
  // make sure there isn't already a user by that name
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('create_user', {user, hash: chash});
}

// login and get a token + userid
function login(user, pass) {
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('login', {user, hash: chash}).then(res => res.json());
}

function refresh(token) {
  return db_call('refresh_token', {token}).then(res => res.json().token);
}

function logout(token) {
  return db_call('logout', {token});
}

function changepass(token, user, pass) {
  const phash = hash(pass);
  const chash = hash(user + hash(pass)); // "use the username as a salt"
  return db_call('change_pass', {user, hash: chash, token});
}

async function getsessions(user) {
  const escapeduser = user.replace('"', '\\"');
  const uid = db_select('users', {user: `eq.'${escapeduser}'`, select: "id"})[0];
  return db_select('sessions', {user: `eq.'${uid}'`, select: "tokenhash,expire"});
}

function endsession(token, sessionhash) {
  return db_call('end_session', {token, sessionhash});
}
