sap.ui.define([
    "sap/ui/core/mvc/Controller",

], function (Controller) {
    'use strict';

    return Controller.extend("com.app.librarysystem.controller.BaseController", {
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        createData: function(oModel, oPayload, sPath){
            return new Promise((resolve, reject) => {
                oModel.create(sPath, oPayload, {
                    refreshAfterChange: true,
                    success: function(oSuccessData){
                        resolve(oSuccessData);
                    },
                    error: function(oErrorData){
                        reject(oErrorData)
                    }
                })
            })
        },
        deleteData: function(oModel, sPath, ID){
            return new Promise((resolve, reject) => {
                oModel.remove(`${sPath}/${ID}`, {
                    success: function(oSuccessData){
                        resolve(oSuccessData);
                    },
                    error: function(oErrorData){
                        reject(oErrorData)
                    }
                })
            })            
        }
    })
});