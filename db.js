const url = 'https://qryngvppzavugzdeheuk.supabase.co/rest/v1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyeW5ndnBwemF2dWd6ZGVoZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NjUzMzEsImV4cCI6MjA0MzE0MTMzMX0.1H1MWNCfd0cro4TBk4ak529iMPlpN8RahITQuvCrXR0';

function db_call(func, data) {
  return fetch(`${url}/rpc/${func}`, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			apikey: apikey,
			"Content-Type": "application/json",
    }
	}).then(async res => {
		try {
			return await res.json()
		} catch {
			return null;
		}
	});
}

function db_select(table, params) {
  const query = new URLSearchParams(params).toString();
  return fetch(`${url}/${table}?${query}`, {
		headers: {
			apikey: apikey,
		},
	}).then(res => res.json());
}
