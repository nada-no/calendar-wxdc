
var cal = {
	// (A) PROPERTIES
	// (A1) COMMON CALENDAR
	sMon: true, // Week start on Monday?
	mName: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	], // Month Names

	// (A2) CALENDAR DATA
	// mthEvents: {}, // Events for the selected period
	sDay: 0,
	sMth: 0,
	sYear: 0, // Current selected day, month, year

	// (A3) COMMON HTML ELEMENTS
	nxt: null,
	prev: null,
	nxtDay: null,
	prevDay: null,
	hMth: null,
	hYear: null, // month/year selector
	hForm: null,
	hfDate: null,
	container: null,
	hfTxt: null, //event form
	hfSave: null,
	events: null,
	eventsView: null,
	evCards: null,
	date: null,
	dateSel: null,
	okDate: null,
	cancelDate: null,
	color: null,
	days: null,
	touchstartX: 0,
	touchendX: 0,
	calendar: null,
	import: null,
	export: null,
	importScreen: null,
	importScrBtn: null,
	importArea: null,
	closeImportBtn: null,

	// (B) INIT CALENDAR
	init: () => {
		// (B1) GET + SET COMMON HTML ELEMENTS
		cal.container = document.getElementById("cal-container");
		cal.nxtDay = document.getElementById("nxtDay");
		cal.nxtDay.onclick = cal.nextDay;
		cal.prevDay = document.getElementById("prevDay");
		cal.prevDay.onclick = cal.previousDay;
		cal.nxt = document.getElementById("nxtMonth");
		cal.nxt.onclick = cal.next;
		cal.prev = document.getElementById("prevMonth");
		cal.prev.onclick = cal.previous;
		cal.hMth = document.getElementById("cal-mth");
		cal.hYear = document.getElementById("cal-yr");
		cal.hfDate = document.getElementById("evt-date");
		cal.hfTxt = document.getElementById("evt-details");
		cal.hfSave = document.getElementById("evt-save");
		cal.hfSave.classList.add("unclickable");
		document.getElementById("evt-close").onclick = cal.close;
		cal.hfSave.onclick = cal.save;
		cal.events = [];
		events= cal.events; //link to the export var
		cal.eventsView = document.getElementById("eventsDay");
		cal.eventsView.classList.add("ninja");
		cal.evCards = document.getElementById("evt-cards");
		cal.date = document.getElementById("date");
		cal.date.onclick = cal.showDateSel;
		cal.dateSel = document.getElementById("dateSel");
		cal.dateSel.classList.add("ninja");
		cal.okDate = document.getElementById("okDate");
		cal.okDate.onclick = cal.okDateSel;
		cal.cancelDate = document.getElementById("cancelDate");
		cal.cancelDate.onclick = cal.closeDateSel;
		cal.color = "#FAD02C";
		cal.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		cal.calendar = document.getElementById("cal");
		cal.calendar.classList.add("ninja");
		cal.import = document.getElementById("evt-import");
		cal.import.onclick = () => {
			getClipboard(cal.importArea.value);
		};
		cal.export = document.getElementById("evt-export");
		cal.export.onclick = () => {
			cal.importArea.value = setClipboard();
		};
		cal.importScreen = document.getElementById("importScreen");
		cal.importScreen.classList.add("ninja");
		cal.importScrBtn = document.getElementById("evt-imp-exp");
		cal.importScrBtn.onclick = cal.openImport;
		cal.importArea = document.getElementById("importArea");
		cal.closeImportBtn = document.getElementById("closeImport");
		cal.closeImportBtn.onclick = cal.closeImport;

		// swipe listeners for mobile
		cal.container.addEventListener(
			"touchstart",
			function (event) {
				cal.touchstartX = event.changedTouches[0].screenX;
			},
			false
		);

		cal.container.addEventListener(
			"touchend",
			function (event) {
				cal.touchendX = event.changedTouches[0].screenX;
				if (cal.touchendX < cal.touchstartX - 100) {
					cal.next();
				} else if (cal.touchendX > cal.touchstartX + 100) {
					cal.previous();
				}
			},
			false
		);

		// cal.eventsView.addEventListener(
		// 	"touchstart",
		// 	function (event) {
		// 		cal.touchstartX = event.changedTouches[0].screenX;
		// 	},
		// 	false
		// );

		// cal.eventsView.addEventListener(
		// 	"touchend",
		// 	function (event) {
		// 		cal.touchendX = event.changedTouches[0].screenX;
		// 		if (cal.touchendX < cal.touchstartX - 100) {
		// 			cal.nextDay();
		// 		} else if (cal.touchendX > cal.touchstartX + 100) {
		// 			cal.previousDay();
		// 		}
		// 	},
		// 	false
		// );

		// handle past and future state updates
		window.webxdc.setUpdateListener(function (update) {
			if (update.payload.addition) {
				cal.events.push(update.payload);
			} else {
				var index = cal.events.findIndex((obj) => {
					return Number.parseInt(obj.id) === Number.parseInt(update.payload.id);
				});
				cal.events.splice(index, 1);
			}
			cal.list();
		});

		// (B2) DATE NOW
		let now = new Date(),
			nowMth = now.getMonth(),
			nowYear = parseInt(now.getFullYear());

		// (B3) APPEND MONTHS SELECTOR
		for (let i = 0; i < 12; i++) {
			let opt = document.createElement("option");
			opt.value = i;
			opt.innerHTML = cal.mName[i];
			if (i == nowMth) {
				opt.selected = true;
			}
			cal.hMth.appendChild(opt);
		}

		// (B4) APPEND YEARS SELECTOR
		// Set to 10 years range. Change this as you like.
		for (let i = nowYear - 30; i <= nowYear + 30; i++) {
			let opt = document.createElement("option");
			opt.value = i;
			opt.innerHTML = i;
			if (i == nowYear) {
				opt.selected = true;
			}
			cal.hYear.appendChild(opt);
		}

		// (B5) START - DRAW CALENDAR
		cal.list();
	},

	//PREVIOUS DAY
	previousDay: () => {
		let daysInMonth = () => {
			return new Date(cal.sYear, cal.sMth + 1, 0).getDate();
		};
		if (cal.sDay - 1 > 0) {
			cal.show(cal.sYear, cal.sMth, cal.sDay - 1);
		} else {
			if (cal.sMth - 1 >= 0) {
				cal.sMth--;
				cal.show(cal.sYear, cal.sMth, daysInMonth());
			} else {
				cal.sMth = 11;
				cal.sYear--;
				cal.show(cal.sYear, cal.sMth, daysInMonth());
			}
		}
		console.log(cal.sYear + "-" + cal.sMth + "-" + cal.sDay);
	},

	//NEXT DAY
	nextDay: () => {
		let daysInMonth = () => {
			return new Date(cal.sYear, cal.sMth + 1, 0).getDate();
		};
		if (cal.sDay + 1 <= daysInMonth()) {
			cal.show(cal.sYear, cal.sMth, cal.sDay + 1);
		} else {
			if (cal.sMth + 1 > 11) {
				cal.sMth = 0;
				cal.sYear++;
				cal.show(cal.sYear, cal.sMth, 1);
			} else {
				cal.sMth++;
				cal.show(cal.sYear, cal.sMth, 1);
			}
		}
		console.log(cal.sMth + "-" + cal.sDay);
	},

	//PREVIOUS MONTH
	previous: () => {
		if (cal.hMth.value > 0) {
			cal.hMth.value = Number.parseInt(cal.hMth.value) - 1;
		} else {
			cal.hYear.value = Number.parseInt(cal.hYear.value) - 1;
			cal.hMth.value = "11";
		}
		cal.list();
	},

	//NEXT MONTH
	next: () => {
		if (cal.hMth.value < 11) {
			cal.hMth.value = Number.parseInt(cal.hMth.value) + 1;
		} else {
			cal.hYear.value = Number.parseInt(cal.hYear.value) + 1;
			cal.hMth.value = "0";
		}
		cal.list();
	},

	// (C) DRAW CALENDAR FOR SELECTED MONTH
	list: () => {
		// (C1) BASIC CALCULATIONS - DAYS IN MONTH, START + END DAY
		// Note - Jan is 0 & Dec is 11
		// Note - Sun is 0 & Sat is 6
		cal.sMth = parseInt(cal.hMth.value); // selected month
		cal.sYear = parseInt(cal.hYear.value); // selected year
		let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(), // number of days in selected month
			startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
			endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // last day of the month
			now = new Date(), // current date
			nowMth = now.getMonth(), // current month
			nowYear = parseInt(now.getFullYear()), // current year
			nowDay =
				cal.sMth == nowMth && cal.sYear == nowYear ? now.getDate() : null;

		// (C2) LOAD DATA FROM LOCALSTORAGE
		// cal.mthEvents = [];

		// //get this month events from the updates
		// cal.mthEvents = cal.events.filter((event) => {
		// 	return event.month == cal.sMth && event.year == cal.sYear;
		// });

		// (C3) DRAWING CALCULATIONS
		// Blank squares before start of month
		let squares = [];
		if (cal.sMon && startDay != 1) {
			let blanks = startDay == 0 ? 7 : startDay;
			for (let i = 1; i < blanks; i++) {
				squares.push("b");
			}
		}
		if (!cal.sMon && startDay != 0) {
			for (let i = 0; i < startDay; i++) {
				squares.push("b");
			}
		}

		// Days of the month
		for (let i = 1; i <= daysInMth; i++) {
			squares.push(i);
		}

		// Blank squares after end of month
		if (cal.sMon && endDay != 0) {
			let blanks = endDay == 6 ? 1 : 7 - endDay;
			for (let i = 0; i < blanks; i++) {
				squares.push("b");
			}
		}
		if (!cal.sMon && endDay != 6) {
			let blanks = endDay == 0 ? 6 : 6 - endDay;
			for (let i = 0; i < blanks; i++) {
				squares.push("b");
			}
		}

		// (C4) DRAW HTML CALENDAR
		// Get container reset
		cal.container.innerHTML = "";

		// First row - Day names
		let week = document.createElement("div");
		let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		for (let d of days) {
			let cCell = document.createElement("div");
			cCell.innerHTML = d;
			week.appendChild(cCell);
		}
		cal.container.appendChild(week);
		week.classList.add("head");

		// Today's date
		cal.date.innerHTML = cal.mName[cal.sMth] + " " + cal.sYear;

		// Days in Month
		let total = squares.length;
		for (let i = 0; i < total; i++) {
			var day = squares[i];
			let cCell = document.createElement("div");
			if (day == "b") {
				cCell.classList.add("blank");
			} else {
				if (nowDay == day) {
					cCell.classList.add("today");
				} else {
					cCell.classList.add("day");
				}
				cCell.innerHTML = `<div class="dd">${day}</div>`;

				//retrieve events for this day
				var eventsDay = cal.getEvents(cal.sYear, cal.sMth, day);
				if (eventsDay.length !== 0) {
					for (let j = 0; j < eventsDay.length; j++) {
						var evt = document.createElement("div");
						evt.classList.add("evt");
						evt.textContent = eventsDay[j].data;
						evt.style.backgroundColor = eventsDay[j].color;
						cCell.appendChild(evt);
					}
				}
				cCell.onclick = () => {
					cal.getDayToShow(cCell);
				};
			}
			cal.container.appendChild(cCell);
		}
		cal.calendar.classList.remove("ninja");
	},

	// (D) SHOW EDIT EVENT DOCKET FOR SELECTED DAY
	getDayToShow: (el) => {
		let day = Number.parseInt(el.getElementsByClassName("dd")[0].innerHTML);
		cal.show(cal.sYear, cal.sMth, day);
	},

	show: (year, month, day) => {
		// (D1) FETCH EXISTING DATA
		cal.sDay = day;
		let dayEvents = cal.getEvents(year, month, day);

		//ADD EVENT BOXES
		cal.hfTxt.value = "";
		cal.hfSave.classList.add("unclickable");
		cal.hfTxt.addEventListener("input", () => {
			if (cal.hfTxt.value.trim() != "") {
				cal.hfSave.classList.remove("unclickable");
			} else {
				cal.hfSave.classList.add("unclickable");
			}
		});

		cal.evCards.innerHTML = "";
		for (const i in dayEvents) {
			var eventBox = document.createElement("div");
			var remove = document.createElement("span");
			var exportBtn = document.createElement("span");
			var data = document.createElement("p");
			var author = document.createElement("p");
			var lilHeader = document.createElement("div");

			exportBtn.innerHTML = "Export";
			exportBtn.setAttribute("data-id", dayEvents[i].id);
			exportBtn.setAttribute("class", "event-export");
			exportBtn.onclick = (ev) => {
				cal.exportOne(ev.target.getAttribute("data-id"));
			};
			remove.innerHTML = "&#x2715";
			remove.setAttribute("data-id", dayEvents[i].id);
			remove.onclick = (ev) => {
				cal.del(ev.target.getAttribute("data-id"));
			};
			author.textContent = dayEvents[i].creator;
			author.classList.add("evt-view-name");
			lilHeader.appendChild(author);
			lilHeader.appendChild(remove);
			lilHeader.appendChild(exportBtn);
			eventBox.appendChild(lilHeader);
			data.textContent = dayEvents[i].data;
			data.classList.add("evt-data");
			eventBox.style.backgroundColor = dayEvents[i].color;
			eventBox.appendChild(data);
			eventBox.classList.add("evt-view");
			eventBox.classList.add("block");
			cal.evCards.appendChild(eventBox);
		}

		//color buttons
		var yellow = document.getElementById("yellow"),
			red = document.getElementById("red"),
			blue = document.getElementById("blue"),
			green = document.getElementById("green");

		selectColor(yellow);

		yellow.onclick = (ev) => selectColor(ev.target);
		red.onclick = (ev) => selectColor(ev.target);
		blue.onclick = (ev) => selectColor(ev.target);
		green.onclick = (ev) => selectColor(ev.target);

		function selectColor(el) {
			cal.color = el.getAttribute("data-color");
			var buttons = document.getElementsByClassName("colorBtns");
			for (let i = 0; i < buttons.length; i++) {
				if (buttons[i].getAttribute("data-color") == cal.color) {
					buttons[i].style.backgroundColor = cal.color;
				} else {
					buttons[i].style.backgroundColor = "transparent";
				}
			}
		}

		cal.container.classList.add("ninja");
		cal.eventsView.classList.remove("ninja");

		// // (D2) UPDATE EVENT FORM
		let fullDate = new Date(year, month, day);
		cal.hfDate.innerHTML = `${cal.days[fullDate.getDay()]} ${day} ${
			cal.mName[month]
		} ${year}`;
	},

	// (E) CLOSE EVENT DOCKET
	close: () => {
		cal.eventsView.classList.add("ninja");
		cal.container.classList.remove("ninja");
		// cal.list();
	},

	// GET ALL EVENTS FROM A DAY
	getEvents: (year, month, day) => {
		var events = cal.events.filter((event) => {
			return event.day == day && event.year == year && event.month == month;
		});
		return events;
	},

	// (F) SAVE EVENT
	save: () => {
		if (cal.hfTxt.value !== "") {
			// send new updates
			var info =
				window.webxdc.selfName +
				" created the event " +
				cal.hfTxt.value.replace(/\n/g, ' ') +
				" on " +
				cal.mName[cal.sMth] +
				" " +
				cal.sDay;
			window.webxdc.sendUpdate(
				{
					payload: {
						id: Date.now(),
						day: cal.sDay,
						month: cal.sMth,
						year: cal.sYear,
						data: cal.hfTxt.value,
						color: cal.color,
						addition: true,
						creator: window.webxdc.selfName,
					},
					info,
				},
				info
			);
			cal.close();
			return false;
		}
	},

	// (G) DELETE EVENT FOR SELECTED DATE
	del: (id) => {
		// send new updates
		var info =
			window.webxdc.selfName +
			" deleted an event from " +
			cal.mName[cal.sMth] +
			" " +
			cal.sDay;
		window.webxdc.sendUpdate(
			{
				payload: {
					id: id,
					day: cal.sDay,
					month: cal.sMth,
					year: cal.sYear,
					data: cal.hfTxt.value,
					addition: false,
					deleter: window.webxdc.selfName,
				},
				info,
			},
			info
		);
		document
			.querySelector('[data-id="' + id + '"]')
			.parentElement.parentElement.remove();
	},

	showDateSel: () => {
		cal.container.classList.add("ninja");
		cal.dateSel.classList.remove("ninja");
	},

	okDateSel: () => {
		cal.list();
		cal.closeDateSel();
	},

	closeDateSel: () => {
		cal.container.classList.remove("ninja");
		cal.dateSel.classList.add("ninja");
	},

	openImport: () => {
		cal.importScreen.classList.remove("ninja");
	},

	closeImport: () => {
		cal.importArea.value = "";
		cal.importScreen.classList.add("ninja");
		cal.close();
	},

	exportOne: (id) => {
		let event = cal.events.filter((ev)=> {return Number.parseInt(ev.id) === Number.parseInt(id)});
		let icsString = makeString(event);
		cal.importScreen.classList.remove("ninja");
		cal.eventsView.classList.add("ninja");
		cal.importArea.value = icsString;
	},
};
window.addEventListener("load", cal.init);
