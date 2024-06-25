sap.ui.define(
    [
      "./BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/Token",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment"
    ],
    function(Controller, Filter, FilterOperator, Token, MessageBox, MessageToast, Fragment) {
      "use strict";
  
      return Controller.extend("com.app.librarysystem.controller.AllBooks", {
        onInit: function() {
          var oView = this.getView();
                var oisbnFilter = oView.byId("idISBNFilterValue12");
                var otitleFilter = oView.byId("idtitleFilterValue12");
                var  oAuthorFilter = oView.byId("iAuthorFilterValue12");
                var  obookidFilter = oView.byId("idbookidFilterValue12");
                let validate = function (args) {
                    if (true) {
                        var text = args.text;
                        return new Token({key: text, text: text});
                    }
                }
                oisbnFilter.addValidator(validate);
                otitleFilter.addValidator(validate);
                oAuthorFilter.addValidator(validate);
                obookidFilter.addValidator(validate);

          const oRouter = this.getOwnerComponent().getRouter();
         oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
        },
        onUserDetailsLoad: function (oEvent) {
          const { id } = oEvent.getParameter("arguments");
          this.ID = id;
          // const sRouterName = oEvent.getParameter("name");
          const oObjectPage = this.getView().byId("idUserListPage");
   
          oObjectPage.bindElement(`/Users(${id})`);
        },
        onGoPressAllBooks: function () {
          const oView = this.getView(),

              oisbnFilter = oView.byId("idISBNFilterValue12"),
              sISBN = oisbnFilter.getTokens(),

              otitleFilter = oView.byId("idtitleFilterValue12"),
              stitle = otitleFilter.getTokens(),

              oAuthorFilter = oView.byId("iAuthorFilterValue12"),
              sAuthor = oAuthorFilter.getTokens(),

              obookidFilter = oView.byId("idbookidFilterValue12"),
              sbookid = obookidFilter.getTokens(),



              oTable = oView.byId("idAllBooksTable"),
              aFilters = [];

              sISBN.filter((element) => {
                  element ? aFilters.push(new Filter("ISBN", FilterOperator.EQ, element.getKey())) : "";
              })

              stitle.filter((element) => {
                  element ? aFilters.push(new Filter("title", FilterOperator.EQ, element.getKey())) : "";
              })

              sAuthor.filter((element) => {
                  element ? aFilters.push(new Filter("author", FilterOperator.EQ, element.getKey())) : "";
              })   
              
              sbookid.filter((element) => {
                  element ? aFilters.push(new Filter("ID", FilterOperator.EQ, element.getKey())) : "";
              }) 
              oTable.getBinding("items").filter(aFilters);
            },
            onClearFilterPressAllbooks: function () {

              const oView = this.getView(),
              oClearFname = oView.byId("idISBNFilterValue12").removeAllTokens(),
              oClearLname = oView.byId("idtitleFilterValue12").removeAllTokens(),
              oClearPhone = oView.byId("iAuthorFilterValue12").removeAllTokens(),
              oClearEmail = oView.byId("idbookidFilterValue12").removeAllTokens();
            },
            // for reservation button in Allbooks page
            reservebutton : async function (oEvent) {
              debugger;
            //   var oSelectedItem = oEvent.getSource().getParent();
            //   var oSelectedUser = oSelectedItem.getBindingContext().getObject();
              var oSelectedBook = this.byId("idAllBooksTable").getSelectedItem().getBindingContext().getObject();
              var oModel = this.getView().getModel("ModelV2");
         
              if (!oSelectedBook) {
                  MessageToast.show("Please select a Book");
                  return;
              }
         
              // Confirmation dialog before proceeding with reservation
              MessageBox.confirm("Are you sure you want to reserve this book?", {
                  title: "Confirm Reservation",
                  onClose: async function (oAction) {
                      if (oAction === MessageBox.Action.OK) {
                          // User confirmed reservation
                          if (this.byId("idAllBooksTable").getSelectedItems().length > 1) {
                              MessageToast.show("Please Select only one Book");
                              return;
                          }
         
                          if (oSelectedBook.quantityAvailable === 0) {
                              MessageToast.show("Book is not available")
                              return;
                          }
         
                          var oQuantity = oSelectedBook.quantityAvailable - 1;
                          const bIsInActiveLones = await this.bookInactiveLoans(oSelectedBook.ID, this.ID);
         
                          if (bIsInActiveLones) {
                              MessageToast.show("You have an active loan for the selected book.");
                              return;
                          }
         
                          const bIsBookReserved = await this.checkIfBookIsReservedByUser(oSelectedBook.ID, this.ID);
         
                          if (bIsBookReserved) {
                              MessageBox.error("This book is already reserved by you.");
                              return;
                          }
         
                          const userModel = new sap.ui.model.json.JSONModel({
                              users_ID: this.ID,
                              books_ID: oSelectedBook.ID,
                              Reservationdate: new Date(),
                              books: {
                                quantityAvailable: oQuantity
                              }
                          });
         
                          this.getView().setModel(userModel, "userModel");
         
                          const oPayload = this.getView().getModel("userModel").getProperty("/");
         
                          try {
                              await this.createData(oModel, oPayload, "/Reservation");
                              oModel.refresh();
                              // Update the selected book's context to mark it as reserved
                              sap.m.MessageBox.success(`${oSelectedBook.title} Book Reserved`);
                              this.getView().byId("idAllBooksTable").getBinding("items").refresh();
                          } catch (error) {
                              MessageBox.error("Some technical issue occurred.");
                          }
                      } else {
                          // User canceled reservation
                          MessageToast.show("Reservation canceled.");
                      }
                  }.bind(this)  // Bind 'this' to the onClose function to maintain the context
              });
          },
         
          checkIfBookIsReservedByUser: function (bookID, userID) {
              return new Promise((resolve, reject) => {
                  const oModel = this.getView().getModel("ModelV2");
                  const oFilters = [
                      new Filter("books_ID", FilterOperator.EQ, bookID),
                      new Filter("users_ID", FilterOperator.EQ, userID)
                  ];
         
                  oModel.read("/Reservation", {
                      filters: oFilters,
                      success: function (oData) {
                          resolve(oData.results.length > 0);
                      },
                      error: function (oError) {
                          reject(oError);
                      }
                  });
              });
          },
         
          bookInactiveLoans: function (bookID, userID) {
              return new Promise((resolve, reject) => {
                  const oModel = this.getView().getModel("ModelV2");
                  const oFilters = [
                      new Filter("books_ID", FilterOperator.EQ, bookID),
                      new Filter("users_ID", FilterOperator.EQ, userID)
                  ];
         
                  oModel.read("/Loans", {
                      filters: oFilters,
                      success: function (oData) {
                          // Check if any of the loans are still active (no return date)
                          const bIsBorrowed = oData.results.some(loans => !loans.ReturnDate);
                          resolve(bIsBorrowed);
                      },
                      error: function (oError) {
                          reject(oError);
                      }
                  });
              });
          }
      });
    }
  );