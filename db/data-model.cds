namespace my.bookshop;

entity Books {
  key ID : Integer;
  title  : String;
  author : String;
  ISBN : String;
  genre : String;
  stock : Integer;
  quantityAvailable : Integer;
  language : String;
  users : Association to Users;
  loans : Association to many Loans on loans.books = $self;
}
@assert.unique:{
username: [username]
}
entity Users {
  key ID : Integer;
  username : String;
  password : String;
  email : String;
  phonenumber :Integer64;
  address : String;
  role : String;
  books : Association to many Books on books.users = $self;
  loans : Association to many Loans on loans.users = $self;
  reservations: Association to many  Reservation on reservations.users = $self;
}

entity Loans {
   key ID : Integer;
   books : Association to Books;
   users : Association to Users;
   issuseDate : Date;
   ReturnDate : Date;
   notify:String;
}

entity Reservation {
  key ID : Integer;
  books : Association to Books;
  users : Association to Users;
  Reservationdate : Date;
  
}