sap.ui.define(["sap/ui/core/mvc/Controller"],function(n){"use strict";return n.extend("com.app.librarysystem.controller.AllUsers",{onInit:function(){},onBackbutton:function(){var n=this.getOwnerComponent().getRouter();n.navTo("RouteAdmin",{},true)},formatPhoneNumber:function(n){if(typeof n==="string"){return n.replace(/,/g,"")}return n}})});
//# sourceMappingURL=AllUsers.controller.js.map