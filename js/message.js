function sendmessage(token, chatid, message) {
  return db_call('send_message', {token, chatid, message});
}

async function seemessages(chatid) {
  return (await db_select(
    'textmessages',
    {chat: `eq.${chatid}`, select: "created_at,content,users(username)", order: "created_at.desc"}
  )).map(({created_at, content, users: {username}}) => {
    return {
      timestamp: created_at,
      message: content,
      user: username,
    }
  });
}