"use strict";


const fetchWithCaptcha = async function ({canonicalURL}) {
    const $ = cheerio.load("html with captcha URL");
    let captchaURL = $("img#captcha").attr('src');//fetch captureURL
    captchaURL = captchaURL ? url.resolve(canonicalURL, captchaURL) : null;
    if (!captchaURL) throw new Error("Captcha URL not found in home:\n");
    let captchaPage = await fetchPage({canonicalURL: captchaURL, requestOptions: {method: "GET"}});

    console.log("solving captcha");
    let captchaResult = await resolveCaptcha(await captchaPage.response.buffer());
    console.log('captcha result:', captchaResult);
    if (!captchaResult) throw new Error("Captcha not solved successfully: " + captchaResult);

    //you have captcha value as string, use it in form to send

    //PS: This is not for Google ReCaptcha
};