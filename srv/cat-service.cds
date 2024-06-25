using my.bookshop as my from '../db/data-model';
@path: '/BooksSRV/'
service CatalogService {
    entity Books as projection on my.Books;
    entity Users as projection on my.Users;
    entity Loans as projection on my.Loans;
    entity Reservation as projection on my.Reservation;
}