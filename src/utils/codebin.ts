import axios from "axios";

async function codebinrequest(secret: string, file: any, ctx: any) {
	const inspectFile = file.url;
	const getURL = await axios.get(`${inspectFile}`).then((res) => res.data);
	return await axios
		.post(`https://api.paste.ee/v1/pastes?key=${secret}`, {
			sections: [
				{
					name: `Paste by ${ctx.member?.user?.username}`,
					syntax: "autodetect",
					contents: `${getURL}`,
				},
			],
		})
		.then((res) => res.data);
}

async function codebinrequestmodal(secret: string, ctx: any) {
	const code = ctx.fields.getTextInputValue("codeInput");
	return await axios
		.post(`https://api.paste.ee/v1/pastes?key=${secret}`, {
			sections: [
				{
					name: `Paste by ${ctx.member?.user?.username}`,
					syntax: "autodetect",
					contents: `${code}`,
				},
			],
		})
		.then((res) => res.data);
}

export { codebinrequest, codebinrequestmodal };
