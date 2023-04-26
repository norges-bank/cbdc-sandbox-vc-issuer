import { test, expect } from "@playwright/test";

test("oidc testing", async ({ page, request }) => {
	await page.goto("http://localhost");

	await page.waitForSelector("#login").then((el) => el.click());

	await page.waitForSelector("#TestIdOIDCChain").then((el) => el.click());

	const pid = await page.waitForSelector("#pid");
	await pid.fill("22866097996");

	await page.waitForSelector("#submit").then((el) => el.click());

	// Sometimes ID-porten asks for phone number and email

	if (!page.url().includes("code")) {
		await page.waitForSelector('input[name="idporten\\.input\\.CONTACTINFO_MOBILE"]').then((el) => el.fill("40876543"));
		await page.waitForSelector('input[name="idporten\\.inputrepeat\\.CONTACTINFO_MOBILE"]').then(
			(el) => el.fill("40876543"),
		);
		await page.waitForSelector('input[name="idporten\\.input\\.CONTACTINFO_EMAIL"]').then(
			(el) => el.fill("patent@test.no"),
		);
		await page.waitForSelector('input[name="idporten\\.inputrepeat\\.CONTACTINFO_EMAIL"]').then(
			(el) => el.fill("patent@test.no"),
		);

		await page.click("#idporten\\.inputbutton\\.NEXT");
	}

	// Expect the GET parameter "code" to be present
	expect(page.url())
		.toContain("code");

	// Get idporten code from url #URLSearchParams not working
	const code = page.url().split("code=")[1];
	expect(code).toBeTruthy();

	// A request should go to /api/login to fetch a VC
	await page.waitForSelector("#vc-string");
	await page.waitForSelector("#vc-download");
});
