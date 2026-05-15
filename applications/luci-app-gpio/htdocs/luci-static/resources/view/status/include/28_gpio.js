'use strict';
'require baseclass';
'require rpc';

const callListGpios = rpc.declare({
	object: 'luci.gpio',
	method: 'list',
	expect: { result: [] },
	reject: true
});

const callSetGpio = rpc.declare({
	object: 'luci.gpio',
	method: 'set',
	params: [ "name", "value" ],
	reject: true
});

return baseclass.extend({
	title: _('GPIO'),

	load() {
		return callListGpios();
	},

	render(gpios) {
		if (gpios.length == 0) {
			return null;
		}
		return E('div',
			{ 'style': 'display:grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); margin-bottom:1em;' },
			gpios.map(L.bind(this.renderGpio, this))
		);
	},

	renderGpio(gpio) {
		const isReadOnly = !L.hasViewPermission() || null;
		const toggleValue = !gpio.value;
		const toggleLabel = toggleValue ? _('Turn on') : _('Turn off');
		const toggleClass = toggleValue ? 'cbi-button-apply' : 'cbi-button-reset';
		const toggleHandler = L.bind(this.handleGpioSet, this, gpio, toggleValue);

		return E('div', { 'class': 'ifacebox', 'style': 'margin:.25em;min-width:70px;max-width:100px' }, [
			E('div', { 'class': 'ifacebox-head', 'style': 'font-weight:bold' }, [ gpio.description ]),
			E('div', { 'class': 'ifacebox-body' }, [
				E('button', {
					'class': 'cbi-button ' + toggleClass,
					'click': toggleHandler,
					'data-tooltip': toggleLabel + ": " + gpio.description,
					'disabled': isReadOnly,
				}, [ toggleLabel ])
			])
		]);
	},

	handleGpioSet(gpio, value, ev) {
		ev.currentTarget.classList.add('spinning');
		ev.currentTarget.disabled = true;
		ev.currentTarget.blur();

		return callSetGpio(gpio.name, value)
			.then(() => {
				ev.currentTarget.classList.remove('spinning');
			});
	}
});
