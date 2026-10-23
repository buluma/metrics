//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  let browser = null

  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q["16personalities"]) || (!imports.metadata.plugins["16personalities"].enabled(enabled, {extras})))
      return null

    //Load inputs
    let {url, sections, scores} = imports.metadata.plugins["16personalities"].inputs({data, account, q})
    if (!url)
      throw {error: {message: "URL is not set"}}

    //Start puppeteer and navigate to page
    console.debug(`metrics/compute/${login}/plugins > 16personalities > starting browser`)
    browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > 16personalities > started ${await browser.version()}`)
    const page = await browser.newPage()
    console.debug(`metrics/compute/${login}/plugins > 16personalities > loading ${url}`)
    await page.goto(url, {waitUntil: imports.puppeteer.events})
    await page.waitForFunction(() =>
      document.querySelector(".type__code")
      || (document.querySelector('[data-testid="typeheader"] .code') && document.querySelector('[data-testid="profile-traits-visualization"] button[role="tab"]'))
    )

    //Fetch raw data
    const raw = await page.evaluate(async() => {
      //Legacy profile layout
      if (document.querySelector(".type__code")) {
        return {
          color: getComputedStyle(document.querySelector(".card__bg")).backgroundColor, //eslint-disable-line no-undef
          type: document.querySelector(".type__code").innerText,
          personality: [...document.querySelectorAll(".personality-cards .sp-personality-card")].map(card => ({
            category: card.querySelector(".card__title").innerText,
            value: card.querySelector(".card__subtitle").innerText,
            image: card.querySelector(".card__image").src,
            text: card.querySelector(".card__text").innerText,
          })),
          traits: [...document.querySelectorAll("#traits .card__body")].map(card => ({
            category: card.querySelector(".card__title").innerText,
            value: card.querySelector(".card__subtitle").innerText,
            score: card.querySelector(".center__num").innerText,
            text: card.querySelector("p").innerText,
          })),
        }
      }

      //Current profile layout
      const header = document.querySelector('[data-testid="typeheader"]')
      const type = header.querySelector(".code").innerText.trim()
      const profileName = header.querySelector("h1 span:nth-of-type(2)").innerText.trim()
      const intro = document.querySelector("#intro, [data-testid=\"premium-report-article\"]")?.innerText.trim() ?? ""
      const traits = [...document.querySelectorAll('[data-testid="profile-traits-visualization"] button[role="tab"]')].map(tab => {
        const description = tab.querySelector('[id^="trait-desc-"]')
        const match = description?.querySelector("h4")?.innerText.trim().match(/^(.+?):\s*(\d+%)\s*(.+)$/)
        if (!description || !match)
          return null
        return {
          category: match[1],
          score: match[2],
          value: match[3],
          text: description.querySelector("p")?.innerText.trim() ?? "",
        }
      }).filter(Boolean)

      return {
        color: getComputedStyle(header.querySelector(".section__wrap")).backgroundColor, //eslint-disable-line no-undef
        type,
        personality: [{category: "personality", value: profileName, image: header.querySelector("img")?.src ?? "", text: intro}],
        traits,
      }
    })
    if (!raw.traits.length)
      throw new Error("Could not read personality traits from the profile")

    //Format data
    const {color} = raw
    const type = raw.type.replace("(", "").replace(")", "").trim()
    const personality = await Promise.all(raw.personality.map(async ({category, value, image, text}) => ({
      category,
      value: value.replace(`(${type})`, "").trim(),
      image: await imports.imgb64(image),
      text: text.replace(`${category}\n${value}\n`, "").trim(),
    })))
    const traits = raw.traits.map(({category, value, score, text}) => ({
      category,
      value: `${value[0]}${value.substring(1).toLocaleLowerCase()}`,
      score: scores ? Number(score.replace("%", "")) / 100 : NaN,
      text: text.split(".").slice(1).join("."),
    }))

    //Results
    return {sections, color, type, personality, traits}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
  finally {
    try {
      await browser?.close()
    }
    catch (error) {
      console.debug(`metrics/compute/${login}/plugins > 16personalities > failed to close browser > ${error}`)
    }
  }
}
