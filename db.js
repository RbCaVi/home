const url = 'https://qryngvppzavugzdeheuk.supabase.co/rest/v1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeW5ndnBwemF2dWd6ZGVoZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NjUzMzEsImV4cCI6MjA0MzE0MTMzMX0.1H1MWNCfd0cro4TBk4ak529iMPlpN8RahITQuvCrXR0';

function calldb(func, data) {
  return fetch(`${url}/rpc/${func}`, {
		method: "POST",
		body: data,
		headers: {
			apikey: apikey,
			"Content-Type": "application/json",
    }
	});
}

function selectdb(table, params) {
  const parts = params.entries().map(([k,v]) => `${k}=${v}`);
  const query = parts.join('&');
  return fetch(`${url}/${table}?${query}`, {
		headers: {
			apikey: apikey,
		},
	});
}
