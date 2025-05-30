window.chat = (() => {
  return {
    send: (token, chatid, message) => db.call('send_message', {token, chatid, message}),
    get: chatid => db.select(
      'textmessages',
      {chat: `eq.${chatid}`, select: "created_at,content,users(username)", order: "created_at.desc"}
    ).then(l => l.map(({created_at, content, users: {username}}) => ({
      timestamp: created_at,
      message: content,
      user: username,
    }))),
  }
})();