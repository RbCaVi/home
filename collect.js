// collectibles

const collect_version = 3;
const collect_prefix = 'collect-' + collect_version + '-'

function collect_init() {
	localStorage.setItem('collect-version', collect_version);
	localStorage.setItem(collect_prefix + 'items', '[]');
}

function collect_reset() {
	collect_init();
	const things = document.querySelectorAll('[oncollect]');
	for (const thing of things) {
		const collect_event = new Event('collect-reset');
		thing.dispatchEvent(collect_event);
	}
}

const version = +localStorage.getItem('collect-version');
if (version == 0) {
	collect_init();
}

if (version < 2) {
	localStorage.setItem('collect-version', collect_version);
	localStorage.setItem(collect_prefix + 'items', '{}');
}

if (version < 3) {
	localStorage.setItem('collect-version', collect_version);
	localStorage.setItem(collect_prefix + 'items', '[]');
}

const collect_items = JSON.parse(localStorage.getItem(collect_prefix + 'items'));

function collect(item) {
	if (!collect_items.includes(item)) {
		collect_items.push(item);
		localStorage.setItem(collect_prefix + 'items', JSON.stringify(collect_items));
		const collect_event = new Event('collect-get');
		collect_event.data = item;
		window.dispatchEvent(collect_event);
	}
}

function collect_has(item) {
	return collect_items.includes(item);
}

window.addEventListener('collect-get', function(e) {
	console.log(e.data, 'collected');
});

window.addEventListener('collect-get', function(e) {
	const things = document.querySelectorAll('[oncollect]');
	for (const thing of things) {
		const collect_event = new Event('collect');
		collect_event.data = e.data;
		thing.dispatchEvent(collect_event);
	}
});

window.addEventListener('load', function() {
	for (const item of collect_items) {
		const collect_event = new Event('collect-get');
		collect_event.data = item;
		window.dispatchEvent(collect_event);
	}
});