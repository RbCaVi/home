// collectibles

window.collect = (() => {
	if (window.collect) {
		return window.collect;
	}

	const collect = {};

	const collect_version = 4;
	const collect_prefix = 'collect-' + collect_version + '-';

	let collect_items;

	function collect_init() {
		localStorage.setItem('collect-version', collect_version);
		localStorage.setItem(collect_prefix + 'items', '[]');
	}

	function collect_setup() {
		collect_items = JSON.parse(localStorage.getItem(collect_prefix + 'items'));
	}

	collect.reset = function() {
		collect_init();
		collect_setup();
	}

	const version = +localStorage.getItem('collect-version');
	if (version == 0) {
		collect_init();
	}

	const collect_prefix_old = 'collect-' + version + '-';

	if (version < 2) {
		localStorage.setItem('collect-version', collect_version);
		localStorage.setItem(collect_prefix + 'items', '{}');
	}

	if (version < 3) {
		localStorage.setItem('collect-version', collect_version);
		localStorage.setItem(collect_prefix + 'items', '[]');
	}

	if (version < 4) {
		localStorage.setItem('collect-version', collect_version);
		const collect_items = JSON.parse(localStorage.getItem(collect_prefix_old + 'items'));
		localStorage.setItem(collect_prefix + 'items', JSON.stringify(collect_items.map(i => [i, undefined])));
	}

	collect_setup();

	function fire_collect(item, secret) {
		const collect_event = new Event('collect-get');
		collect_event.data = item;
		collect_event.secret = secret;
		window.dispatchEvent(collect_event);
	}

	collect.collect = function(item, secret) {
		if (!collect_items.map(([i, s]) => i).includes(item)) {
			collect_items.push([item, secret]);
			localStorage.setItem(collect_prefix + 'items', JSON.stringify(collect_items));
			fire_collect(item, secret);
		} else if (!collect_items.includes([item, secret])) {
			const items = collect_items.filter(([i, s]) => i == item);
			if (items.length != 1) {
				throw item + ' not found';
			}
			items[0][1] = secret;
			fire_collect(item, secret);
		}
	}

	collect.has = function(item) {
		return collect_items.map(([i, s]) => i).includes(item);
	}

  // please don't update this directly
  // use the other methods instead (please)
	collect.data = function(item) {
		return collect_items;
	}
  
	collect.items = function(item) {
		return collect_items.map(([item, key]) => item);
	}

	collect.get_secret = function(item) {
		const items = collect_items.filter(([i, s]) => i == item);
		if (items.length != 1) {
			throw item + ' not found';
		}
		return items[0][1];
	}

	collect.listen = function(target, listener, filter) {
	  target.setAttribute("oncollect", "");
		if (filter == undefined) {
			// no filter
		} else if (typeof filter == 'string') {
			const l = listener; // save it
			listener = function (e) {if (e.data == filter) {return l.bind(this)(e)}};
		} else {
      // assume filter is an array of strings to check
			const l = listener; // save it
			listener = function (e) {if (filter.includes(e.data)) {return l.bind(this)(e)}};
    }
	  target.addEventListener('collect', listener);
		for (const [item, secret] of collect_items) {
			const collect_event = new Event('collect');
			collect_event.data = item;
			collect_event.secret = secret;
			target.dispatchEvent(collect_event);
		}
	}

	window.addEventListener('collect-get', function(e) {
		console.log(e.data, 'collected');
	});

	window.addEventListener('collect-get', function(e) {
		const things = document.querySelectorAll('[oncollect]');
		for (const thing of things) {
			const collect_event = new Event('collect');
			collect_event.data = e.data;
			collect_event.secret = e.secret;
			thing.dispatchEvent(collect_event);
		}
	});

	window.addEventListener('load', function() {
		for (const [item, secret] of collect_items) {
			fire_collect(item, secret);
		}
	});

	return collect;
})();