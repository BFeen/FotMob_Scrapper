const Apify = require('apify');
const {
    utils: {enqueueLinks},
} = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: `https://fotmob.com` });

    const handlePageFunction = async ({ request, $ }) => {
        // console.log(`processing ${request.url}`)
        if (!request.userData.detailPage) {
            const enqueued = await enqueueLinks({
                $,
                requestQueue,
                selector: `a[href]`,
                pseudoUrls: [`https://www.fotmob.com/livescores/[\\d+]/matchfacts[.*]`],
                baseUrl: request.loadedUrl,
                transformRequestFunction: req => {
                    req.userData.detailPage = true;
                    return req;
                }
            });
            // console.log(`Enqueueing ${enqueued.length} URLs`);
        } else {
            const teamNameELements = $(`span.css-nquafn-MfHeaderTeamTitle`);

            const result = {
                url: request.url,
                teamHome: teamNameELements.eq(0).text(),
                teamGuest: teamNameELements.eq(1).text(),
                matchInfo: $(`span.css-jkaqxa`).text(),
            };
            console.log(`${result.teamHome} - ${result.teamGuest} : ${result.matchInfo}`);

            await Apify.pushData(result);
        }
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 20,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});
