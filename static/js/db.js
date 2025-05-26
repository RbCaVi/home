window.db = (() => {
  const url = 'https://qryngvppzavugzdeheuk.supabase.co/rest/v1';
  const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeW5ndnBwemF2dWd6ZGVoZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NjUzMzEsImV4cCI6MjA0MzE0MTMzMX0.1H1MWNCfd0cro4TBk4ak529iMPlpN8RahITQuvCrXR0';
  const headers = {
    apikey,
    "Content-Type": "application/json",
  };
  
  const resphandler = data => async res => {
    if (!res.ok) {
      throw new Error("bad database request :(", {cause: [data, await res.json()]});
    }
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  return {
    call: (func, data) => fetch(`${url}/rpc/${func}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    }).then(resphandler(data)),
    select: (table, params) => fetch(`${url}/${table}?${new URLSearchParams(params).toString()}`, {
      headers,
    }).then(resphandler(params)),
    insert: (table, data) => fetch(`${url}/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    }),
  };
})();
