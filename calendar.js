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
	mthEvents: {}, // Events for the selected period
	sDay: 0,
	sMth: 0,
	sYear: 0, // Current selected day, month, year

	// (A3) COMMON HTML ELEMENTS
	nxt: null,
	prev: null,
	hMth: null,
	hYear: null, // month/year selector
	hForm: null,
	hfDate: null,
	hfTxt: null, //event form
	hfSave: null,
	events: null,
	eventsView: null,
	evCards: null,
	alert: null,
	date: null,
	dateSel: null,
	okDate: null,
	cancelDate: null,
	color: null,

	// (B) INIT CALENDAR
	init: () => {
		// (B1) GET + SET COMMON HTML ELEMENTS
		cal.nxt = document.getElementById("nxtMonth");
		cal.nxt.onclick = cal.next;
		cal.prev = document.getElementById("prevMonth");
		cal.prev.onclick = cal.previous;
		cal.hMth = document.getElementById("cal-mth");
		cal.hYear = document.getElementById("cal-yr");
		cal.hfDate = document.getElementById("evt-date");
		cal.hfTxt = document.getElementById("evt-details");
		cal.hfSave = document.getElementById("evt-save");
		document.getElementById("evt-close").onclick = cal.close;
		cal.hfSave.onclick = cal.save;
		cal.events = [];
		cal.eventsView = document.getElementById("eventsDay");
		cal.eventsView.classList.add("ninja");
		cal.evCards = document.getElementById("evt-cards");
		cal.alert = document.getElementById("alert");
		cal.alert.classList.add("ninja");
		cal.date = document.getElementById("date");
		cal.date.onclick = cal.showDateSel;
		cal.dateSel = document.getElementById("dateSel");
		cal.dateSel.classList.add("ninja");
		cal.okDate = document.getElementById("okDate");
		cal.okDate.onclick = cal.okDateSel;
		cal.cancelDate = document.getElementById("cancelDate");
		cal.cancelDate.onclick = cal.closeDateSel;
		cal.color = document.getElementById("evtColor");


		// handle past and future state updates
		window.webxdc.setUpdateListener(function (update) {
			if (update.payload.addition) {
				cal.events.push(update.payload);
			} else {
				var index = cal.events.findIndex((obj) => {
					console.log(obj.id + " != " + update.payload.id);
					return Number.parseInt(obj.id) === Number.parseInt(update.payload.id);
				});
				console.log(index);
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
		// cal.hMth.onchange = cal.list;

		// (B4) APPEND YEARS SELECTOR
		// Set to 10 years range. Change this as you like.
		for (let i = nowYear - 10; i <= nowYear + 10; i++) {
			let opt = document.createElement("option");
			opt.value = i;
			opt.innerHTML = i;
			if (i == nowYear) {
				opt.selected = true;
			}
			cal.hYear.appendChild(opt);
		}
		// cal.hYear.onchange = cal.list;

		// (B5) START - DRAW CALENDAR
		cal.list();
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
		cal.mthEvents = [];

		//remove deleted events

		//get this month events from the updates
		cal.mthEvents = cal.events.filter((event) => {
			return event.month == cal.sMth && event.year == cal.sYear;
		});

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
		// Get container
		let container = document.getElementById("cal-container");
		container.innerHTML = "";

		// First row - Day names
		days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
		if (cal.sMon) {
			days.push(days.shift());
		}
		let week = document.createElement("div");
		for (let d of days) {
			let cCell = document.createElement("div");
			cCell.innerHTML = d;
			week.appendChild(cCell);
		}
		container.appendChild(week);
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
				var eventsDay = cal.getEvents(day);
				if (eventsDay.length !== 0) {
					for (let j = 0; j < eventsDay.length; j++) {
						var evt = document.createElement("div");
						evt.classList.add("evt");
						evt.textContent = eventsDay[j].data;
						evt.style.backgroundColor = eventsDay[j].color;
						cCell.appendChild(evt);
						// cCell.innerHTML +=
						// 	"<div class='evt'>" + eventsDay[j].data + "</div>";
					}
				}
				cCell.onclick = () => {
					cal.show(cCell);
				};
			}
			container.appendChild(cCell);
		}

		// (C5) REMOVE ANY PREVIOUS ADD/EDIT EVENT DOCKET
		cal.close();
	},

	// (D) SHOW EDIT EVENT DOCKET FOR SELECTED DAY
	show: (el) => {
		// (D1) FETCH EXISTING DATA
		cal.sDay = Number.parseInt(el.getElementsByClassName("dd")[0].innerHTML);
		let dayEvents = cal.getEvents(cal.sDay);

		//ADD EVENT BOXES
		cal.hfTxt.value = "";
		cal.evCards.innerHTML = "";
		for (const i in dayEvents) {
			var eventBox = document.createElement("div");
			var remove = document.createElement("span");
			var data = document.createElement("p");
			var author = document.createElement("p");
			var lilHeader = document.createElement("div");
			remove.innerHTML = "&#x2715";
			remove.setAttribute("data-id", dayEvents[i].id);
			remove.onclick = (ev) => {
				cal.del(ev.target.getAttribute("data-id"));
			};
			author.textContent = dayEvents[i].creator;
			author.classList.add("evt-view-name");
			lilHeader.appendChild(author);
			lilHeader.appendChild(remove);
			eventBox.appendChild(lilHeader);
			data.textContent = dayEvents[i].data;
			data.classList.add("evt-data");
			eventBox.style.backgroundColor = dayEvents[i].color;
			eventBox.appendChild(data);
			eventBox.classList.add("evt-view");
			eventBox.classList.add("block");
			cal.evCards.appendChild(eventBox);
		}

		cal.eventsView.classList.remove("ninja");

		// // (D2) UPDATE EVENT FORM
		cal.hfDate.innerHTML = `${cal.sDay} ${cal.mName[cal.sMth]} ${cal.sYear}`;
	},

	// (E) CLOSE EVENT DOCKET
	close: () => {
		cal.eventsView.classList.add("ninja");
	},

	// GET ALL EVENTS FROM A DAY
	getEvents: (day) => {
		var events = cal.mthEvents.filter((event) => {
			return event.day === day;
		});
		return events;
	},

	// (F) SAVE EVENT
	save: () => {
		if (cal.hfTxt.value !== "") {
			// send new updates
			var info = window.webxdc.selfName + " created the event " + cal.hfTxt.value + " on " + cal.sDay + "-" + cal.sMth;
			window.webxdc.sendUpdate(
				{
					payload: {
						id: Date.now(),
						day: cal.sDay,
						month: cal.sMth,
						year: cal.sYear,
						data: cal.hfTxt.value,
						color: cal.color.value,
						addition: true,
						creator: window.webxdc.selfName,
					},
					info,
				},
				info
			);
			return false;
		} else {
			cal.alert.classList.remove("ninja");
		}
	},

	// (G) DELETE EVENT FOR SELECTED DATE
	del: (id) => {
		// send new updates
		var info = window.webxdc.selfName + " deleted an event";
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
	},

	showDateSel: () => {
		cal.dateSel.classList.remove("ninja");
	},

	okDateSel: () => {
		cal.list();
		cal.closeDateSel();
	},

	closeDateSel: () => {
		cal.dateSel.classList.add("ninja");
	},
};
window.addEventListener("load", cal.init);
