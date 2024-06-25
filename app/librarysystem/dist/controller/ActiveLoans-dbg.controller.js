sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(Controller) {
      "use strict";
  
      return Controller.extend("com.app.librarysystem.controller.ActiveLoans", {
        onInit: function() {
        },
        onpresscloseLoan: async function () {
            console.log(this.byId("idUserLoans").getSelectedItem().getBindingContext().getObject())
            var obj = this.byId("idUserLoans").getSelectedItem().getBindingContext().getObject(),
              oId = obj.books.ID,
              oAvaiable = obj.books.quantityAvailable + 1;
            var aSelectedItems = this.byId("idUserLoans").getSelectedItems();
            console.log()
            const userModel = new sap.ui.model.json.JSONModel({
     
              books: {
                quantityAvailable: oAvaiable
              }
     
            });
            this.getView().setModel(userModel, "userModel");
     
            const oPayload = this.getView().getModel("userModel").getProperty("/"),
              oModel = this.getView().getModel("ModelV2");
             
            try {
              oModel.update("/Books(" + oId + ")", oPayload.books, {
                success: function () {
                  this.getView().byId("idBooksTable").getBinding("items").refresh();//
                  //this.oEditBooksDialog.close();
                },
                error: function (oError) {
                  //this.oEditBooksDialog.close();
                  sap.m.MessageBox.error("Failed to update book: " + oError.message);
                }.bind(this)
              });
            } catch (error) {
              //this.oCreateBooksDialog.close();
              sap.m.MessageBox.error("Some technical Issue");
            };
            this.byId("idUserLoans").getSelectedItem().getBindingContext().delete("$auto");
          },
          onBackbutton:function () {
            var oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAdmin",{},true);
          }
      });
    }
  );