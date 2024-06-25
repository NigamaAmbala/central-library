sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, Filter, FilterOperator, ODataModel, MessageBox, JSONModel) {
        "use strict";

        return Controller.extend("com.app.librarysystem.controller.Homeview", {
            onInit: function () {
                var oModel = new ODataModel("/v2/BooksSRV/");
                this.getView().setModel(oModel);

                const oLocalModel = new JSONModel({
                    username: "",
                    password: "",
                    email: "",
                    phonenumber:"",
                    address:""
                });
                this.getView().setModel(oLocalModel, "localModel");

                
            },
            //admin login credentials to route to admin dash board
            onLoginCredentials: function () {
                var ousername = this.getView().byId("idusernameInput").getValue();
                var opassword = this.getView().byId("idPasswordInput").getValue();
                if (ousername === "admin" && opassword === "admin") {
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteAdmin")
                }
                else {
                    alert("Invalid login Credentials")
                }
            },
            //when you click on admin login it loads fragment
            loginbutton: async function () {
                if (!this.ologinDailog) {
                    this.ologinDailog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.librarysystem.Fragments.loginDialog",
                        controller: this
                    });
                    this.getView().addDependent(this.ologinDailog);
                }

                this.ologinDailog.open();
            },

            onCloseDialog: function () {
                if (this.ologinDailog.isOpen()) {
                    this.ologinDailog.close()
                }
            },
            //when you click on user login it loads a fragment
            Userloginbutton: async function () {
                if (!this.oUserloginDailog) {
                    this.oUserloginDailog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.librarysystem.Fragments.UserloginDailog",
                        controller: this
                    });
                    this.getView().addDependent(this.oUserloginDailog);
                }

                this.oUserloginDailog.open();
            },

            onCloseUserDialog: function () {
                if (this.oUserloginDailog.isOpen()) {
                    this.oUserloginDailog.close()
                }
            },
            //for user credentials to route to user page according to username and password
            onUserLoginCredentials: function () {
                var oView = this.getView();
 
                var sUsername = oView.byId("idusernameInput1").getValue();  //get input value data in oUser variable
                var sPassword = oView.byId("idPasswordInput1").getValue();    //get input value data in oPwd variable
 
                if (!sUsername || !sPassword) {
                    MessageBox.error("please enter username and password.");
                    return
                }
 
                var oModel = this.getView().getModel();
                oModel.read("/Users", {
                    filters: [
                        new Filter("username", FilterOperator.EQ, sUsername),
                        new Filter("password", FilterOperator.EQ, sPassword)
 
                    ],
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            var userId = oData.results[0].ID;
 
                            //MessageBox.success("Login Successful");
 
                            var oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteUser", { ID: userId })
 
                        } else {
                            MessageBox.error("Invalid username or password.")
                        }
                    }.bind(this),
                    error: function () {
                        MessageBox.error("An error occured during login.");
                    }
                })
            },
            //for sign up fragment
            Signbutton: async function () {
                if (!this.oSigninDailog) {
                    this.oSigninDailog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "com.app.librarysystem.Fragments.SigninDialog",
                        controller: this
                    });
                    this.getView().addDependent(this.oSigninDailog);
                }

                this.oSigninDailog.open();
            },

            onCloseSigninDialog: function () {
                if (this.oSigninDailog.isOpen()) {
                    this.oSigninDailog.close()
                }
            },
            //for add new user to the library by clicking sing up in the fragment
            onSignUP:   async function () {
                const oPayload = this.getView().getModel("localModel").getProperty("/"),
                    oModel = this.getView().getModel("ModelV2");
                    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                var phoneRegex=/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/
                if(!(emailRegex.test(oPayload.email)&&phoneRegex.test(oPayload.phonenumber))){
                    MessageBox.success("please enter valid email and phonenumber ")
                    return
                }
                try {
                    await this.createData(oModel, oPayload, "/Users");
                    this.oSigninDailog.close();
                    MessageBox.success("Registration is successful");
                } catch (error) {
                    this.oSigninDailog.close();
                    MessageBox.error("user already exits");
                }
            }
            
        });
    });