import VueRemindCalendar from "./vue-remind-calendar";

const remindCalendar = {
	install (Vue, options) {
		Vue.component(VueRemindCalendar.name, VueRemindCalendar);
	}
}

if(typeof window !== 'undefined' && window.Vue) {
	window.Vue.use(remindCalendar);
}

export default remindCalendar
