let chatid = 2;
let token = '';

function refreshMessages() {
  return chat.get(chatid).then(messages => {
    messagebox.textContent = '';
    
    const squashedmessages = [];
    for (const {timestamp, message, user} of messages) {
      const {timestamp: stimestamp, message: smessage, user: suser} = squashedmessages.at(-1) || {};
      if (smessage == message && suser == user) {
        squashedmessages.at(-1).count++;
        squashedmessages.at(-1).from = timestamp;
      } else {
        squashedmessages.push({timestamp, count: 1, message, user});
      }
    }
    
    for (const {timestamp, from, count, message, user} of squashedmessages) {
			const messagecontainer = element('p', {class_: 'chat-message'}, element('span', {class_: 'chat-user', text: user}));
			
			if (count == 1) {
				messagecontainer.append(' at ', element('span', {class_: 'chat-timestamp', text: timestamp}));
			} else {
				messagecontainer.append(
          ' ', 
          element("span", {classes: ['chat-count']}, count), 
          ' times from ', 
          element("span", {classes: ['chat-to']}, from),
          ' to ',
          element("span", {classes: ['chat-from']}, timestamp), 
        );
      }
			
			messagecontainer.append(': ', element('span', {class_: 'chat-message', text: message}));
			
			messagebox.append(messagecontainer);
    }
  });
}

async function sendmessage() {
  const message = messageinput.value;
  messageinput.value = '';
  await chat.send(token, chatid, message);
  refreshMessages();
}

async function login(username, password) {
  if ((token = await auth.login(username, password)) != null) {
    logincontainer.style.display = "none";
    loggedincontainer.style.display = "";
  } else {
    success.textContent = "failed";
  }
}

async function logout() {
  token = '';
  logincontainer.style.display = "";
  loggedincontainer.style.display = "none";
  success.textContent = "";
}

async function createaccount(username, password) {
  if (await auth.makeaccount(username, password)) {
    await login(username, password);
  } else {
    success.textContent = "failed";
  }
}

async function resetpassword(username, password, resettoken) {
  await auth.resetpass(resettoken, username, password);
  await login(username, password);
}

function movechat(newid) {
  if (!isNaN(newid)) {
    chatid = newid;
    refreshMessages();
  }
}

setInterval(refreshMessages, 5000);
refreshMessages();