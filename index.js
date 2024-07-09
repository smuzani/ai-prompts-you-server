const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

const logger = require("firebase-functions/logger");
const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-3-5-sonnet-20240620";
const DEFAULT_NAME = "Linky";
const DEFAULT_PERSONALITY = "You are confident. You are used to formal writing. You would wear a suit if you weren't already confined to hyperlink chains. You sound more intelligent than me. You are empathic, a good listener. You start most conversations with \"It looks like...\"";

const { getPromptTitle, getPromptOutline, getPromptArticle } = require("./prompts");

// hosted on firebase functions
setGlobalOptions({ region: "us-central1" })
exports.createTitle = onRequest(
	// put CLAUDE KEY in Google Secrets
	{ cors: true, secrets: ["CLAUDE_KEY"] },
	async (request, response) => {
		// input validation
		if (request.method !== "POST") {
			return response.status(405).send();
		}

		let input = request.body.input;
		if (!input) {
			return response.status(400).send("Body should include 'input'");
		}

		const name = request.body.name ?? DEFAULT_NAME;
		const personality = request.body.personality ?? DEFAULT_PERSONALITY;
		// done input validation

		const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });
		try {
			const msg = await anthropic.messages.create({
				model: MODEL,
				max_tokens: 1200,
				temperature: 1,
				system: getPromptTitle(name, personality),
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: input
							}
						]
					}
				]
			});
			return response.status(200).send(msg.content[0].text);
		} catch (error) {
			logger.error("Failed to do anything: ", error);
			return response.status(500).send("Internal Server Error");
		}
	});

exports.createOutline = onRequest(
	{ cors: true, secrets: ["CLAUDE_KEY"] },
	async (request, response) => {
		// input validation
		if (request.method !== "POST") {
			return response.status(405).send();
		}

		let input = request.body.input;
		if (!input) {
			return response.status(400).send("Body should include 'input'");
		}

		const name = request.body.name ?? DEFAULT_NAME;
		const personality = request.body.personality ?? DEFAULT_PERSONALITY;
		// done input validation

		const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });
		try {
			const msg = await anthropic.messages.create({
				model: MODEL,
				max_tokens: 1200,
				temperature: 1,
				system: getPromptOutline(name, personality),
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: input
							}
						]
					}
				]
			});
			return response.status(200).send(msg.content[0].text);
		} catch (error) {
			logger.error("Failed to do anything: ", error);
			return response.status(500).send("Internal Server Error");
		}
	});

exports.writeArticle = onRequest(
	{ cors: true, secrets: ["CLAUDE_KEY"] },
	async (request, response) => {
		// input validation
		if (request.method !== "POST") {
			return response.status(405).send();
		}

		let input = request.body.input;
		if (!input) {
			return response.status(400).send("Body should include 'input'");
		}

		const name = request.body.name ?? DEFAULT_NAME;
		const personality = request.body.personality ?? DEFAULT_PERSONALITY;
		// done input validation

		const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });
		try {
			const msg = await anthropic.messages.create({
				model: MODEL,
				max_tokens: 4000,
				temperature: 1,
				system: getPromptArticle(name, personality),
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: input
							}
						]
					}
				]
			});
			return response.status(200).send(msg.content[0].text);
		} catch (error) {
			logger.error("Failed to do anything: ", error);
			return response.status(500).send("Internal Server Error");
		}
	});