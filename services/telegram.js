const	botToken = '6482267895:AAF3o2eHn0JsaUTcbUnuy5NOKbPrFM_hLiE';
const alertChatId = -1002103947558;
const logChatId = -1002122260468;

export const sendNotification = (text, isAlert = true) => {
	fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${isAlert ? alertChatId : logChatId}&text=${text}`, {
		"method": "GET",
		"mode": "cors",
		"credentials": "omit"
	});
}