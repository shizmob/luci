'use strict';
'require view';
'require fs';
'require uci';
'require form';

return view.extend({
	load() {
		return fs.list('/sys/class/gpio').then(files => files
			.filter(f => f.type === "directory" && !f.name.startsWith("gpiochip"))
			.map(f => {
				let pinId;
				if ((pinId = /^gpio(\d+)$/.exec(f.name)) !== null) {
					return pinId[1];
				}
				return f.name;
			})
		);
	},

	render(availablePins) {
		const isReadOnly = !L.hasViewPermission() || null;
		let m, s, o;

		m = new form.Map("system",
			_('<abbr title="General Purpose Input/Output">GPIO</abbr> Configuration'),
			_('Change values of the device <abbr title="General Purpose Input/Output">GPIO</abbr> pins.'));
		m.tabbed = false;
		m.readonly = isReadOnly;

		s = m.section(form.GridSection, 'gpio_switch', '');
		s.addremove = !isReadOnly;
		s.sortable = true;
		s.addbtntitle = _('Add GPIO pin');
		s.nodescriptions = true;

		s.option(form.Value, 'name', _('Description'));
		o = s.option(form.ListValue, 'gpio_pin', _('Pin'));
		for (let pin of availablePins) {
			o.value(pin);
		}

		o = s.option(form.Flag, 'value', _('On'));
		o.rmempty = false;

		return m.render();
	},
});
