// create offer - user and info
// search offers
// accept offer (creates negotiation in database)

window.connect = (() => {
  const negotiateprototype = {
  	_connectionnegotiate: function(kind, data) {return db.call('negotiate_message', {token: this.owner.token, negotiation: this.id, kind, data});},
  	sendinitiatordescription: function(data) {return this._connectionnegotiate('idesc', data)},
  	sendresponderdescription: function(data) {return this._connectionnegotiate('rdesc', data)},
  	sendinitiatorice: function(data) {return this._connectionnegotiate('iice', data)},
  	sendresponderice: function(data) {return this._connectionnegotiate('rice', data)},
  	_getnegotiations: async function(kind) {
		  return (await db.select(
		    'connectionnegotiationmessages',
		    {select: "data", negotiation: 'eq.' + this.id, kind: 'eq.' + kind}
		  )).map(({data}) => {
		    return data;
		  });
		},
		getinitiatordescriptions: function() {return this._getnegotiations('idesc')},
  	getresponderdescriptions: function() {return this._getnegotiations('rdesc')},
  	getinitiatorices: function() {return this._getnegotiations('iice')},
  	getresponderices: function() {return this._getnegotiations('rice')},
  };

  const offerprototype = {
  	getnegotiations: async function() {
		  return (await db.select(
		    'connectionnegotiation',
		    {select: "id,created_at,connectionoffers(info,users(username)),users(username)", offer: 'eq.' + this.id}
		  )).map(({id, created_at, connectionoffers: {info, users: {username: initiator}}, users: {username: responder}}) => {
		    return Object.create(negotiateprototype, {
		    	owner: {value: this.owner},
		    	id: {value: id},
		      timestamp: {value: created_at},
					info: {value: info},
					initiator: {value: initiator},
					responder: {value: responder},
		    });
		  });
		},
  };

	account.addmethod('createoffer', async function(info) {
		return Object.create(offerprototype, {
			owner: {value: this},
			id: {value: (await db.call('create_offer', {token: this.token, info}))},
			info: {value: info},
		});
	});
	account.addmethod('acceptoffer', async function(id) {
		let nid = await db.call('accept_offer', {token: this.token, offer: id});
	  return (await db.select(
	    'connectionnegotiation',
	    {select: "id,created_at,connectionoffers(info,users(username)),users(username)", id: 'eq.' + nid}
	  )).map(({id, created_at, connectionoffers: {info, users: {username: initiator}}, users: {username: responder}}) => {
	    return Object.create(negotiateprototype, {
	    	owner: {value: this},
	    	id: {value: id},
	      timestamp: {value: created_at},
				info: {value: info},
				initiator: {value: initiator},
				responder: {value: responder},
	    });
	  })[0];
	});

	return {
	  getoffers: async function getoffers() {
	    return (await db.select(
	      'connectionoffers',
	      {select: "id,created_at,users(username),info"}
	    )).map(({id, created_at, users: {username}, info}) => {
	      return Object.create(offerprototype, {
	      	id: {value: id},
	        timestamp: {value: created_at},
	        username: {value: username},
	        info: {value: info},
	      });
	    });
	  },
	};
})();
// poll for accepted offers
// poll for remote description
// poll for ICE candidates

// and finally connect