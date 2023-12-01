const clientKey = '8f348182f601dc4fac3c661c1dade98d';

export const createTask = async (image) => {
	const request = await fetch("https://api.2captcha.com/createTask", {
		method: "POST",
		body: JSON.stringify({
			clientKey,
			task: {
					type: "ImageToTextTask",
					body: image,
					phrase: false,
					case: false,
					numeric: 0,
					math: false,
					minLength: 4,
					maxLength: 4,
					comment: "enter the text you see on the image"
			},
			"languagePool": "en"
		}),
	});
	const response = await request.json();
	console.log("task:", response);
	return response;
}

export const getTaskResult = async (taskId) => {
	const request = await fetch("https://api.2captcha.com/getTaskResult", {
		method: "POST",
		body: JSON.stringify({
			clientKey, 
			taskId
	 }),
	});
	const response = await request.json();
	console.log("status:", response);
	return response;
}

export const resolveTask = async (taskId) => {
	return new Promise((resolve, reject) => {
		const _int = setInterval(async() => {
			const result = await getTaskResult(taskId);
			if (result.status === "ready") {
				clearInterval(_int);
				resolve(result.solution)
			}
		}, 10000);
	});
}