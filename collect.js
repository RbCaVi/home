// collectibles

const collect_version = 3;
const collect_prefix = 'collect-' + collect_version + '-'

function init_collect() {
	localStorage.setItem('collect-version', collect_version);
}

const version = +localStorage.getItem('collect-version');
if (version == 0) {
	init_collect();
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
	}
}

function collect_has(id) {
	for (const item of collect_items) {
		if (item == id) {
			return true;
		}
	}
}