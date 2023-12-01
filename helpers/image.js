import { createCanvas, Image } from 'canvas';

export const svgString2Image = async (svgString, width, height, format) => {
	return new Promise((resolve, reject) => {
		format = format ? format : 'png';
		const svgData = 'data:image/svg+xml;base64,' + svgString;
		const canvas = createCanvas(width, height)
		const context = canvas.getContext('2d');
	
		const image = new Image();
		image.onload = () => {
				context.clearRect(0, 0, width, height);
				context.drawImage(image, 0, 0, width, height);
				const pngData = canvas.toDataURL('image/' + format);
				const base64 = pngData;
				// console.log(base64);
				resolve(getBase64FromBasePng(pngData));
		};
		image.src = svgData;
	})
}

export const getBase64FromBasePng = (str) => {
	const data = str.split('data:image/png;base64,');
	return data[1];
}