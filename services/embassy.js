import dayjs from 'dayjs';
import { sendNotification } from './telegram.js';

export class Embassy {
	appId;
	csrfToken;
	ck;
	sessionId;
	teamId = '6229dd2c43b3b977c5fe0ef5';
	serviceId = '62ac40f24b0f3a05f2119497';
	startDate;
	endDate;
	blankDays = [
		'2023-12-25',
		'2024-01-01',
		'2024-01-02'
	];
	commonHeaders = {
		accept: "application/json, text/plain, */*",
		"accept-language": "en",
		"sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-site",
	}

	async handshake() {
		const request = await fetch("https://api.consulat.gouv.fr/api/handshake", {
			"headers": {
				...this.commonHeaders,
				"x-gouv-app-id": "fr.gouv$+lbipf4zZ5TEbHKMQLOrBY2qXcgmNWQLh%%664317d5-94f9-47d7-9ccb-6b1adbfa525f-meae-ttc",
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "HEAD",
			"mode": "cors",
			"credentials": "omit"
		});
		this.appId = request.headers.get("X-Gouv-App-Id");
		this.csrfToken = request.headers.get("X-Gouv-Handshake");
	}

	async getCaptcha() {
		const request = await fetch("https://api.consulat.gouv.fr/api/captcha?locale=en", {
			"headers": {
				...this.commonHeaders,
				"if-none-match": "W/\"5565-eMe5ikstkKjzX6Z9hBXvnMLQm1k\"",
				"x-gouv-app-id": this.appId,
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "omit"
		});
		this.ck = request.headers.get("X-Gouv-Csrf");
		return request.json();
	}

	async createReservationSession(captcha) {
		const request = await fetch(`https://api.consulat.gouv.fr/api/team/${this.teamId}/reservations-session`, {
			"headers": {
				...this.commonHeaders,
				"content-type": "application/json",
				"x-csrf-token": this.csrfToken,
				"x-gouv-app-id": this.appId,
				"x-gouv-ck": this.ck,
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": JSON.stringify({
				standaloneServiceName: "Visas",
				sessionId: null,
				captcha: `troov_c_${captcha}`
			}),
			"method": "POST",
			"mode": "cors",
			"credentials": "omit"
		});
		const response = request.json();
		this.sessionId = response._id;
		return response;
	}

	async getReservationSession() {
		fetch(`https://api.consulat.gouv.fr/api/team/${this.teamId}/reservations-session?sessionId=${this.sessionId}&standaloneServiceName=Visas`, {
			"headers": {
				...this.commonHeaders,
				"x-gouv-app-id": this.appId,
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "omit"
		});
	}

	async getInterval() {
		const request = await fetch(`https://api.consulat.gouv.fr/api/team/${this.teamId}/reservations/get-interval?serviceId=${this.serviceId}`, {
			"headers": {
				...this.commonHeaders,
				"x-gouv-app-id": this.appId,
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			"body": null,
			"method": "GET",
			"mode": "cors",
			"credentials": "omit"
		});
		const response = await request.json();
		return response;
	}

	async getExcludeDays(start, end) {
		const request = await fetch("https://api.consulat.gouv.fr/api/team/6229dd2c43b3b977c5fe0ef5/reservations/exclude-days", {
			"headers": {
				...this.commonHeaders,
				"content-type": "application/json",
				"x-gouv-app-id": this.appId,
				"x-gouv-web": "fr.gouv.consulat"
			},
			"referrer": "https://consulat.gouv.fr/en/ambassade-de-france-a-erevan/appointment?name=Visas",
			"referrerPolicy": "no-referrer-when-downgrade",
			body: JSON.stringify({
				start,
				end,
				session: {
					[this.serviceId]: 1,
				},
				sessionId: this.sessionId
			}),
			"method": "POST",
			"mode": "cors",
			"credentials": "omit"
		});
		const response = await request.json();
		return response;
	}

	async lookupSession() {
		const interval = await this.getInterval();
		const start = dayjs();
		const end = dayjs(interval.end);
		const excludeDays = await this.getExcludeDays(start.format("YYYY-MM-DD[T]HH:mm:ss"), end.format("YYYY-MM-DD[T]HH:mm:ss"));
		const diffDays = end.endOf('day').diff(start.startOf('day'), 'days');
		const possibleDays = [];
		for (let i = 0; i <= diffDays; i++) {
			const newDate = start.add(i, 'day').format("YYYY-MM-DD");
			if (excludeDays.indexOf(newDate) === -1 && this.blankDays.indexOf(newDate) === -1) {
				possibleDays.push(newDate);
			}
		}
		if (possibleDays.length > 0) {
			sendNotification(`Available slots! ${possibleDays.join(', ')}`)
		}

		sendNotification(`Still alive, ${diffDays}`, false);
	}
}