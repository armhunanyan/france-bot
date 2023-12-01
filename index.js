import { svgString2Image } from "./helpers/image.js";
import { createTask, resolveTask } from "./services/2captcha.js";
import { Embassy } from "./services/embassy.js";

const main = async () => {
	const embassySession = new Embassy();
	await embassySession.handshake();
	const captcha = await embassySession.getCaptcha();
	const png = await svgString2Image(captcha.svg, 150, 50, 'png');
	const task = await createTask(png);
	const solution = await resolveTask(task.taskId);
	await embassySession.createReservationSession(solution.text);
	let k = 0;
	let _int = setInterval(async () => {
		k++;
		await embassySession.lookupSession();
		if (k === 10) {
			clearInterval(_int);
		}
	}, 1000 * 60 * 3)
}

main();
