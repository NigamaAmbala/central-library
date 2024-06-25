sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(Controller) {
      "use strict";
  
      return Controller.extend("com.app.librarysystem.controller.AllUsers", {
        onInit: function() {
        },
        onBackbutton:function () {
            var oRouter=this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAdmin",{},true);
          },
          formatPhoneNumber: function(phoneNumber) {             
            if (typeof phoneNumber === "string") {                 
            return phoneNumber.replace(/,/g, "");             
            }             
            return phoneNumber; 
            },
      });
    }
  );