const Apify = require('apify');
const {
    utils: {enqueueLinks},
} = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: `https://fotmob.com` });

    const handlePageFunction = async ({ request, $ }) => {
        console.log(`processing ${request.url}`)
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
            console.log(`Enqueueing ${enqueued.length} URLs`);
        } else {
            const teamNameELements = $(`span.css-nquafn-MfHeaderTeamTitle`);
            const teamHome = teamNameELements.eq(0).text();
            const teamGuest = teamNameELements.eq(1).text();
            console.log(`${teamHome} - ${teamGuest}`);
            const results = {
                url: request.url,
                teamHome,
                teamGuest,
            };

            await Apify.pushData(results);
        }
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 20,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});


    /* 
    - получить новые адреса для извлечения Наименований команд и Времени\счета игры из DETAILS;
    - изучить INPUT и OUTPUT;
    **/