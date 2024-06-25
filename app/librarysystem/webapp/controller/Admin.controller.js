sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/Token",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        "sap/ui/model/odata/v2/ODataModel",
        "sap/m/MessageToast"
    ],
    function (BaseController, Filter, FilterOperator, Token, JSONModel, Fragment, MessageBox, ODataModel, MessageToast) {
        "use strict";

        return BaseController.extend("com.app.librarysystem.controller.Admin", {
            onInit: function () {
                //Filter 
                var oView = this.getView();
                var oisbnFilter = oView.byId("idISBNFilterValue");
                var otitleFilter = oView.byId("idtitleFilterValue");
                var oAuthorFilter = oView.byId("iAuthorFilterValue");
                var obookidFilter = oView.byId("idbookidFilterValue");
                let validate = function (args) {
                    if (true) {
                        var text = args.text;
                        return new Token({ key: text, text: text });
                    }
                }
                oisbnFilter.addValidator(validate);
                otitleFilter.addValidator(validate);
                oAuthorFilter.addValidator(validate);
                obookidFilter.addValidator(validate);
                //json model for creating book
                const oLocalModel = new JSONModel({
                    ID: "",
                    title: "",
                    author: "",
                    ISBN: "",
                    genre: "",
                    stock: "",
                    quantityAvailable: "",
                    language: ""
                });
                this.getView().setModel(oLocalModel, "localModel");
                this.getRouter().attachRoutePatternMatched(this.onBookListLoad, this);

                //json model for issuse books
                var ActiveloanModel = new JSONModel({
                    users: {
                        ID: "",
                    books: {
                            ISBN: "",
                        }
                    },
                    dueDate: "",
                    issueDate:""
                });
                this.getView().setModel(ActiveloanModel, "ActiveloanModel");
            },
            onBookListLoad: function () {
                this.getView().byId("idBooksTable").getBinding("items").refresh();
            },
            //filter go
            onGoPress: function () {
                const oView = this.getView(),

                    oisbnFilter = oView.byId("idISBNFilterValue"),
                    sISBN = oisbnFilter.getTokens(),

                    otitleFilter = oView.byId("idtitleFilterValue"),
                    stitle = otitleFilter.getTokens(),

                    oAuthorFilter = oView.byId("iAuthorFilterValue"),
                    sAuthor = oAuthorFilter.getTokens(),

                    obookidFilter = oView.byId("idbookidFilterValue"),
                    sbookid = obookidFilter.getTokens(),



                    oTable = oView.byId("idBooksTable"),
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
            // clear filter
            onClearFilterPress: function () {

                const oView = this.getView(),
                    oClearFname = oView.byId("idISBNFilterValue").removeAllTokens(),
                    oClearLname = oView.byId("idtitleFilterValue").removeAllTokens(),
                    oClearPhone = oView.byId("iAuthorFilterValue").removeAllTokens(),
                    oClearEmail = oView.byId("idbookidFilterValue").removeAllTokens();
            },
            // loading fragment for add button
            addButton: async function () {
                if (!this.oCreateBooksDialog) {
                    this.oCreateBooksDialog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.librarysystem.Fragments.CreateBookDialog",
                        controller: this
                    });
                    this.getView().addDependent(this.oCreateBooksDialog);
                }

                this.oCreateBooksDialog.open();
            },

            onCloseDialog: function () {
                if (this.oCreateBooksDialog.isOpen()) {
                    this.oCreateBooksDialog.close()
                }
            },
            // for creating book 
            onCreateBook: async function () {
                const oPayload = this.getView().getModel("localModel").getProperty("/"),
                    oModel = this.getView().getModel("ModelV2");
                    oPayload.quantityAvailable = oPayload.stock;
                try {
                    const oTitleExist = await this.checkTitle(oModel, oPayload.title, oPayload.ISBN)
                        if (oTitleExist) {
                            MessageBox.success("Book already exsist")
                            return
                        }
                    await this.createData(oModel, oPayload, "/Books");
                    this.getView().byId("idBooksTable").getBinding("items").refresh();
                    this.oCreateBooksDialog.close();
                } catch (error) {
                    this.oCreateBooksDialog.close();
                    MessageBox.error("Some technical Issue");
                }
            },
            checkTitle: async function (oModel, stitle, sISBN) {
                return new Promise((resolve, reject) => {
                    oModel.read("/Books", {
                        filters: [
                            new Filter("title", FilterOperator.EQ, stitle),
                            new Filter("ISBN", FilterOperator.EQ, sISBN)
 
                        ],
                        success: function (oData) {
                            resolve(oData.results.length > 0);
                        },
                        error: function () {
                            reject(
                                "An error occurred while checking username existence."
                            );
                        }
                    })
                })
            },
            // deleting a book
            DeleteBook: async function () {
                var that = this; // Preserve 'this' context
                var aSelectedItems = this.byId("idBooksTable").getSelectedItems();
                if (aSelectedItems.length > 0) {
                    MessageBox.confirm("Are you sure you want to delete the selected book(s)?", {
                        title: "Confirm Deletion",
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                var aISBNs = [];
                                aSelectedItems.forEach(function (oSelectedItem) {
                                    var sISBN = oSelectedItem.getBindingContext().getObject().title;
                                    var oQuantity1 = oSelectedItem.getBindingContext().getObject().stock
                                    var oAQuantity1 = oSelectedItem.getBindingContext().getObject().quantityAvailable
 
                                    if (oQuantity1 == oAQuantity1) {
                                        aISBNs.push(sISBN);
                                        oSelectedItem.getBindingContext().delete("$auto");
                                    } else {
                                        MessageBox.error("Book has a Active loan");
                                        return; // Stop further execution
                                    }
                                });
 
                                Promise.all(aISBNs.map(function (sISBN) {
                                    return new Promise(function (resolve, reject) {
                                        resolve(sISBN + " Successfully Deleted");
                                    });
                                })).then(function (aMessages) {
                                    aMessages.forEach(function (sMessage) {
                                        MessageBox.success(sMessage);
                                    });
                                }).catch(function (oError) {
                                    MessageBox.error("Deletion Error: " + oError);
                                });
 
                                that.getView().byId("idBooksTable").removeSelections(true);
                                that.getView().byId("idBooksTable").getBinding("items").refresh();
                            }
                        }
                    });
                    jQuery('.sapMMessageBoxText').css('color', 'red');
                } else {
                    MessageBox.error("Please Select Rows to Delete");
                }
            },
            // when you press Active lone it route to Activeloan page
            PressActiveloans: function () {
                const oRouter = this.getRouter();
                oRouter.navTo("RouteActiveLoans")
            },
            //fragment loading when u click on issue button in admin page
            onIssuebutton: async function () {
                if (!this.oIssuebookDailog) {
                    this.oIssuebookDailog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.librarysystem.Fragments.IssueBookDialog",
                        controller: this
                    });
                    this.getView().addDependent(this.oIssuebookDailog);
                }

                this.oIssuebookDailog.open();
            },

            onissuebookscancelbtn: function () {
                if (this.oIssuebookDailog.isOpen()) {
                    this.oIssuebookDailog.close()
                }
            },
            //by clicking on issuse button in issue dialog box
            onIssuebtnpress: async function (oEvent) {
                console.log(this.byId("issuebooksTable").getSelectedItem().getBindingContext().getObject())
                if (this.byId("issuebooksTable").getSelectedItems().length > 1) {
                    MessageToast.show("Please Select only one Book");
                    return
                }
                var oSelectedBook = this.byId("issuebooksTable").getSelectedItem().getBindingContext().getObject(),
                oAval = oSelectedBook.books.quantityAvailable - 1;
               
                var current = new Date();
                let due = new Date(current.getFullYear(), current.getMonth() + 1, current.getDay() + 1)
 
                const userModel = new sap.ui.model.json.JSONModel({
                    books_ID: oSelectedBook.books.ID,
                    users_ID: oSelectedBook.users.ID,
                    issuseDate: new Date(),
                    ReturnDate: due,
                    notify:
                `Your reserved book " ${oSelectedBook.books.title} " is issued`,
                    books: {
                        quantityAvailable: oAval
                    }
 
                });
                this.getView().setModel(userModel, "userModel");
 
                const oPayload = this.getView().getModel("userModel").getProperty("/"),
                    oModel = this.getView().getModel("ModelV2");
 
                try {
                    await this.createData(oModel, oPayload, "/Loans");
                    sap.m.MessageBox.success("Book is issued");
 
                    this.byId("issuebooksTable").getSelectedItem().getBindingContext().delete("$auto");
                    oModel.update("/Books(" + oSelectedBook.books.ID + ")", oPayload.books, {
                        success: function () {
                           
                        },
                        error: function (oError) {
                            //this.oEditBooksDialog.close();
                            sap.m.MessageBox.error("Failed to update book: " + oError.message);
                        }.bind(this)
                    });
                } catch (error) {
                    sap.m.MessageBox.error("Some technical Issue");
                }
            },

            //when u click on edit buuton it loads a fragment
            EditBook: async function () {
                var oSelected = this.byId("idBooksTable").getSelectedItems();
                if (oSelected.length === 0) {
                    MessageToast.show("Please selete atleast one book to edit");
                    return
                }
                if(oSelected.length > 1) {
                    MessageToast.show("Please selete only one book to edit");
                    return
                }
            
                if (oSelected) {
                    var oID = oSelected[0].getBindingContext().getProperty("ID");
                    var oAuthorName = oSelected[0].getBindingContext().getProperty("author");
                    var oBookname = oSelected[0].getBindingContext().getProperty("title");
                    this.oStock = oSelected[0].getBindingContext().getProperty("stock");
                    var oISBN = oSelected[0].getBindingContext().getProperty("ISBN");
                    var ogenre = oSelected[0].getBindingContext().getProperty("genre");
                    var olanguage = oSelected[0].getBindingContext().getProperty("language");
                    this.oAq = oSelected[0].getBindingContext().getProperty("quantityAvailable");
            
                    var newBookModel = new sap.ui.model.json.JSONModel({
                        ID:oID,
                        title: oBookname,
                        author: oAuthorName,
                        ISBN: oISBN,
                        genre: ogenre,
                        stock: this.oStock,
                        language: olanguage,
                        quantityAvailable:this.oAq
                    });
            
                    this.getView().setModel(newBookModel, "newBookModel");
            
                    if (!this.oEditBooksDialog) {
                        this.oEditBooksDialog = await Fragment.load({
                            id: this.getView().getId(),
                            name: "com.app.librarysystem.Fragments.EditBookDialog",
                            controller: this
                        });
                        this.getView().addDependent(this.oEditBooksDialog);
                    }
            
                    this.oEditBooksDialog.open();
                }
            },
            onCloseEdit: function() {
                if (this.oEditBooksDialog.isOpen()) {
                    this.oEditBooksDialog.close();
                }
             },
             onSave: function () {
                console.log(this.oStock)
                console.log(this.oAq)
                var oQ = parseInt(this.getView().byId("idEditBookstockVal").getValue());
                var oAq = parseInt(this.getView().byId("idEditBookquantityAvailableVal").getValue());
                if (this.oStock < oQ) {
                    oQ = oQ - this.oStock
                    oAq = oAq + oQ
                }
                else if (this.oStock > oQ) {
                    oQ = this.oStock - oQ
                    oAq = oAq - oQ
                }
                else {
                    oAq = oAq
                }
                console.log(oQ)
                var oPayload = this.getView().getModel("newBookModel").getData();
                oPayload.quantityAvailable = oAq
                this.getView().getModel("newBookModel").setData(oPayload);
                var oDataModel = this.getOwnerComponent().getModel("ModelV2");// Assuming this is your OData V2 model
                console.log(oDataModel.getMetadata().getName());
 
                try {
 
                    oDataModel.update("/Books(" + oPayload.ID + ")", oPayload, {
                        success: function() {
                            this.getView().byId("idBooksTable").getBinding("items").refresh();
                            this.oEditBooksDialog.close();
                        }.bind(this),
                        error: function(oError) {
                            this.oEditBooksDialog.close();
                            sap.m.MessageBox.error("Failed to update book: " + oError.message);
                        }.bind(this)
                    });
                } catch (error) {
                    this.oEditBooksDialog.close();
                    sap.m.MessageBox.error("Some technical Issue");
                }
                var oDataModel = new sap.ui.model.odata.v2.ODataModel({
                    serviceUrl: "https://port4004-workspaces-ws-2fljr.us10.trial.applicationstudio.cloud.sap/v2/BooksSRV",
                    defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
                    // Configure message parser
                    messageParser: sap.ui.model.odata.ODataMessageParser
                })
             },
             onLogoutbutton1:function () {
                var oRouter=this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteHomeview",{},true);
              },
              // when you click on AllUsers button in Admin page
              PressUsers: function () {
                const oRouter = this.getRouter();
                oRouter.navTo("RouteAllUsers")
            },
              
        });
    }
);