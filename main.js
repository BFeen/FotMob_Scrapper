const Apify = require('apify');
const {
    utils: {enqueueLinks},
} = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: `https://fotmob.com`});

    const handlePageFunction = async ({ request, $ }) => {
        const title = $(`title`).text();
        console.log(`The title of ${request.url} is: ${title}.`);

        // const enqueued = await enqueueLinks({
        //     $,
        //     requestQueue,
        //     selector: `a[href]`,
        //     // pseudoUrls: ['https://www.fotmob.com/livescores/[\d+]/matchfacts[.*]'], 
        //     // https://www.fotmob.com/livescores/3411669/matchfacts/arsenal-vs-everton?date=20210423 
        //     baseUrl: request.loadedUrl,
        // });

        const teamElements = $(`span.css-1i87lf9-TeamName`);
        const timeElements = $(`span.css-8o8lqm`);

        const teamNames = [];
        const time = [];

        const result = [];

        teamElements.each((i) => teamNames.push(teamElements.eq(i).text()));
        timeElements.each((i) => time.push(timeElements.eq(i).text()));

        for (let i=0; i<timeElements.length; i++) {
            result.push(`${teamNames.shift()} - ${time.shift()} - ${teamNames.shift()}`);
        }

        console.log(result);

        // console.log(`Enqueueing ${enqueued.length} URLs`);
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 20,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});
