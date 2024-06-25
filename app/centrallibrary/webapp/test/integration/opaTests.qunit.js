sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/app/centrallibrary/test/integration/FirstJourney',
		'com/app/centrallibrary/test/integration/pages/BooksList',
		'com/app/centrallibrary/test/integration/pages/BooksObjectPage',
		'com/app/centrallibrary/test/integration/pages/LoansObjectPage'
    ],
    function(JourneyRunner, opaJourney, BooksList, BooksObjectPage, LoansObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/app/centrallibrary') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBooksList: BooksList,
					onTheBooksObjectPage: BooksObjectPage,
					onTheLoansObjectPage: LoansObjectPage
                }
            },
            opaJourney.run
        );
    }
);