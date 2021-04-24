const Apify = require('apify');
const {
    utils: {enqueueLinks},
} = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: `https://fotmob.com`});

    const handlePageFunction = async ({ request, $ }) => {
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
            let teamNameELements = $(`span.css-nquafn-MfHeaderTeamTitle`);
            console.log(`${teamNameELements.eq(0).text()} - ${teamNameELements.eq(1).text()}`);
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
    PURL заработали
    - разделить handleFunc на DETAILS и COMMON;
    - получить новые адреса для извлечения Наименований команд и Времени\счета игры из DETAILS;
    - изучить INPUT и OUTPUT;
    - сформировать return result. 
    **/