sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/Fragment"
    ],
    function(BaseController, Fragment) {
      "use strict";
  
      return BaseController.extend("com.app.librarysystem.controller.User", {
        onInit: function() {
        const oRouter = this.getOwnerComponent().getRouter();
         oRouter.attachRoutePatternMatched(this.onUserDetailsLoad, this);
        },
        onUserDetailsLoad: function (oEvent) {
          const { ID } = oEvent.getParameter("arguments");
          this.ID = ID;
          // const sRouterName = oEvent.getParameter("name");
          const oObjectPage = this.getView().byId("idUserListPage");
   
          oObjectPage.bindElement(`/Users(${ID})`);
        },
        //when you click on Allbooks button in user dashboard
        AllBooks : function () {
          const userId=this.ID;
          const oRouter = this.getOwnerComponent().getRouter();
           oRouter.navTo("RouteAllBooks", {
            id:userId
           })
      },
      onLogoutbutton:function () {
        var oRouter=this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteHomeview",{},true);
      },
      //loading of notification dailog
      onNotificationFilterPress: async function () {
        if (!this.oNotificationDialog) {
            this.oNotificationDialog = await Fragment.load({
                id: this.getView().getId(),
                name: "com.app.librarysystem.Fragments.NotificationDailog",
                controller: this
            });
            this.getView().addDependent(this.oNotificationDialog);
        }

        this.oNotificationDialog.open();
        const oObjectPage = this.getView().byId("idnotificationDialog");
        oObjectPage.bindElement(`/Users(${this.ID})`);
    },

    onCloseNotificationDialog: function () {
        if (this.oNotificationDialog.isOpen()) {
            this.oNotificationDialog.close()
        }
    },
    formatPhoneNumber: function(phoneNumber) {             
      if (typeof phoneNumber === "string") {                 
      return phoneNumber.replace(/,/g, "");             
      }             
      return phoneNumber; 
      },
      onreservedbooksbutton : async function () {
        if (!this.oReservedbookDailog) {
            this.oReservedbookDailog = await Fragment.load({
                id: this.getView().getId(),
                name: "com.app.librarysystem.Fragments.ReservedBooks",
                controller: this
            });
            this.getView().addDependent(this.oReservedbookDailog);
        }

        this.oReservedbookDailog.open();
    },

    onreservedbookscancelbtn: function () {
        if (this.oReservedbookDailog.isOpen()) {
            this.oReservedbookDailog.close()
        }
    },
      });
    }
  );